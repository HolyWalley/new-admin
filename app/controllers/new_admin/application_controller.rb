module NewAdmin
  class ApplicationController < ActionController::Base
    include ::InertiaRails::Controller

    layout "new_admin/application"

    before_action :authenticate_user!

    rescue_from NewAdmin::AccessDenied, with: :handle_access_denied

    inertia_share do
      all_models = NewAdmin::Introspector.models

      # Filter models to only those the user can list
      visible_models = all_models.select do |mc|
        authorization_adapter.can?(:list, mc.model)
      end

      shared = {
        models: visible_models.map do |mc|
          summary = mc.to_summary_h
          summary[:permissions] = authorization_adapter.permissions_for(mc.model)
          summary
        end,
        flash: { success: flash[:notice], error: flash[:alert] }.compact,
      }

      # Share current user info if available
      if (user = new_admin_current_user)
        shared[:current_user] = {
          id: user.id,
          name: user.try(:name) || user.try(:to_s) || "User",
          email: user.try(:email),
        }
      end

      shared
    end

    private

    # Authentication: calls the configured block in controller context
    def authenticate_user!
      auth_block = NewAdmin.configuration.authentication_block
      return unless auth_block

      instance_eval(&auth_block)
    end

    # Resolves the current user via configured method or fallback.
    # Supports both `config.current_user_method(&:current_user)` (Symbol#to_proc, arity=1)
    # and `config.current_user_method { current_user }` (block, arity=0).
    def new_admin_current_user
      user_proc = NewAdmin.configuration.current_user_proc
      if user_proc
        if user_proc.arity == 0
          instance_exec(&user_proc)
        else
          user_proc.call(self)
        end
      elsif respond_to?(:current_user, true)
        current_user
      end
    end

    # Authorization adapter (lazily built per request)
    def authorization_adapter
      @authorization_adapter ||= NewAdmin.configuration.build_authorization_adapter(self)
    end

    def can?(action, subject)
      authorization_adapter.can?(action, subject)
    end

    def authorize_action!(action, subject)
      raise NewAdmin::AccessDenied, "Not authorized to #{action} #{subject}" unless can?(action, subject)
    end

    def handle_access_denied(_exception)
      redirect_back fallback_location: new_admin.root_path,
        alert: "You are not authorized to perform this action."
    end
  end
end

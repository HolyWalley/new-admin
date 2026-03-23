module NewAdmin
  class ApplicationController < ActionController::Base
    include ::InertiaRails::Controller

    layout "new_admin/application"

    inertia_share do
      shared = {
        models: NewAdmin::Introspector.models.map(&:to_summary_h),
        flash: { success: flash[:notice], error: flash[:alert] }.compact,
      }

      # Share current user info if available (Devise or custom auth)
      if respond_to?(:current_user, true) && current_user.present?
        user = current_user
        shared[:current_user] = {
          id: user.id,
          name: user.try(:name) || user.try(:to_s) || "User",
          email: user.try(:email),
        }
      end

      shared
    end
  end
end

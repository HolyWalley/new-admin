# frozen_string_literal: true

module NewAdmin
  class ActionsController < ApplicationController
    before_action :set_model_config
    before_action :set_action_config
    before_action :set_record, only: [:member_get, :member_post]
    before_action :authorize_custom_action!

    inertia_share do
      { current_model: @model_config&.name }
    end

    # GET /new-admin/:model_name/:id/actions/:action_name
    def member_get
      handle_get_request
    end

    # POST /new-admin/:model_name/:id/actions/:action_name
    def member_post
      execute_handler
    end

    # GET /new-admin/:model_name/actions/:action_name
    def collection_get
      handle_get_request
    end

    # POST /new-admin/:model_name/actions/:action_name
    def collection_post
      execute_handler
    end

    private

    def set_model_config
      @model_config = NewAdmin::Introspector.model_for(params[:model_name])
      raise ActionController::RoutingError, "Model not found: #{params[:model_name]}" unless @model_config
    end

    def set_action_config
      @action_config = NewAdmin.configuration.action_configs[params[:action_name]]
      raise ActionController::RoutingError, "Action not found: #{params[:action_name]}" unless @action_config

      unless @action_config.applies_to?(@model_config.model)
        raise ActionController::RoutingError,
              "Action '#{params[:action_name]}' does not apply to #{@model_config.name}"
      end
    end

    def set_record
      @record = @model_config.model.find(params[:id])
    end

    def authorize_custom_action!
      permission = @action_config.member? ? :update : :list
      subject = @record || @model_config.model
      authorize_action!(permission, subject)
    end

    def handle_get_request
      case @action_config.display_mode
      when :page
        result = execute_handler_for_get
        props = {
          model: @model_config.to_h,
          action: @action_config.to_h,
        }
        props[:record] = serialize_record(@record) if @record
        props[:handler_data] = result if result.is_a?(Hash)

        render inertia: "Resource/Action", props: props
      when :modal
        result = execute_handler_for_get
        data = { action: @action_config.to_h }
        data[:record] = serialize_record(@record) if @record
        data.merge!(result) if result.is_a?(Hash)

        render json: data
      else
        head :method_not_allowed
      end
    end

    def execute_handler_for_get
      return nil unless @action_config.has_handler? && @action_config.http_method_list.include?(:get)

      context = HandlerContext.new(
        record: @record,
        scope: @model_config.model.all,
        params: params,
        request: request,
        current_user: new_admin_current_user
      )
      context.instance_exec(&@action_config.handler_proc)
    end

    def execute_handler
      unless @action_config.has_handler?
        render json: { error: "No handler defined for action: #{@action_config.name}" },
               status: :unprocessable_entity
        return
      end

      context = HandlerContext.new(
        record: @record,
        scope: @model_config.model.all,
        params: params,
        request: request,
        current_user: new_admin_current_user
      )
      result = context.instance_exec(&@action_config.handler_proc)

      respond_to_handler_result(result)
    end

    def respond_to_handler_result(result)
      result = {} unless result.is_a?(Hash)

      if result[:download]
        send_data result[:download][:data],
                  filename: result[:download][:filename],
                  type: result[:download][:content_type] || "application/octet-stream"
      elsif result[:redirect]
        redirect_to result[:redirect], notice: result[:success]
      elsif result[:error]
        redirect_back fallback_location: new_admin.root_path, alert: result[:error]
      else
        redirect_back fallback_location: new_admin.root_path,
                      notice: result[:success] || "Action completed"
      end
    end

    def serialize_record(record)
      row = { id: record.id, display_name: @model_config.display_name_for(record) }
      @model_config.columns.each do |col|
        row[col.name] = record.read_attribute(col.name)
      end
      row
    end
  end
end

# frozen_string_literal: true

module NewAdmin
  class Configuration
    attr_reader :model_configurations, :authentication_block, :current_user_proc,
                :authorization_adapter_name, :authorization_block

    def initialize
      @model_configurations = {}
      @authentication_block = nil
      @current_user_proc = nil
      @authorization_adapter_name = nil
      @authorization_block = nil
    end

    def model(model_name, &block)
      config = ModelConfiguration.new(model_name)
      config.instance_eval(&block) if block
      @model_configurations[model_name] = config
    end

    def model_config_for(model_name)
      @model_configurations[model_name]
    end

    # Authentication DSL
    # config.authenticate_with { warden.authenticate! scope: :user }
    def authenticate_with(&block)
      @authentication_block = block
    end

    # config.current_user_method(&:current_user)
    def current_user_method(&block)
      @current_user_proc = block
    end

    # Authorization DSL
    # config.authorize_with :pundit
    # config.authorize_with :cancancan
    # config.authorize_with { |user, action, subject| user.admin? }
    def authorize_with(adapter_name = nil, &block)
      if block_given? && adapter_name.nil?
        @authorization_adapter_name = :block
        @authorization_block = block
      else
        @authorization_adapter_name = adapter_name
      end
    end

    def build_authorization_adapter(controller)
      case @authorization_adapter_name
      when :pundit
        Authorization::PunditAdapter.new(controller)
      when :cancancan
        Authorization::CancancanAdapter.new(controller)
      when :block
        Authorization::BlockAdapter.new(controller, @authorization_block)
      when nil
        Authorization::Base.new(controller)
      else
        raise ArgumentError, "Unknown authorization adapter: #{@authorization_adapter_name}"
      end
    end
  end
end

# frozen_string_literal: true

module NewAdmin
  class Configuration
    attr_reader :model_configurations

    def initialize
      @model_configurations = {}
    end

    def model(model_name, &block)
      config = ModelConfiguration.new(model_name)
      config.instance_eval(&block) if block
      @model_configurations[model_name] = config
    end

    def model_config_for(model_name)
      @model_configurations[model_name]
    end
  end
end

# frozen_string_literal: true

module NewAdmin
  class ModelConfiguration
    attr_reader :model_name

    def initialize(model_name)
      @model_name = model_name
      @view_configurations = {}
    end

    def list(&block)
      vc = ViewConfiguration.new(:list)
      vc.instance_eval(&block)
      @view_configurations[:list] = vc
    end

    def edit(&block)
      vc = ViewConfiguration.new(:edit)
      vc.instance_eval(&block)
      @view_configurations[:edit] = vc
    end

    def show(&block)
      vc = ViewConfiguration.new(:show)
      vc.instance_eval(&block)
      @view_configurations[:show] = vc
    end

    def view_config_for(view_name)
      @view_configurations[view_name.to_sym]
    end
  end
end

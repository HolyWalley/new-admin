# frozen_string_literal: true

module NewAdmin
  class ModelConfiguration
    attr_reader :model_name, :nav_label, :nav_icon, :nav_weight, :nav_visible

    def initialize(model_name)
      @model_name = model_name
      @view_configurations = {}
      @nav_label = nil
      @nav_icon = nil
      @nav_weight = 0
      @nav_visible = true
    end

    def navigation_label(label)
      @nav_label = label
    end

    def navigation_icon(icon)
      @nav_icon = icon
    end

    def weight(w)
      @nav_weight = w
    end

    def visible(v)
      @nav_visible = v
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

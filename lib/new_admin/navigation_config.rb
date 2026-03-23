# frozen_string_literal: true

module NewAdmin
  class NavigationConfig
    attr_reader :groups

    def initialize
      @groups = []
    end

    def group(label, &block)
      g = NavigationGroup.new(label)
      g.instance_eval(&block)
      @groups << g
    end
  end

  class NavigationGroup
    attr_reader :label, :model_names

    def initialize(label)
      @label = label
      @model_names = []
    end

    def model(name)
      @model_names << name
    end
  end
end

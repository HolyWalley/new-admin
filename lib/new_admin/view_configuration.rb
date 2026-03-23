# frozen_string_literal: true

module NewAdmin
  class ViewConfiguration
    attr_reader :view_name, :field_declarations, :exclusions

    def initialize(view_name)
      @view_name = view_name
      @field_declarations = []
      @exclusions = Set.new
    end

    def field(name, **options)
      @field_declarations << FieldDeclaration.new(name.to_s, options)
    end

    def exclude(name)
      @exclusions << name.to_s
    end

    def configured?
      @field_declarations.any? || @exclusions.any?
    end
  end

  class FieldDeclaration
    attr_reader :name, :label, :help

    def initialize(name, options = {})
      @name = name
      @label = options[:label]
      @help = options[:help]
    end
  end
end

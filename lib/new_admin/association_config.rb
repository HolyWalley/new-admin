# frozen_string_literal: true

module NewAdmin
  class AssociationConfig
    attr_reader :name, :macro, :target_model_name, :foreign_key,
                :through, :source, :dependent

    def initialize(model, reflection)
      @model = model
      @reflection = reflection
      @name = reflection.name.to_s
      @macro = resolve_macro(reflection)
      @target_model_name = resolve_target(reflection)
      @foreign_key = reflection.foreign_key&.to_s
      @through = reflection.options[:through]&.to_s
      @source = reflection.options[:source]&.to_s
      @dependent = reflection.options[:dependent]&.to_s
    end

    def polymorphic?
      @reflection.options[:polymorphic] == true
    end

    def through?
      @macro == :has_many_through
    end

    def nested_attributes?
      @model.nested_attributes_options.key?(@name.to_sym)
    end

    def to_h
      h = {
        name: @name,
        type: @macro,
        target_model: @target_model_name,
      }
      h[:foreign_key] = @foreign_key if @foreign_key
      h[:polymorphic] = true if polymorphic?
      h[:through] = @through if through?
      h[:nested_attributes] = true if nested_attributes?
      h[:dependent] = @dependent if @dependent.present?
      h
    end

    private

    def resolve_macro(reflection)
      if reflection.macro == :has_many && reflection.options[:through]
        :has_many_through
      else
        reflection.macro
      end
    end

    def resolve_target(reflection)
      return nil if polymorphic?

      reflection.klass.name
    rescue NameError
      reflection.class_name
    end
  end
end

# frozen_string_literal: true

module NewAdmin
  class ActionConfig
    attr_reader :name, :scope_type, :icon_name, :label_text, :confirm_text,
                :display_mode, :only_models, :except_models,
                :http_method_list, :visible_proc, :handler_proc

    def initialize(name)
      @name = name.to_s
      @scope_type = :member
      @icon_name = nil
      @label_text = name.to_s.humanize
      @confirm_text = nil
      @display_mode = :inline
      @only_models = []
      @except_models = []
      @http_method_list = [:post]
      @visible_proc = nil
      @handler_proc = nil
    end

    # DSL methods — called inside config.action block
    def member
      @scope_type = :member
    end

    def collection
      @scope_type = :collection
    end

    def icon(name)
      @icon_name = name
    end

    def label(text)
      @label_text = text
    end

    def confirm(msg)
      @confirm_text = msg
    end

    def display(mode)
      raise ArgumentError, "display must be :inline, :modal, or :page" unless %i[inline modal page].include?(mode)

      @display_mode = mode
    end

    def only(*models)
      @only_models = models.flatten
    end

    def except(*models)
      @except_models = models.flatten
    end

    def http_methods(*methods)
      @http_method_list = methods.flatten.map(&:to_sym)
    end

    def visible(&block)
      @visible_proc = block
    end

    def handler(&block)
      @handler_proc = block
    end

    # Query methods
    def member?
      @scope_type == :member
    end

    def collection?
      @scope_type == :collection
    end

    def has_handler?
      @handler_proc != nil
    end

    # Check if this action applies to a given model class
    def applies_to?(model_class)
      model_name = model_class.is_a?(String) ? model_class : model_class.name
      if @only_models.any?
        @only_models.any? { |m| m.is_a?(String) ? m == model_name : m.name == model_name }
      elsif @except_models.any?
        @except_models.none? { |m| m.is_a?(String) ? m == model_name : m.name == model_name }
      else
        true
      end
    end

    # Check visibility for a specific record/model + user
    def visible_for?(record_or_model, user)
      return true unless @visible_proc

      @visible_proc.call(record_or_model, user)
    end

    # Serialize for Inertia sharing (metadata only, no procs)
    def to_h
      {
        name: @name,
        scope: @scope_type.to_s,
        icon: @icon_name,
        label: @label_text,
        confirm: @confirm_text,
        display: @display_mode.to_s,
        http_methods: @http_method_list.map(&:to_s),
        has_handler: has_handler?,
      }
    end
  end
end

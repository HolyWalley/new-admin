# frozen_string_literal: true

module NewAdmin
  class ModelConfig
    attr_reader :model

    def initialize(model)
      @model = model
    end

    def name
      @model.name
    end

    def param_key
      name.underscore.tr("/", "~")
    end

    def table_name
      @model.table_name
    end

    def primary_key
      @model.primary_key
    end

    def sti?
      @model.column_names.include?(@model.inheritance_column) &&
        @model.base_class != @model
    end

    def sti_base?
      @model.column_names.include?(@model.inheritance_column) &&
        @model.base_class == @model &&
        @model.descendants.any?
    end

    def abstract?
      @model.abstract_class?
    end

    def count
      @count ||= @model.count
    rescue StandardError
      0
    end

    def columns
      @columns ||= build_columns
    end

    def associations
      @associations ||= build_associations
    end

    def enums
      @model.defined_enums
    end

    def validations
      @validations ||= build_validations
    end

    def rich_text_attributes
      @rich_text_attributes ||= @model.reflect_on_all_associations(:has_one)
        .select { |a| a.class_name == "ActionText::RichText" }
        .map { |a| a.name.to_s.delete_prefix("rich_text_") }
    end

    def attachment_attributes
      @attachment_attributes ||= begin
        one = @model.reflect_on_all_attachments
          .select { |a| a.macro == :has_one_attached }
          .map { |a| { name: a.name.to_s, multiple: false } }
        many = @model.reflect_on_all_attachments
          .select { |a| a.macro == :has_many_attached }
          .map { |a| { name: a.name.to_s, multiple: true } }
        one + many
      rescue NoMethodError
        []
      end
    end

    DISPLAY_CANDIDATES = %w[name title label number email slug].freeze

    def to_s_method
      if @model.instance_methods(false).include?(:to_s)
        :to_s
      elsif (col = DISPLAY_CANDIDATES.find { |c| columns.any? { |cc| cc.name == c } })
        col.to_sym
      else
        :id
      end
    end

    # Resolve a human-readable display name for a record of this model
    def display_name_for(record)
      record.send(to_s_method).to_s
    rescue StandardError
      "#{name} ##{record.id}"
    end

    def to_h
      {
        name: name,
        param_key: param_key,
        table_name: table_name,
        primary_key: primary_key,
        count: count,
        sti: sti?,
        sti_base: sti_base?,
        to_s_method: to_s_method,
        columns: columns.map(&:to_h),
        associations: associations.map(&:to_h),
        enums: enums.transform_values(&:keys),
        rich_text_attributes: rich_text_attributes,
        attachment_attributes: attachment_attributes,
      }
    end

    def navigation_group
      # STI children grouped under their base class
      if sti?
        @model.base_class.name
      # Namespaced models grouped by their namespace
      elsif name.include?("::")
        name.deconstantize
      else
        nil
      end
    end

    def to_summary_h
      {
        name: name,
        param_key: param_key,
        count: count,
        navigation_group: navigation_group,
        sti: sti?,
        sti_base: sti_base?,
      }
    end

    private

    def build_columns
      @model.columns.map { |col| ColumnConfig.new(@model, col) }
    end

    def build_associations
      @model.reflect_on_all_associations
        .reject { |a| a.class_name == "ActionText::RichText" }
        .reject { |a| a.class_name&.start_with?("ActiveStorage::") }
        .map { |a| AssociationConfig.new(@model, a) }
    end

    def build_validations
      @model.validators.map do |v|
        {
          type: v.class.name.demodulize.underscore.delete_suffix("_validator"),
          attributes: v.attributes.map(&:to_s),
          options: v.options.except(:if, :unless),
        }
      end
    end
  end
end

# frozen_string_literal: true

module NewAdmin
  class FieldResolver
    # Devise columns and other auto-managed columns excluded from edit views
    EDIT_EXCLUDED_COLUMNS = %w[
      id created_at updated_at
      encrypted_password reset_password_token reset_password_sent_at remember_created_at
    ].freeze

    def initialize(model_config, model_configuration = nil)
      @model_config = model_config
      @dsl_config = model_configuration
    end

    # Returns array of enriched column hashes ready for frontend consumption.
    # Each hash is a ColumnConfig#to_h with optional :label and :help additions.
    def columns_for(view_name)
      view_config = @dsl_config&.view_config_for(view_name)

      if view_config && view_config.field_declarations.any?
        resolve_explicit_fields(view_config)
      elsif view_config && view_config.exclusions.any?
        resolve_with_exclusions(view_name, view_config)
      else
        resolve_defaults(view_name)
      end
    end

    private

    def resolve_explicit_fields(view_config)
      columns_by_name = @model_config.columns.index_by(&:name)
      assoc_fk_map = build_assoc_fk_map

      view_config.field_declarations.filter_map do |fd|
        # Direct column match
        if columns_by_name[fd.name]
          enrich_column(columns_by_name[fd.name], fd)
        # Association name -> FK column (e.g., :user -> user_id)
        elsif assoc_fk_map[fd.name]
          fk_name = assoc_fk_map[fd.name]
          col = columns_by_name[fk_name]
          enrich_column(col, fd) if col
        # Association field (has_many, has_one, etc.) — not a column, skip
        elsif @model_config.associations.any? { |a| a.name == fd.name }
          nil
        else
          Rails.logger.warn "[NewAdmin] DSL field :#{fd.name} does not exist on #{@model_config.name}"
          nil
        end
      end
    end

    def resolve_with_exclusions(view_name, view_config)
      default_columns_for(view_name)
        .reject { |col| view_config.exclusions.include?(col.name) }
        .map { |col| enrich_column(col, nil) }
    end

    def resolve_defaults(view_name)
      default_columns_for(view_name).map { |col| enrich_column(col, nil) }
    end

    def default_columns_for(view_name)
      case view_name.to_sym
      when :list
        @model_config.columns.reject { |c| [:text, :binary].include?(c.type) }
      when :edit
        @model_config.columns.reject do |col|
          col.primary_key? ||
            col.name.in?(EDIT_EXCLUDED_COLUMNS) ||
            (col.name == @model_config.model.inheritance_column && @model_config.sti?)
        end
      when :show
        @model_config.columns
      else
        @model_config.columns
      end
    end

    def enrich_column(col, field_declaration)
      h = col.to_h
      if field_declaration
        h[:label] = field_declaration.label if field_declaration.label
        h[:help] = field_declaration.help if field_declaration.help
      end
      h
    end

    # Maps belongs_to association name -> foreign key column name
    # e.g., "user" -> "user_id", "category" -> "category_id"
    def build_assoc_fk_map
      @model_config.associations
        .select { |a| a.macro == :belongs_to }
        .each_with_object({}) { |a, map| map[a.name] = a.foreign_key }
    end
  end
end

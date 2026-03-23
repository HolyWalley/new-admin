# frozen_string_literal: true

module NewAdmin
  class ColumnConfig
    attr_reader :name, :type, :sql_type, :nullable, :default, :limit,
                :precision, :scale

    def initialize(model, column)
      @model = model
      @column = column
      @name = column.name
      @type = resolve_type(model, column)
      @sql_type = column.sql_type
      @nullable = column.null
      @default = column.default
      @limit = column.limit
      @precision = column.precision
      @scale = column.scale
    end

    def enum?
      @type == :enum
    end

    def rich_text?
      @type == :rich_text
    end

    def attachment?
      @type == :attachment
    end

    def virtual?
      false
    end

    def primary_key?
      @name == @model.primary_key
    end

    def foreign_key?
      @model.reflect_on_all_associations(:belongs_to).any? { |a| a.foreign_key.to_s == @name }
    end

    def enum_values
      return nil unless enum?

      @model.defined_enums[@name]
    end

    def to_h
      h = {
        name: @name,
        type: @type,
        nullable: @nullable,
        primary_key: primary_key?,
      }
      h[:default] = @default if @default
      h[:limit] = @limit if @limit
      h[:enum_values] = enum_values&.keys if enum?
      h[:foreign_key] = true if foreign_key?
      h
    end

    private

    def resolve_type(model, column)
      return :enum if model.defined_enums.key?(column.name)

      case column.type
      when :string    then :string
      when :text      then :text
      when :integer   then :integer
      when :decimal   then :decimal
      when :float     then :float
      when :boolean   then :boolean
      when :date      then :date
      when :datetime  then :datetime
      when :time      then :time
      when :binary    then :binary
      when :json, :jsonb then :json
      else column.type
      end
    end
  end
end

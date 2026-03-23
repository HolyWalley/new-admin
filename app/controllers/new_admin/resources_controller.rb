# frozen_string_literal: true

module NewAdmin
  class ResourcesController < ApplicationController
    before_action :set_model_config
    before_action :set_record, only: [:show, :edit, :update, :destroy]

    inertia_share do
      { current_model: @model_config&.name }
    end

    EXCLUDED_COLUMNS = %w[
      encrypted_password reset_password_token reset_password_sent_at remember_created_at
    ].freeze

    def index
      scope = @model_config.model.all

      # Sorting
      sort_column = valid_sort_column(params[:sort]) || @model_config.primary_key
      sort_direction = params[:direction] == "asc" ? "asc" : "desc"
      scope = scope.reorder(Arel.sql("#{@model_config.model.table_name}.#{sort_column} #{sort_direction}"))

      # Pagination
      page = [params[:page].to_i, 1].max
      per_page = 20
      total = scope.count
      records = scope.offset((page - 1) * per_page).limit(per_page)

      render inertia: "Resource/Index", props: {
        model: model_metadata,
        records: serialize_records_for_list(records),
        pagination: {
          page: page,
          per_page: per_page,
          total: total,
          total_pages: [(total.to_f / per_page).ceil, 1].max,
        },
        sort: { column: sort_column, direction: sort_direction },
      }
    end

    def show
      render inertia: "Resource/Show", props: {
        model: model_metadata,
        record: serialize_record_for_show(@record),
        associations: serialize_associations(@record),
      }
    end

    def new
      render inertia: "Resource/New", props: {
        model: model_metadata,
        record: default_values,
        association_options: association_options_for_form,
        errors: {},
      }
    end

    def create
      record = @model_config.model.new(permitted_params)

      if record.save
        redirect_to resources_path(params[:model_name]),
          notice: "#{@model_config.name} successfully created"
      else
        render inertia: "Resource/New", props: {
          model: model_metadata,
          record: permitted_params.to_h,
          association_options: association_options_for_form,
          errors: record.errors.to_hash(true),
        }
      end
    end

    def edit
      render inertia: "Resource/Edit", props: {
        model: model_metadata,
        record: serialize_record_for_form(@record),
        association_options: association_options_for_form,
        errors: {},
      }
    end

    def update
      if @record.update(permitted_params)
        redirect_to resources_path(params[:model_name]),
          notice: "#{@model_config.name} successfully updated"
      else
        render inertia: "Resource/Edit", props: {
          model: model_metadata,
          record: serialize_record_for_form(@record),
          association_options: association_options_for_form,
          errors: @record.errors.to_hash(true),
        }
      end
    end

    def destroy
      @record.destroy!
      redirect_to resources_path(params[:model_name]),
        notice: "#{@model_config.name} successfully deleted"
    rescue ActiveRecord::DeleteRestrictionError => e
      redirect_to resources_path(params[:model_name]),
        alert: e.message
    end

    private

    def set_model_config
      @model_config = NewAdmin::Introspector.model_for(params[:model_name])
      raise ActionController::RoutingError, "Model not found: #{params[:model_name]}" unless @model_config
    end

    def set_record
      @record = @model_config.model.find(params[:id])
    end

    def model_metadata
      @model_config.to_h
    end

    def editable_columns
      @editable_columns ||= @model_config.columns.reject do |col|
        col.primary_key? ||
          col.name.in?(%w[created_at updated_at]) ||
          col.name.in?(EXCLUDED_COLUMNS) ||
          (col.name == @model_config.model.inheritance_column && @model_config.sti?)
      end
    end

    def list_columns
      @list_columns ||= @model_config.columns.reject { |c| [:text, :binary].include?(c.type) }
    end

    def permitted_params
      allowed = editable_columns.map { |c| c.name.to_sym }
      params.require(@model_config.param_key.to_sym).permit(*allowed)
    end

    def valid_sort_column(col)
      return nil if col.blank?
      @model_config.columns.any? { |c| c.name == col } ? col : nil
    end

    def serialize_records_for_list(records)
      records.map do |record|
        row = { id: record.id, display_name: record.send(@model_config.to_s_method).to_s }
        list_columns.each do |col|
          row[col.name] = read_column_value(record, col)
        end
        row
      end
    end

    def serialize_record_for_show(record)
      row = { id: record.id, display_name: record.send(@model_config.to_s_method).to_s }
      @model_config.columns.each do |col|
        row[col.name] = read_column_value(record, col)
      end
      row
    end

    def serialize_record_for_form(record)
      row = { id: record.id }
      editable_columns.each do |col|
        row[col.name] = read_column_value(record, col)
      end
      row
    end

    def read_column_value(record, col)
      if col.enum?
        record.send(col.name)
      else
        record.read_attribute(col.name)
      end
    end

    def default_values
      row = {}
      editable_columns.each do |col|
        row[col.name] = col.default
      end
      row
    end

    def association_options_for_form
      @model_config.associations
        .select { |a| a.macro == :belongs_to && !a.polymorphic? }
        .each_with_object({}) do |assoc, hash|
          target_config = NewAdmin::Introspector.models.find { |m| m.name == assoc.target_model_name }
          next unless target_config

          records = target_config.model.limit(100).map do |r|
            { id: r.id, label: r.send(target_config.to_s_method).to_s }
          end
          hash[assoc.foreign_key] = records
        end
    end

    def serialize_associations(record)
      @model_config.associations.map do |assoc|
        data = { name: assoc.name, type: assoc.macro, target_model: assoc.target_model_name }

        case assoc.macro
        when :belongs_to
          unless assoc.polymorphic?
            related = record.send(assoc.name) rescue nil
            if related
              target_config = NewAdmin::Introspector.models.find { |m| m.name == related.class.name }
              data[:record] = {
                id: related.id,
                display_name: related.respond_to?(@model_config.to_s_method) ? related.send(@model_config.to_s_method).to_s : related.to_s,
                param_key: target_config&.param_key,
              }
            end
          end
        when :has_many, :has_many_through
          data[:count] = record.send(assoc.name).count rescue 0
        when :has_one
          related = record.send(assoc.name) rescue nil
          if related
            target_config = NewAdmin::Introspector.models.find { |m| m.name == related.class.name }
            data[:record] = {
              id: related.id,
              display_name: related.to_s,
              param_key: target_config&.param_key,
            }
          end
        end

        data
      end
    end

    # Use flash keys that work with redirect_to notice/alert
    def flash_messages
      { success: flash[:notice], error: flash[:alert] }.compact
    end
  end
end

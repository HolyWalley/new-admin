# frozen_string_literal: true

module NewAdmin
  class ResourcesController < ApplicationController
    before_action :set_model_config
    before_action :set_record, only: [:show, :edit, :update, :destroy, :delete_confirmation]

    inertia_share do
      { current_model: @model_config&.name }
    end

    EXCLUDED_COLUMNS = %w[
      encrypted_password reset_password_token reset_password_sent_at remember_created_at
    ].freeze

    def index
      scope = @model_config.model.all
      table = @model_config.model.table_name

      # Global search across string/text columns
      if params[:q].present?
        searchable = @model_config.columns.select { |c| [:string, :text].include?(c.type) }
        if searchable.any?
          conditions = searchable.map { |c| "#{table}.#{c.name} LIKE :q" }.join(" OR ")
          scope = scope.where(conditions, q: "%#{params[:q]}%")
        end
      end

      # Per-column filters (indexed array: f[0][c]=col, f[0][o]=op, f[0][v]=val, f[0][v2]=val2)
      if params[:f].is_a?(ActionController::Parameters)
        params[:f].values.each do |rule|
          next unless rule.is_a?(ActionController::Parameters)

          col_name = rule[:c].to_s
          operator = rule[:o].to_s
          value = rule[:v].to_s
          value2 = rule[:v2].to_s

          col = @model_config.columns.find { |c| c.name == col_name }
          next unless col

          scope = apply_filter(scope, table, col_name, operator, value, value2)
        end
      end

      # Sorting
      sort_column = valid_sort_column(params[:sort]) || @model_config.primary_key
      sort_direction = params[:direction] == "asc" ? "asc" : "desc"
      scope = scope.reorder(Arel.sql("#{table}.#{sort_column} #{sort_direction}"))

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
        search: params[:q].to_s,
        filters: sanitized_filters,
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
        has_many_through_options: has_many_through_options_for_form,
        polymorphic_options: polymorphic_options_for_form,
        nested_form_config: nested_form_config,
        nested_form_data: {},
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
          has_many_through_options: has_many_through_options_for_form,
          polymorphic_options: polymorphic_options_for_form,
          nested_form_config: nested_form_config,
          nested_form_data: {},
          errors: record.errors.to_hash(true),
        }
      end
    end

    def edit
      render inertia: "Resource/Edit", props: {
        model: model_metadata,
        record: serialize_record_for_form(@record),
        association_options: association_options_for_form,
        has_many_through_options: has_many_through_options_for_form,
        polymorphic_options: polymorphic_options_for_form,
        nested_form_config: nested_form_config,
        nested_form_data: nested_form_data_for(@record),
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
          has_many_through_options: has_many_through_options_for_form,
          polymorphic_options: polymorphic_options_for_form,
          nested_form_config: nested_form_config,
          nested_form_data: nested_form_data_for(@record),
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

    def bulk_destroy
      ids = params[:bulk_ids]
      if ids.present?
        count = @model_config.model.where(id: ids).destroy_all.size
        redirect_to resources_path(params[:model_name]),
          notice: "#{count} #{count == 1 ? 'record' : 'records'} deleted"
      else
        redirect_to resources_path(params[:model_name]),
          alert: "No records selected"
      end
    end

    def delete_confirmation
      render json: build_cascade_info(@record, @model_config)
    end

    private

    def build_cascade_info(record, model_config, visited = Set.new)
      # Prevent infinite loops from circular associations
      key = "#{model_config.name}##{record.id}"
      return { cascades: [], restrict: [] } if visited.include?(key)
      visited.add(key)

      cascades = []
      restrict = []

      model_config.associations.each do |assoc|
        next unless [:has_many, :has_many_through, :has_one].include?(assoc.macro)
        next if assoc.dependent.blank?

        dep = assoc.dependent.to_s

        case dep
        when "destroy", "delete_all", "destroy_async"
          related = record.send(assoc.name)
          count = assoc.macro == :has_one ? (related ? 1 : 0) : (related.count rescue 0)
          next if count == 0

          entry = {
            association: assoc.name,
            model: assoc.target_model_name,
            count: count,
            dependent: dep,
          }

          # Recursively check children for dependent: :destroy
          if dep == "destroy" && assoc.target_model_name
            target_config = NewAdmin::Introspector.models.find { |m| m.name == assoc.target_model_name }
            if target_config
              child_cascades = []
              # Sample first related record for recursive check
              sample = assoc.macro == :has_one ? related : related.first
              if sample
                child_info = build_cascade_info(sample, target_config, visited)
                child_cascades = child_info[:cascades] if child_info[:cascades].any?
              end
              entry[:children] = child_cascades if child_cascades.any?
            end
          end

          cascades << entry

        when "restrict_with_error", "restrict_with_exception"
          related = record.send(assoc.name)
          count = assoc.macro == :has_one ? (related ? 1 : 0) : (related.count rescue 0)
          next if count == 0

          restrict << {
            association: assoc.name,
            model: assoc.target_model_name,
            count: count,
            dependent: dep,
          }

        when "nullify"
          # Nullify doesn't delete anything, but worth mentioning
          related = record.send(assoc.name)
          count = assoc.macro == :has_one ? (related ? 1 : 0) : (related.count rescue 0)
          next if count == 0

          cascades << {
            association: assoc.name,
            model: assoc.target_model_name,
            count: count,
            dependent: "nullify",
          }
        end
      end

      {
        record: { display_name: record.send(model_config.to_s_method).to_s, model: model_config.name },
        cascades: cascades,
        restrict: restrict,
      }
    end

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

      # Allow has_many :through ID arrays (e.g., tag_ids: [])
      array_params = {}
      through_associations.each do |assoc|
        ids_field = "#{assoc.name.singularize}_ids"
        array_params[ids_field.to_sym] = []
      end

      # Allow ActiveStorage attachment params
      @model_config.attachment_attributes.each do |att|
        allowed << att[:name].to_sym
      end

      # Allow ActionText rich text params
      @model_config.rich_text_attributes.each do |attr_name|
        allowed << attr_name.to_sym
      end

      # Allow nested attributes
      nested_associations.each do |assoc|
        target_config = NewAdmin::Introspector.models.find { |m| m.name == assoc.target_model_name }
        next unless target_config

        nested_fields = target_config.columns
          .reject { |c| c.primary_key? || c.name.in?(%w[created_at updated_at]) }
          .map { |c| c.name.to_sym }
        nested_fields << :id << :_destroy
        array_params["#{assoc.name}_attributes".to_sym] = nested_fields
      end

      params.require(@model_config.param_key.to_sym).permit(*allowed, **array_params)
    end

    def sanitized_filters
      return [] unless params[:f].is_a?(ActionController::Parameters)

      valid_columns = @model_config.columns.map(&:name)
      params[:f].values.filter_map do |rule|
        next unless rule.is_a?(ActionController::Parameters)

        col_name = rule[:c].to_s
        next unless valid_columns.include?(col_name)

        entry = { column: col_name, operator: rule[:o].to_s, value: rule[:v].to_s }
        entry[:value2] = rule[:v2].to_s if rule[:v2].present?
        entry
      end
    end

    def apply_filter(scope, table, col_name, operator, value, value2)
      case operator
      when "contains"
        scope.where("#{table}.#{col_name} LIKE ?", "%#{value}%")
      when "not_contains"
        scope.where.not("#{table}.#{col_name} LIKE ?", "%#{value}%")
      when "is", "eq"
        scope.where("#{table}.#{col_name}" => value)
      when "starts_with"
        scope.where("#{table}.#{col_name} LIKE ?", "#{value}%")
      when "ends_with"
        scope.where("#{table}.#{col_name} LIKE ?", "%#{value}")
      when "lt"
        scope.where("#{table}.#{col_name} < ?", value)
      when "gt"
        scope.where("#{table}.#{col_name} > ?", value)
      when "between"
        scope.where("#{table}.#{col_name} BETWEEN ? AND ?", value, value2)
      when "true"
        scope.where("#{table}.#{col_name}" => true)
      when "false"
        scope.where("#{table}.#{col_name}" => false)
      when "today"
        scope.where("#{table}.#{col_name}" => Date.current.all_day)
      when "yesterday"
        scope.where("#{table}.#{col_name}" => Date.yesterday.all_day)
      when "this_week"
        scope.where("#{table}.#{col_name}" => Date.current.beginning_of_week..Date.current.end_of_week)
      when "last_week"
        scope.where("#{table}.#{col_name}" => 1.week.ago.beginning_of_week..1.week.ago.end_of_week)
      when "present"
        scope.where.not("#{table}.#{col_name}" => [nil, ""])
      when "blank"
        scope.where("#{table}.#{col_name}" => [nil, ""])
      else
        scope
      end
    end

    def valid_sort_column(col)
      return nil if col.blank?
      @model_config.columns.any? { |c| c.name == col } ? col : nil
    end

    def serialize_records_for_list(records)
      has_many_assocs = @model_config.associations.select { |a| [:has_many, :has_many_through].include?(a.macro) }
      belongs_to_assocs = @model_config.associations.select { |a| a.macro == :belongs_to && !a.polymorphic? }

      records.map do |record|
        row = { id: record.id, display_name: record.send(@model_config.to_s_method).to_s }
        list_columns.each do |col|
          row[col.name] = read_column_value(record, col)
        end
        has_many_assocs.each do |assoc|
          row["_assoc_#{assoc.name}"] = record.send(assoc.name).count rescue 0
        end
        # Include belongs_to display names for foreign key columns
        belongs_to_assocs.each do |assoc|
          related = record.send(assoc.name) rescue nil
          if related
            target_config = NewAdmin::Introspector.models.find { |m| m.name == related.class.name }
            row["_belongs_to_#{assoc.name}"] = {
              id: related.id,
              display_name: related.respond_to?(target_config&.to_s_method || :to_s) ? related.send(target_config&.to_s_method || :to_s).to_s : related.to_s,
              param_key: target_config&.param_key,
            }
          end
        end
        # Include attachment metadata with URLs
        @model_config.attachment_attributes.each do |att|
          attachment = record.send(att[:name])
          if attachment.attached?
            row["_attachment_#{att[:name]}"] = serialize_attachment(attachment)
          end
        end
        row
      end
    end

    def serialize_record_for_show(record)
      row = { id: record.id, display_name: record.send(@model_config.to_s_method).to_s }
      @model_config.columns.each do |col|
        row[col.name] = read_column_value(record, col)
      end
      # Include attachment metadata with URLs
      @model_config.attachment_attributes.each do |att|
        attachment = record.send(att[:name])
        if attachment.attached?
          row["_attachment_#{att[:name]}"] = serialize_attachment(attachment)
        end
      end
      row
    end

    def serialize_record_for_form(record)
      row = { id: record.id }
      editable_columns.each do |col|
        row[col.name] = read_column_value(record, col)
      end
      # Include has_many :through current IDs
      through_associations.each do |assoc|
        ids_method = "#{assoc.name.singularize}_ids"
        row[ids_method] = record.send(ids_method) if record.respond_to?(ids_method)
      end
      # Include attachment metadata with URLs
      @model_config.attachment_attributes.each do |att|
        attachment = record.send(att[:name])
        if attachment.attached?
          row["_attachment_#{att[:name]}"] = serialize_attachment(attachment)
        end
      end
      # Include rich text content
      @model_config.rich_text_attributes.each do |attr_name|
        rich_text = record.send(attr_name)
        row[attr_name] = rich_text&.to_plain_text.to_s
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

    def serialize_attachment(attachment)
      data = {
        filename: attachment.filename.to_s,
        content_type: attachment.content_type,
        byte_size: attachment.byte_size,
        url: main_app.url_for(attachment),
      }
      if attachment.image?
        data[:thumbnail_url] = main_app.url_for(attachment.variant(resize_to_limit: [200, 200]))
      end
      data
    rescue => e
      # Fallback if URL generation fails (e.g., missing service)
      {
        filename: attachment.filename.to_s,
        content_type: attachment.content_type,
        byte_size: attachment.byte_size,
      }
    end

    def default_values
      row = {}
      editable_columns.each do |col|
        row[col.name] = col.default
      end
      through_associations.each do |assoc|
        row["#{assoc.name.singularize}_ids"] = []
      end
      @model_config.rich_text_attributes.each do |attr_name|
        row[attr_name] = ""
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

    def through_associations
      @through_associations ||= @model_config.associations.select(&:through?)
    end

    def nested_associations
      @nested_associations ||= @model_config.associations.select(&:nested_attributes?)
    end

    def nested_form_config
      nested_associations.map do |assoc|
        target_config = NewAdmin::Introspector.models.find { |m| m.name == assoc.target_model_name }
        next unless target_config

        nested_opts = @model_config.model.nested_attributes_options[assoc.name.to_sym] || {}
        target_columns = target_config.columns
          .reject { |c| c.primary_key? || c.name.in?(%w[created_at updated_at]) }

        # Build association options for foreign keys within nested model
        nested_assoc_options = {}
        target_config.associations
          .select { |a| a.macro == :belongs_to && !a.polymorphic? }
          .each do |nested_assoc|
            # Skip the back-reference to the parent
            next if nested_assoc.target_model_name == @model_config.name

            ref_config = NewAdmin::Introspector.models.find { |m| m.name == nested_assoc.target_model_name }
            next unless ref_config

            records = ref_config.model.limit(200).map do |r|
              { id: r.id, label: r.send(ref_config.to_s_method).to_s }
            end
            nested_assoc_options[nested_assoc.foreign_key] = records
          end

        {
          association_name: assoc.name,
          type: assoc.macro == :has_one ? "has_one" : "has_many",
          allow_destroy: nested_opts[:allow_destroy] || false,
          target_param_key: target_config.param_key,
          target_columns: target_columns.map(&:to_h),
          association_options: nested_assoc_options,
        }
      end.compact
    end

    def nested_form_data_for(record)
      nested_associations.each_with_object({}) do |assoc, hash|
        target_config = NewAdmin::Introspector.models.find { |m| m.name == assoc.target_model_name }
        next unless target_config

        related = record.send(assoc.name)
        target_columns = target_config.columns
          .reject { |c| c.primary_key? || c.name.in?(%w[created_at updated_at]) }

        if assoc.macro == :has_one
          if related
            row = { id: related.id }
            target_columns.each { |col| row[col.name] = related.read_attribute(col.name) }
            hash[assoc.name] = row
          end
        else
          hash[assoc.name] = related.map do |r|
            row = { id: r.id }
            target_columns.each { |col| row[col.name] = r.read_attribute(col.name) }
            row
          end
        end
      end
    end

    def has_many_through_options_for_form
      through_associations.each_with_object({}) do |assoc, hash|
        target_config = NewAdmin::Introspector.models.find { |m| m.name == assoc.target_model_name }
        next unless target_config

        options = target_config.model.limit(200).map do |r|
          { id: r.id, label: r.send(target_config.to_s_method).to_s }
        end
        hash[assoc.name] = {
          ids_field: "#{assoc.name.singularize}_ids",
          options: options,
          target_model: assoc.target_model_name,
        }
      end
    end

    def polymorphic_options_for_form
      @model_config.associations
        .select(&:polymorphic?)
        .each_with_object({}) do |assoc, hash|
          targets = NewAdmin::Introspector.polymorphic_targets_for(assoc.name)
          hash[assoc.name] = targets.map do |target_config|
            records = target_config.model.limit(100).map do |r|
              { id: r.id, label: r.send(target_config.to_s_method).to_s }
            end
            { model_name: target_config.name, param_key: target_config.param_key, records: records }
          end
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
          if assoc.through?
            # For has_many_through, link to the join model filtered by source FK
            through_assoc = @model_config.associations.find { |a| a.name == assoc.through }
            if through_assoc
              through_config = NewAdmin::Introspector.models.find { |m| m.name == through_assoc.target_model_name }
              data[:param_key] = through_config&.param_key
              data[:foreign_key] = through_assoc.foreign_key
            end
          else
            target_config = NewAdmin::Introspector.models.find { |m| m.name == assoc.target_model_name }
            data[:param_key] = target_config&.param_key
            data[:foreign_key] = assoc.foreign_key
          end
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

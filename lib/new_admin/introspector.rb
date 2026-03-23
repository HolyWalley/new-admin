# frozen_string_literal: true

module NewAdmin
  class Introspector
    IGNORED_PREFIXES = %w[
      ActiveStorage::
      ActionText::
      ActionMailbox::
      ActiveRecord::
      Solid
    ].freeze

    class << self
      def models
        @models = nil if Rails.env.development? # reload in dev
        @models ||= discover_models.map { |m| ModelConfig.new(m) }
      end

      def model_for(param_key)
        models.find { |m| m.param_key == param_key }
      end

      def model_names
        models.map(&:name)
      end

      def reset!
        @models = nil
      end

      private

      def discover_models
        Rails.application.eager_load! unless Rails.application.config.eager_load

        ActiveRecord::Base.descendants
          .reject(&:abstract_class?)
          .reject { |m| m.name.blank? }
          .reject { |m| ignored?(m) }
          .sort_by(&:name)
      end

      def ignored?(model)
        IGNORED_PREFIXES.any? { |prefix| model.name.start_with?(prefix) }
      end
    end
  end
end

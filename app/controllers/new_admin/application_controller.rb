module NewAdmin
  class ApplicationController < ActionController::Base
    include ::InertiaRails::Controller

    layout "new_admin/application"

    inertia_share do
      # Ensure all models are loaded (development mode has lazy loading)
      Rails.application.eager_load! unless Rails.application.config.eager_load

      models = ActiveRecord::Base.descendants
        .reject(&:abstract_class?)
        .reject { |m| m.name.blank? }
        .reject { |m| m.name.start_with?("ActiveStorage::") || m.name.start_with?("ActionText::") || m.name.start_with?("ActionMailbox::") || m.name.start_with?("ActiveRecord::") }
        .reject { |m| m.name.start_with?("Solid") }
        .sort_by(&:name)
        .map do |model|
          {
            name: model.name,
            count: model.count
          }
        rescue StandardError
          nil
        end.compact

      { models: models }
    end
  end
end

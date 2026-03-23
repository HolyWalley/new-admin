module NewAdmin
  class ApplicationController < ActionController::Base
    include ::InertiaRails::Controller

    layout "new_admin/application"

    inertia_share do
      {
        models: NewAdmin::Introspector.models.map(&:to_summary_h),
        flash: { success: flash[:notice], error: flash[:alert] }.compact,
      }
    end
  end
end

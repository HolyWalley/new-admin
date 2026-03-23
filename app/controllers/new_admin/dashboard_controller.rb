module NewAdmin
  class DashboardController < ApplicationController
    def index
      render inertia: "Dashboard/Index"
    end
  end
end

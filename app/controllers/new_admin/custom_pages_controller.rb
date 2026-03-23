# frozen_string_literal: true

module NewAdmin
  class CustomPagesController < ApplicationController
    def show
      render inertia: "CustomPage", props: {
        path: params[:path],
      }
    end
  end
end

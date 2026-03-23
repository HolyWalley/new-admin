# frozen_string_literal: true

module NewAdmin
  # Execution context for custom action handlers.
  # Becomes `self` when the handler block runs via instance_exec,
  # so @record, @scope are accessible as instance variables.
  class HandlerContext
    attr_reader :params, :request, :current_user

    def initialize(record:, scope:, params:, request:, current_user:)
      @record = record
      @scope = scope
      @params = params
      @request = request
      @current_user = current_user
    end
  end
end

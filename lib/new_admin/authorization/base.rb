# frozen_string_literal: true

module NewAdmin
  module Authorization
    class Base
      attr_reader :controller

      def initialize(controller)
        @controller = controller
      end

      # Check if the current user can perform `action` on `subject`.
      # action: :list, :show, :create, :update, :destroy
      # subject: a model class (e.g., Order) or a record instance
      def can?(action, subject)
        true
      end

      # Returns a hash of permissions for the given model class.
      def permissions_for(model_class)
        %i[list show create update destroy].each_with_object({}) do |action, hash|
          hash[action] = can?(action, model_class)
        end
      end
    end
  end
end

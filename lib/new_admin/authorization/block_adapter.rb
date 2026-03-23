# frozen_string_literal: true

module NewAdmin
  module Authorization
    class BlockAdapter < Base
      def initialize(controller, block)
        super(controller)
        @block = block
      end

      def can?(action, subject)
        user = controller.send(:new_admin_current_user)
        @block.call(user, action, subject)
      end
    end
  end
end

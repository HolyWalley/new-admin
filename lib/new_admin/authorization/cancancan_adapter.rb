# frozen_string_literal: true

module NewAdmin
  module Authorization
    class CancancanAdapter < Base
      ACTION_MAP = {
        list: :index,
        show: :show,
        create: :create,
        update: :update,
        destroy: :destroy,
      }.freeze

      def can?(action, subject)
        cancan_action = ACTION_MAP[action] || action
        user = controller.send(:new_admin_current_user)
        ability = ::Ability.new(user)
        ability.can?(cancan_action, subject)
      rescue NameError
        true
      end
    end
  end
end

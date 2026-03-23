# frozen_string_literal: true

module NewAdmin
  module Authorization
    class PunditAdapter < Base
      ACTION_MAP = {
        list: :index?,
        show: :show?,
        create: :create?,
        update: :update?,
        destroy: :destroy?,
      }.freeze

      def can?(action, subject)
        policy_method = ACTION_MAP[action]
        return true unless policy_method

        user = controller.send(:new_admin_current_user)
        policy = find_policy(user, subject)
        return true unless policy

        policy.public_send(policy_method)
      end

      private

      def find_policy(user, subject)
        ::Pundit.policy!(user, subject)
      rescue ::Pundit::NotDefinedError
        # Fall back to ApplicationPolicy if no model-specific policy exists
        if defined?(::ApplicationPolicy)
          ::ApplicationPolicy.new(user, subject)
        else
          nil
        end
      end
    end
  end
end

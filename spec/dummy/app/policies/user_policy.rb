# frozen_string_literal: true

class UserPolicy < ApplicationPolicy
  # Only admins can edit users
  def update?
    user.admin?
  end

  # Only admins can delete users, and cannot delete themselves
  def destroy?
    user.admin? && record != user
  end
end

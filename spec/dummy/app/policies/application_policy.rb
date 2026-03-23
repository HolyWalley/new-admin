# frozen_string_literal: true

class ApplicationPolicy
  attr_reader :user, :record

  def initialize(user, record)
    @user = user
    @record = record
  end

  # Everyone can list models
  def index?
    true
  end

  # Everyone can view records
  def show?
    true
  end

  # Editors and admins can create
  def create?
    user.editor? || user.admin?
  end

  # Editors and admins can update
  def update?
    user.editor? || user.admin?
  end

  # Only admins can delete
  def destroy?
    user.admin?
  end

  class Scope
    def initialize(user, scope)
      @user = user
      @scope = scope
    end

    def resolve
      scope.all
    end

    private

    attr_reader :user, :scope
  end
end

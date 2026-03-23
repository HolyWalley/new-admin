# frozen_string_literal: true

NewAdmin.config do |config|
  # Authentication: require login via Devise/Warden
  config.authenticate_with { warden.authenticate! scope: :user }
  config.current_user_method(&:current_user)

  # Authorization: use Pundit policies
  config.authorize_with :pundit

  # Custom components built from app/javascript/new_admin/
  config.custom_scripts "new_admin_custom/custom"

  config.model "Order" do
    list do
      field :number
      field :status
      field :total
      field :user
      field :created_at
    end

    edit do
      field :number, label: "Order Number", help: "Auto-generated if blank"
      field :status, custom_component: "OrderStatusSelect"
      field :notes, label: "Internal Notes", help: "Only visible to admins"
      field :user
      exclude :total # computed field
    end

    show do
      field :number, label: "Order #"
      field :status
      field :total, label: "Order Total"
      field :user, label: "Customer"
      field :notes
      field :created_at
      field :updated_at
    end
  end
end

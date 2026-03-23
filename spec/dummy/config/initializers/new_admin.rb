# frozen_string_literal: true

NewAdmin.config do |config|
  # App branding in sidebar header
  config.app_name = "DummyApp"
  config.app_version = "v2.4.1"

  # Authentication: require login via Devise/Warden
  config.authenticate_with { warden.authenticate! scope: :user }
  config.current_user_method(&:current_user)

  # Authorization: use Pundit policies
  config.authorize_with :pundit

  # Custom components built from app/javascript/new_admin/
  config.custom_scripts "new_admin_custom/custom"

  # Navigation groups: organize sidebar into sections
  config.navigation do
    group "Content" do
      model "Post"
      model "Page"
      model "Category"
      model "Tag"
    end
    group "Commerce" do
      model "Order"
      model "Product"
      model "DigitalProduct"
      model "PhysicalProduct"
      model "OrderItem"
    end
    group "Users" do
      model "User"
      model "Address"
      model "Comment"
    end
  end

  config.model "Order" do
    navigation_icon "ShoppingCart"
    weight 1

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

  config.model "User" do
    navigation_icon "Users"
    weight 1
  end

  config.model "Product" do
    navigation_icon "Box"
    weight 2
  end

  config.model "Post" do
    navigation_icon "PenLine"
    weight 1
  end

  config.model "Comment" do
    navigation_icon "MessageSquare"
  end
end

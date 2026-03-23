# frozen_string_literal: true

NewAdmin.config do |config|
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
      field :status
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

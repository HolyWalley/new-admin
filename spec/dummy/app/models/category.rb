class Category < ApplicationRecord
  belongs_to :parent, class_name: "Category", optional: true
  has_many :children, class_name: "Category", foreign_key: :parent_id, dependent: :nullify
  has_many :posts, dependent: :nullify

  validates :name, presence: true, uniqueness: true

  default_scope { order(:position, :name) }

  def to_s
    name
  end
end

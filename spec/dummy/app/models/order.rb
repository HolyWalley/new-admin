class Order < ApplicationRecord
  enum :status, { pending: 0, confirmed: 1, shipped: 2, delivered: 3, cancelled: 4 }

  belongs_to :user
  has_many :order_items, dependent: :destroy
  has_one :address, dependent: :destroy

  accepts_nested_attributes_for :order_items, allow_destroy: true
  accepts_nested_attributes_for :address, allow_destroy: true

  validates :number, presence: true, uniqueness: true
  validates :total, numericality: { greater_than_or_equal_to: 0 }, allow_nil: true

  def to_s
    number
  end
end

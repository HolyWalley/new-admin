class Address < ApplicationRecord
  belongs_to :order

  validates :street, :city, :zip, :country, presence: true

  def to_s
    [street, city, state, zip, country].compact_blank.join(", ")
  end
end

class User < ApplicationRecord
  devise :database_authenticatable, :recoverable, :rememberable, :validatable

  enum :role, { viewer: 0, editor: 1, admin: 2 }

  has_many :posts, dependent: :nullify
  has_many :comments, dependent: :nullify
  has_many :orders, dependent: :nullify

  has_one_attached :avatar

  validates :name, presence: true

  def to_s
    name.presence || email
  end
end

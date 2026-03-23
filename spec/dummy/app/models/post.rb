class Post < ApplicationRecord
  enum :status, { draft: 0, published: 1, archived: 2 }

  belongs_to :user
  belongs_to :category, optional: true
  has_many :comments, as: :commentable, dependent: :destroy
  has_many :taggings, dependent: :destroy
  has_many :tags, through: :taggings

  has_one_attached :cover_image
  has_rich_text :body

  validates :title, presence: true, length: { maximum: 255 }

  scope :featured, -> { where(featured: true) }

  def to_s
    title
  end
end

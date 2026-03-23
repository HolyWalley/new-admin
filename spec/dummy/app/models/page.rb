class Page < ApplicationRecord
  has_rich_text :content

  validates :title, presence: true
  validates :slug, presence: true, uniqueness: true,
            format: { with: /\A[a-z0-9\-]+\z/, message: "only allows lowercase letters, numbers, and hyphens" }

  scope :published, -> { where(published: true) }

  def to_s
    title
  end
end

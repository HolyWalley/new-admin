class Comment < ApplicationRecord
  enum :status, { pending: 0, approved: 1, spam: 2 }

  belongs_to :commentable, polymorphic: true
  belongs_to :user

  validates :body, presence: true

  def to_s
    body.truncate(50)
  end
end

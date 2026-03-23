# frozen_string_literal: true

module Blog
  class Article < ApplicationRecord
    self.table_name = "blog_articles"

    belongs_to :user
    has_many :article_comments, class_name: "Blog::ArticleComment", dependent: :destroy

    validates :title, presence: true
  end
end

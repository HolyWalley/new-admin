# frozen_string_literal: true

module Blog
  class ArticleComment < ApplicationRecord
    self.table_name = "blog_article_comments"

    belongs_to :article, class_name: "Blog::Article"
    belongs_to :user

    validates :body, presence: true
  end
end

class CreateBlogTables < ActiveRecord::Migration[8.0]
  def change
    create_table :blog_articles do |t|
      t.string :title, null: false
      t.text :body
      t.string :status, default: "draft"
      t.references :user, foreign_key: true
      t.timestamps
    end

    create_table :blog_article_comments do |t|
      t.text :body, null: false
      t.references :article, null: false, foreign_key: { to_table: :blog_articles }
      t.references :user, foreign_key: true
      t.timestamps
    end
  end
end

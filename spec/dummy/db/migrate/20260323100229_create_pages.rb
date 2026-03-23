class CreatePages < ActiveRecord::Migration[8.1]
  def change
    create_table :pages do |t|
      t.string :title
      t.string :slug
      t.boolean :published
      t.datetime :published_at

      t.timestamps
    end
    add_index :pages, :slug, unique: true
  end
end

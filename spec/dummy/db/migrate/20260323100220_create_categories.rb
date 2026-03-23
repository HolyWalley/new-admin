class CreateCategories < ActiveRecord::Migration[8.1]
  def change
    create_table :categories do |t|
      t.string :name
      t.text :description
      t.integer :position
      t.integer :parent_id

      t.timestamps
    end
    add_index :categories, :parent_id
  end
end

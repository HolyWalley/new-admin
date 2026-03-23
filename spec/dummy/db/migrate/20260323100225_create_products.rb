class CreateProducts < ActiveRecord::Migration[8.1]
  def change
    create_table :products do |t|
      t.string :type
      t.string :name
      t.text :description
      t.decimal :price, precision: 10, scale: 2
      t.string :sku
      t.string :download_url
      t.integer :file_size_mb
      t.decimal :weight_kg, precision: 8, scale: 2
      t.string :dimensions

      t.timestamps
    end
    add_index :products, :sku, unique: true
  end
end

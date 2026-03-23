class CreateOrders < ActiveRecord::Migration[8.1]
  def change
    create_table :orders do |t|
      t.string :number
      t.integer :status
      t.decimal :total, precision: 10, scale: 2
      t.text :notes
      t.references :user, null: false, foreign_key: true

      t.timestamps
    end
    add_index :orders, :number, unique: true
  end
end

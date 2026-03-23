class CreateAddresses < ActiveRecord::Migration[8.1]
  def change
    create_table :addresses do |t|
      t.string :street
      t.string :city
      t.string :state
      t.string :zip
      t.string :country
      t.references :order, null: false, foreign_key: true

      t.timestamps
    end
  end
end

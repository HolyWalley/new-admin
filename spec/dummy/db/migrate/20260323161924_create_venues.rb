class CreateVenues < ActiveRecord::Migration[8.1]
  def change
    create_table :venues do |t|
      t.string :name
      t.integer :capacity
      t.string :city

      t.timestamps
    end
  end
end

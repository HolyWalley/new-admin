class CreateBusinessesLocationSettings < ActiveRecord::Migration[8.0]
  def change
    create_table :businesses_location_settings do |t|
      t.string :type, null: false
      t.string :name
      t.string :value
      t.timestamps
    end
  end
end

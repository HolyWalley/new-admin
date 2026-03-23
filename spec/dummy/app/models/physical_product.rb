class PhysicalProduct < Product
  validates :weight_kg, numericality: { greater_than: 0 }, allow_nil: true
end

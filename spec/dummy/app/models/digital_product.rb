class DigitalProduct < Product
  validates :download_url, presence: true
end

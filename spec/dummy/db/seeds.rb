require "faker"

# Generate a minimal valid PNG with a solid color (1x1 pixel)
def placeholder_png(r, g, b)
  # Minimal valid PNG: 1x1 pixel, RGB
  raw_data = [0, r, g, b].pack("C*")
  require "zlib"
  compressed = Zlib::Deflate.deflate(raw_data)

  signature = [137, 80, 78, 71, 13, 10, 26, 10].pack("C*")
  ihdr_data = [1, 1, 8, 2, 0, 0, 0].pack("N N C C C C C")
  ihdr = chunk("IHDR", ihdr_data)
  idat = chunk("IDAT", compressed)
  iend = chunk("IEND", "")

  signature + ihdr + idat + iend
end

def chunk(type, data)
  [data.bytesize].pack("N") + type + data + [Zlib.crc32(type + data)].pack("N")
end

puts "Seeding database..."

# Users
users = []
users << User.create!(
  name: "Admin User",
  email: "admin@example.com",
  password: "password",
  role: :admin
)
2.times do |i|
  users << User.create!(
    name: Faker::Name.name,
    email: "editor#{i + 1}@example.com",
    password: "password",
    role: :editor
  )
end
2.times do |i|
  users << User.create!(
    name: Faker::Name.name,
    email: "viewer#{i + 1}@example.com",
    password: "password",
    role: :viewer
  )
end
# Attach avatars
users.each do |user|
  color = Array.new(3) { rand(60..200) }
  user.avatar.attach(
    io: StringIO.new(placeholder_png(*color)),
    filename: "avatar-#{user.id}.png",
    content_type: "image/png"
  )
end
puts "  Created #{User.count} users with avatars"

# Categories (with nesting)
parent_categories = []
%w[Technology Business Science Design Entertainment].each_with_index do |name, i|
  parent_categories << Category.create!(name: name, position: i + 1)
end

child_categories = []
{ "Technology" => %w[AI Web Mobile], "Business" => %w[Startups Finance], "Science" => %w[Physics Biology] }.each do |parent_name, children|
  parent = parent_categories.find { |c| c.name == parent_name }
  children.each_with_index do |name, i|
    child_categories << Category.create!(name: name, parent: parent, position: i + 1)
  end
end
all_categories = parent_categories + child_categories
puts "  Created #{Category.count} categories"

# Tags
tag_names = %w[ruby rails javascript react typescript python devops docker kubernetes aws
               tutorial beginner advanced opinion news]
tags = tag_names.map { |name| Tag.create!(name: name) }
puts "  Created #{Tag.count} tags"

# Posts
posts = []
30.times do |i|
  post = Post.create!(
    title: Faker::Lorem.sentence(word_count: rand(4..8)),
    body: Faker::Lorem.paragraphs(number: rand(3..6)).join("\n\n"),
    status: Post.statuses.keys.sample,
    featured: [true, false, false, false].sample,
    published_at: rand(1..365).days.ago,
    user: users.sample,
    category: all_categories.sample
  )

  # Assign 1-4 random tags
  post.tags = tags.sample(rand(1..4))

  posts << post
end
# Attach cover images to ~half the posts
posts.sample(15).each do |post|
  color = Array.new(3) { rand(60..200) }
  post.cover_image.attach(
    io: StringIO.new(placeholder_png(*color)),
    filename: "cover-#{post.id}.png",
    content_type: "image/png"
  )
end
puts "  Created #{Post.count} posts with #{Tagging.count} taggings (#{ActiveStorage::Attachment.where(record_type: 'Post').count} with cover images)"

# Comments
posts.sample(20).each do |post|
  rand(1..5).times do
    Comment.create!(
      body: Faker::Lorem.paragraph(sentence_count: rand(1..3)),
      status: Comment.statuses.keys.sample,
      commentable: post,
      user: users.sample
    )
  end
end
puts "  Created #{Comment.count} comments"

# Products (STI)
products = []
5.times do |i|
  products << DigitalProduct.create!(
    name: Faker::Commerce.product_name,
    description: Faker::Lorem.paragraph,
    price: Faker::Commerce.price(range: 9.99..99.99),
    sku: "DIG-#{format('%04d', i + 1)}",
    download_url: "https://example.com/downloads/#{Faker::Internet.slug}",
    file_size_mb: rand(10..500)
  )
end
5.times do |i|
  products << PhysicalProduct.create!(
    name: Faker::Commerce.product_name,
    description: Faker::Lorem.paragraph,
    price: Faker::Commerce.price(range: 19.99..299.99),
    sku: "PHY-#{format('%04d', i + 1)}",
    weight_kg: rand(0.5..25.0).round(2),
    dimensions: "#{rand(10..100)}x#{rand(10..100)}x#{rand(5..50)} cm"
  )
end
puts "  Created #{Product.count} products (#{DigitalProduct.count} digital, #{PhysicalProduct.count} physical)"

# Orders
20.times do |i|
  order = Order.new(
    number: "ORD-#{format('%06d', i + 1)}",
    status: Order.statuses.keys.sample,
    user: users.sample,
    notes: [Faker::Lorem.sentence, nil, nil].sample
  )

  # 1-4 items per order
  order_total = 0
  rand(1..4).times do
    product = products.sample
    qty = rand(1..3)
    item_total = qty * product.price
    order_total += item_total
    order.order_items.build(
      product: product,
      quantity: qty,
      unit_price: product.price,
      total_price: item_total
    )
  end
  order.total = order_total

  order.build_address(
    street: Faker::Address.street_address,
    city: Faker::Address.city,
    state: Faker::Address.state_abbr,
    zip: Faker::Address.zip_code,
    country: Faker::Address.country_code
  )

  order.save!
end
puts "  Created #{Order.count} orders with #{OrderItem.count} items and #{Address.count} addresses"

# Pages
pages_data = [
  { title: "About Us", slug: "about-us", published: true },
  { title: "Privacy Policy", slug: "privacy-policy", published: true },
  { title: "Terms of Service", slug: "terms-of-service", published: true },
  { title: "Contact", slug: "contact", published: true },
  { title: "Coming Soon", slug: "coming-soon", published: false }
]
pages_data.each do |data|
  Page.create!(
    title: data[:title],
    slug: data[:slug],
    published: data[:published],
    published_at: data[:published] ? rand(1..90).days.ago : nil,
    content: Faker::Lorem.paragraphs(number: rand(3..5)).join("\n\n")
  )
end
puts "  Created #{Page.count} pages"

puts "Done! Login with admin@example.com / password"

require_relative "lib/new_admin/version"

Gem::Specification.new do |spec|
  spec.name        = "new_admin"
  spec.version     = NewAdmin::VERSION
  spec.authors     = ["TODO"]
  spec.email       = ["TODO"]
  spec.homepage    = "https://github.com/TODO/new_admin"
  spec.summary     = "Modern admin panel for Rails with React + shadcn/ui"
  spec.description = "A drop-in replacement for rails_admin using React, shadcn/ui, and Inertia.js"
  spec.license     = "MIT"

  spec.required_ruby_version = ">= 3.4"

  spec.files = Dir.chdir(File.expand_path(__dir__)) do
    Dir["{app,config,lib}/**/*", "MIT-LICENSE", "Rakefile", "README.md"]
  end

  spec.add_dependency "rails", ">= 8.0"
  spec.add_dependency "inertia_rails", ">= 3.0"
end

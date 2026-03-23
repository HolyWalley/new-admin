# frozen_string_literal: true

module NewAdmin
  module Generators
    class ViteGenerator < Rails::Generators::Base
      source_root File.expand_path("templates", __dir__)
      desc "Scaffolds a Vite-based entry point for custom NewAdmin React components"

      def create_directory
        empty_directory "app/javascript/new_admin"
        empty_directory "app/javascript/new_admin/components"
      end

      def copy_entry_point
        template "index.ts.tt", "app/javascript/new_admin/index.ts"
      end

      def copy_example_component
        template "ExampleField.tsx.tt", "app/javascript/new_admin/components/ExampleField.tsx"
      end

      def copy_types
        template "types.ts.tt", "app/javascript/new_admin/types.ts"
      end

      def show_instructions
        say ""
        say "NewAdmin Vite scaffold created!", :green
        say ""
        say "Files created:"
        say "  app/javascript/new_admin/index.ts       — entry point (register custom components here)"
        say "  app/javascript/new_admin/components/     — your custom React components"
        say "  app/javascript/new_admin/types.ts        — TypeScript type definitions"
        say ""
        say "Next steps:"
        say "  1. Add your custom React components to app/javascript/new_admin/components/"
        say "  2. Register them in app/javascript/new_admin/index.ts"
        say "  3. Reference them in your NewAdmin DSL config:"
        say "     field :status, custom_component: \"MyCustomField\""
        say ""
      end
    end
  end
end

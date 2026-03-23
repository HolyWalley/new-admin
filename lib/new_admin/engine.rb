module NewAdmin
  class Engine < ::Rails::Engine
    isolate_namespace NewAdmin

    initializer "new_admin.assets" do |app|
      app.config.assets.paths << root.join("app/assets/builds")

      if app.config.respond_to?(:assets)
        app.config.assets.precompile += %w[
          new_admin/new_admin.js
          new_admin/new_admin.css
          new_admin/new_admin.woff2
          new_admin/new_admin2.woff2
          new_admin/new_admin3.woff2
        ]
      end
    end

  end
end

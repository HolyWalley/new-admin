module NewAdmin
  class Engine < ::Rails::Engine
    isolate_namespace NewAdmin

    initializer "new_admin.assets" do |app|
      app.config.assets.paths << root.join("app/assets/builds")
    end

    initializer "new_admin.inertia" do
      InertiaRails.configure do |config|
        # Only applies within NewAdmin controllers due to layout scoping
      end
    end
  end
end

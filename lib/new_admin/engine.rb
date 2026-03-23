module NewAdmin
  class Engine < ::Rails::Engine
    isolate_namespace NewAdmin

    initializer "new_admin.assets" do |app|
      app.config.assets.paths << root.join("app/assets/builds")
    end

  end
end

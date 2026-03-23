NewAdmin::Engine.routes.draw do
  root to: "dashboard#index"

  resources :resources, path: ":model_name", only: [:index, :show, :new, :create, :edit, :update, :destroy],
    constraints: { model_name: /[a-z][a-z0-9_]*/ } do
    collection do
      delete :bulk_destroy
    end
  end
end

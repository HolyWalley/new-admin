NewAdmin::Engine.routes.draw do
  root to: "dashboard#index"

  # Custom pages (before resources to avoid model_name conflict)
  get "pages/*path", to: "custom_pages#show"

  resources :resources, path: ":model_name", only: [:index, :show, :new, :create, :edit, :update, :destroy],
    constraints: { model_name: /[a-z][a-z0-9_~]*/ } do
    member do
      get :delete_confirmation
    end
    collection do
      delete :bulk_destroy
    end
  end
end

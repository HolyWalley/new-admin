NewAdmin::Engine.routes.draw do
  root to: "dashboard#index"

  # Custom pages (before resources to avoid model_name conflict)
  get "pages/*path", to: "custom_pages#show"

  # Custom actions (before resources to avoid :id conflicts)
  scope ":model_name", constraints: { model_name: /[a-z][a-z0-9_~]*/ } do
    get  "actions/:action_name", to: "actions#collection_get"
    post "actions/:action_name", to: "actions#collection_post"
    get  ":id/actions/:action_name", to: "actions#member_get"
    post ":id/actions/:action_name", to: "actions#member_post"
  end

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

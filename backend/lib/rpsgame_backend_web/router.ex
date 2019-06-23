defmodule RpsGameWeb.Router do
  use RpsGameWeb, :router

  pipeline :api do
    plug :accepts, ["json"]
  end

  scope "/api", RpsGameWeb do
    pipe_through :api
  end
end

defmodule RpsGame.Repo do
  use Ecto.Repo,
    otp_app: :rpsgame_backend,
    adapter: Ecto.Adapters.Postgres
end

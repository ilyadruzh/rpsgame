use Mix.Config

# Configure your database
config :rpsgame_backend, RpsGame.Repo,
  username: "postgres",
  password: "postgres",
  database: "rpsgame_backend_test",
  hostname: "localhost",
  pool: Ecto.Adapters.SQL.Sandbox

# We don't run a server during test. If one is required,
# you can enable the server option below.
config :rpsgame_backend, RpsGameWeb.Endpoint,
  http: [port: 4002],
  server: false

# Print only warnings and errors during test
config :logger, level: :warn

config :bcrypt_elixir, :log_rounds, 4
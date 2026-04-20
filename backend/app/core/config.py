from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "UCaaS + CCaaS Unified Billing Platform"
    api_prefix: str = "/api/v1"
    secret_key: str = "replace-this-in-production"
    access_token_expire_minutes: int = 720
    algorithm: str = "HS256"
    database_url: str = "sqlite:///./ucaas_ccaas.db"
    supplier_state_code: str = "MH"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")


settings = Settings()


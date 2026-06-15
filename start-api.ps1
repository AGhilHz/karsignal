Set-Location "E:\site-jadide-man\apps\api"

# Set DATABASE_URL directly
$env:DATABASE_URL = "postgresql://career_user:career_pass123@localhost:5432/career_platform"
$env:DATABASE_SHADOW_URL = "postgresql://career_user:career_pass123@localhost:5432/career_platform_shadow"
$env:NODE_ENV = "development"
$env:APP_PORT = "3001"
$env:JWT_SECRET = "dev-jwt-secret-change-in-production-minimum-32-chars"
$env:JWT_REFRESH_SECRET = "dev-refresh-secret-change-in-production-minimum-32"
$env:JWT_EXPIRES_IN = "15m"
$env:JWT_REFRESH_EXPIRES_IN = "7d"
$env:REDIS_HOST = "localhost"
$env:REDIS_PORT = "6379"
$env:REDIS_PASSWORD = ""
$env:ENCRYPTION_KEY = "dev-encryption-key-32chars!!!!!!"
$env:ANONYMIZATION_SALT = "dev-anonymization-salt-random-string"
$env:ELASTICSEARCH_NODE = "http://localhost:9200"
$env:OPENAI_API_KEY = "sk-placeholder"
$env:THROTTLE_TTL = "60"
$env:THROTTLE_LIMIT = "1000"
$env:FRONTEND_URL = "http://localhost:3000"

Write-Host "Environment set. Starting API..." -ForegroundColor Green
npm run start:dev

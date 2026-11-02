-- Initialize isolated databases for each microservice
CREATE DATABASE auth_db;
CREATE DATABASE resume_db;
CREATE DATABASE job_db;
CREATE DATABASE match_db;

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE auth_db TO recruitment;
GRANT ALL PRIVILEGES ON DATABASE resume_db TO recruitment;
GRANT ALL PRIVILEGES ON DATABASE job_db TO recruitment;
GRANT ALL PRIVILEGES ON DATABASE match_db TO recruitment;

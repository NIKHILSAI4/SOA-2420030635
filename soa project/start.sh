#!/usr/bin/env bash
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

export JAVA_HOME="/Users/nikhil/.jdks/jdk-17.0.21+9/Contents/Home"
export PATH="$JAVA_HOME/bin:/Users/nikhil/.maven/apache-maven-3.9.6/bin:/Users/nikhil/.nodejs/bin:$PATH"

mkdir -p "$DIR/logs" "$DIR/data" /tmp/recruitment/resumes

echo "=========================================================="
echo "🚀 Starting AI-Powered Skill Matching Recruitment Platform"
echo "=========================================================="

# 1. NLP Service (Python FastAPI)
echo -n "[1/8] Starting NLP Service (:8000)... "
if lsof -ti :8000 >/dev/null 2>&1; then
  echo "Already running on port 8000."
else
  cd "$DIR/nlp-service"
  nohup .venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000 > "$DIR/logs/nlp-service.log" 2>&1 &
  echo $! > "$DIR/logs/nlp-service.pid"
  cd "$DIR"
  echo "Started (PID: $(cat "$DIR/logs/nlp-service.pid"))."
fi

# 2. Eureka Service Discovery Server
echo -n "[2/8] Starting Eureka Discovery Server (:8761)... "
if lsof -ti :8761 >/dev/null 2>&1; then
  echo "Already running on port 8761."
else
  nohup java -Xms64m -Xmx256m -jar "$DIR/eureka-server/target/eureka-server-1.0.0.jar" > "$DIR/logs/eureka-server.log" 2>&1 &
  echo $! > "$DIR/logs/eureka-server.pid"
  echo "Started (PID: $(cat "$DIR/logs/eureka-server.pid"))."
fi

echo -n "Waiting for Eureka Server to initialize... "
for i in {1..30}; do
  if curl -s http://localhost:8761 >/dev/null 2>&1; then
    echo "Ready!"
    break
  fi
  sleep 1
done

# Common H2 Database settings
H2_DRIVER="org.h2.Driver"
H2_DIALECT="org.hibernate.dialect.H2Dialect"

# 3. Auth Service
echo -n "[3/8] Starting Auth Service (:8081)... "
if lsof -ti :8081 >/dev/null 2>&1; then
  echo "Already running on port 8081."
else
  nohup env \
    SPRING_DATASOURCE_URL="jdbc:h2:file:$DIR/data/auth_db;DB_CLOSE_DELAY=-1;MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE" \
    SPRING_DATASOURCE_DRIVER_CLASS_NAME="$H2_DRIVER" \
    SPRING_JPA_DATABASE_PLATFORM="$H2_DIALECT" \
    java -Xms64m -Xmx256m -jar "$DIR/auth-service/target/auth-service-1.0.0.jar" > "$DIR/logs/auth-service.log" 2>&1 &
  echo $! > "$DIR/logs/auth-service.pid"
  echo "Started (PID: $(cat "$DIR/logs/auth-service.pid"))."
fi

# 4. Job Service
echo -n "[4/8] Starting Job Service (:8083)... "
if lsof -ti :8083 >/dev/null 2>&1; then
  echo "Already running on port 8083."
else
  nohup env \
    SPRING_DATASOURCE_URL="jdbc:h2:file:$DIR/data/job_db;DB_CLOSE_DELAY=-1;MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE" \
    SPRING_DATASOURCE_DRIVER_CLASS_NAME="$H2_DRIVER" \
    SPRING_JPA_DATABASE_PLATFORM="$H2_DIALECT" \
    java -Xms64m -Xmx256m -jar "$DIR/job-service/target/job-service-1.0.0.jar" > "$DIR/logs/job-service.log" 2>&1 &
  echo $! > "$DIR/logs/job-service.pid"
  echo "Started (PID: $(cat "$DIR/logs/job-service.pid"))."
fi

# 5. Resume Service
echo -n "[5/8] Starting Resume Service (:8082)... "
if lsof -ti :8082 >/dev/null 2>&1; then
  echo "Already running on port 8082."
else
  nohup env \
    SPRING_DATASOURCE_URL="jdbc:h2:file:$DIR/data/resume_db;DB_CLOSE_DELAY=-1;MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE" \
    SPRING_DATASOURCE_DRIVER_CLASS_NAME="$H2_DRIVER" \
    SPRING_JPA_DATABASE_PLATFORM="$H2_DIALECT" \
    UPLOAD_DIR="/tmp/recruitment/resumes" \
    NLP_SERVICE_URL="http://localhost:8000" \
    java -Xms64m -Xmx256m -jar "$DIR/resume-service/target/resume-service-1.0.0.jar" > "$DIR/logs/resume-service.log" 2>&1 &
  echo $! > "$DIR/logs/resume-service.pid"
  echo "Started (PID: $(cat "$DIR/logs/resume-service.pid"))."
fi

# 6. Matching Service
echo -n "[6/8] Starting Matching Service (:8084)... "
if lsof -ti :8084 >/dev/null 2>&1; then
  echo "Already running on port 8084."
else
  nohup env \
    SPRING_DATASOURCE_URL="jdbc:h2:file:$DIR/data/match_db;DB_CLOSE_DELAY=-1;MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE" \
    SPRING_DATASOURCE_DRIVER_CLASS_NAME="$H2_DRIVER" \
    SPRING_JPA_DATABASE_PLATFORM="$H2_DIALECT" \
    NLP_SERVICE_URL="http://localhost:8000" \
    java -Xms64m -Xmx256m -jar "$DIR/matching-service/target/matching-service-1.0.0.jar" > "$DIR/logs/matching-service.log" 2>&1 &
  echo $! > "$DIR/logs/matching-service.pid"
  echo "Started (PID: $(cat "$DIR/logs/matching-service.pid"))."
fi

# 7. API Gateway
echo -n "[7/8] Starting API Gateway (:8080)... "
if lsof -ti :8080 >/dev/null 2>&1; then
  echo "Already running on port 8080."
else
  nohup java -Xms64m -Xmx256m -jar "$DIR/api-gateway/target/api-gateway-1.0.0.jar" > "$DIR/logs/api-gateway.log" 2>&1 &
  echo $! > "$DIR/logs/api-gateway.pid"
  echo "Started (PID: $(cat "$DIR/logs/api-gateway.pid"))."
fi

# 8. Frontend React (Vite)
echo -n "[8/8] Starting Frontend Dashboard (:5173)... "
if lsof -ti :5173 -sTCP:LISTEN >/dev/null 2>&1; then
  echo "Already running on port 5173."
else
  cd "$DIR/frontend"
  nohup ./node_modules/.bin/vite --host 0.0.0.0 --port 5173 > "$DIR/logs/frontend.log" 2>&1 &
  echo $! > "$DIR/logs/frontend.pid"
  cd "$DIR"
  echo "Started (PID: $(cat "$DIR/logs/frontend.pid"))."
fi

echo ""
echo "=========================================================="
echo "✨ All services launched! Checking health status..."
echo "=========================================================="
"$DIR/status.sh"

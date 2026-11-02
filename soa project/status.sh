#!/usr/bin/env bash

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "=========================================================="
echo "📊 Recruitment Microservices Status"
echo "=========================================================="

check_service() {
  local name="$1"
  local port="$2"
  local url="$3"

  local pid
  pid=$(lsof -ti :"$port" -sTCP:LISTEN 2>/dev/null | head -n 1 || echo "")

  local http_code
  http_code=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null || echo "000")

  if [ -n "$pid" ] && [ "$http_code" != "000" ]; then
    printf "  %-20s [PORT %5s] [PID %5s] [HTTP %3s] ✅ ONLINE\n" "$name" "$port" "$pid" "$http_code"
  elif [ -n "$pid" ]; then
    printf "  %-20s [PORT %5s] [PID %5s] [STARTING...] ⏳ INITIALIZING\n" "$name" "$port" "$pid"
  else
    printf "  %-20s [PORT %5s]                    ❌ STOPPED\n" "$name" "$port"
  fi
}

check_service "Eureka Server"       "8761" "http://localhost:8761"
check_service "API Gateway"         "8080" "http://localhost:8080/actuator/health"
check_service "Auth Service"        "8081" "http://localhost:8081/actuator/health"
check_service "Resume Service"      "8082" "http://localhost:8082/actuator/health"
check_service "Job Service"         "8083" "http://localhost:8083/actuator/health"
check_service "Matching Service"    "8084" "http://localhost:8084/actuator/health"
check_service "NLP Service"         "8000" "http://localhost:8000/docs"
check_service "Frontend Dashboard"  "5173" "http://localhost:5173"

echo "----------------------------------------------------------"
echo "🌐 Web Dashboard:   http://localhost:5173"
echo "🌐 API Gateway:     http://localhost:8080"
echo "🌐 Eureka Registry:  http://localhost:8761"
echo "🌐 NLP API Docs:    http://localhost:8000/docs"
echo "=========================================================="

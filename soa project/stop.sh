#!/usr/bin/env bash

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

echo "Stopping all Recruitment Platform services..."

PORTS=(8000 8761 8080 8081 8082 8083 8084 5173)

for port in "${PORTS[@]}"; do
  pids=$(lsof -ti :"$port" 2>/dev/null || true)
  if [ -n "$pids" ]; then
    echo "Stopping service on port $port (PID: $pids)..."
    kill $pids 2>/dev/null || true
  fi
done

sleep 2

# Force kill any remaining
for port in "${PORTS[@]}"; do
  pids=$(lsof -ti :"$port" 2>/dev/null || true)
  if [ -n "$pids" ]; then
    echo "Force stopping service on port $port (PID: $pids)..."
    kill -9 $pids 2>/dev/null || true
  fi
done

rm -f "$DIR/logs/"*.pid

echo "All services stopped cleanly."


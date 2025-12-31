#!/bin/bash
set -e

echo "Waiting for MySQL to be ready..."

# Wait for MySQL to be available
until nc -z localhost 3306; do
  echo "MySQL is unavailable - sleeping"
  sleep 2
done

echo "MySQL is up - starting server"
npm start


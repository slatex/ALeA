#!/bin/bash
set -e

if [ -d "dist/packages/alea-frontend-new" ]; then
  rm -rf dist/packages/alea-frontend-backup
  mv dist/packages/alea-frontend dist/packages/alea-frontend-backup || true
  mv dist/packages/alea-frontend-new dist/packages/alea-frontend
else
  echo "Warning: dist/packages/alea-frontend-new not found. Skipping backup and replacement."
fi

sudo nice -n -20 npx nx serve alea-frontend --prod --port=3300 --hostname=0.0.0.0

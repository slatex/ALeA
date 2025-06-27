#!/bin/bash

rm -rf dist/packages/alea-frontend-backup
mv dist/packages/alea-frontend dist/packages/alea-frontend-backup || true
mv dist/packages/alea-frontend-new dist/packages/alea-frontend

sudo nice -n -20 npx nx serve alea-frontend --prod --port=3300 --hostname=0.0.0.0
#!/bin/bash

git pull
npx nx reset
sudo npx nx build alea-frontend --outputPath=dist/packages/alea-frontend-new

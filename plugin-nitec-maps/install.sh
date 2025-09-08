#!/bin/bash

npm install
npm run build
npm run dev
echo "Linking plugin to superset-frontend..."
cd ..
npm link ./plugin-nitec-maps

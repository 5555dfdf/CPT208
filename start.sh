#!/bin/bash
set -e

cd frontend
npm install
npm run build


cd ../backend
npm install
node index.js
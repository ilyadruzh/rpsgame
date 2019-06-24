#!/usr/bin/env bash

# Stop docker-compose
docker-compose down --remove-orphans

# Build Front
cd frontend
npm install && npm run build
docker build -t rpsgame-front .

# Build Geth
cd ../nodes/geth-node
docker build -t rpsgame-geth .

# Build SC
cd ../../smart-contracts
./sc-artifacts.sh
docker build -t rpsgame-sc .

# Create Substarte Module

# Start docker-compose
docker-compose up -d


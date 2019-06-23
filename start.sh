#!/usr/bin/env bash

# stop docker-compose
docker-compose down --remove-orphans

# Create Distr Front
cd frontend
npm install && npm run build
docker build -t rpsgame-front .

# Create Distr Geth
cd ../nodes/geth-node
docker build -t rpsgame-geth .

# Create Distr SC
cd ../../smart-contracts
./sc-artifacts.sh
docker build -t rpsgame-sc .

# Create Substarte Module
# cd ././substrate/
# docker build -t rpsgame-substrate-module .

# run docker-compose
docker-compose build --no-cache
docker-compose up -d


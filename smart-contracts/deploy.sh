#!/usr/bin/env bash

cd /opt && npm install
cd /opt && rm -rf build
/opt/tools/solc-static-linux --allow-paths /opt/contracts/ openzeppelin-solidity=/opt/contracts/node_modules/openzeppelin-solidity --bin --abi --optimize --optimize-runs 5000000 --overwrite
cd /opt && truffle deploy --network docker
#cd /opt && truffle migrate --reset --network docker
cd /opt && rm -rf .git
#!/usr/bin/env bash

rm -rf build
npm install

SCRIPTS_PATH=$(readlink -e `dirname $0`)
PROJECT_ROOT_PATH=$(readlink -e $SCRIPTS_PATH/../)

COMPILER=$PROJECT_ROOT_PATH/smart-contracts/tools/solc-static-linux # TODO for MacOS
CONTRACTS_DIR=$PROJECT_ROOT_PATH/smart-contracts/contracts/
OPENZEPPELIN_DIR=$(realpath $CONTRACTS_DIR/../node_modules/openzeppelin-solidity)
CONTRACTS_COMPILED_DIR=$PROJECT_ROOT_PATH/smart-contracts/build/contracts

FRONT_CONTRACTS_DIR=$PROJECT_ROOT_PATH/frontend/src/contracts

compile_contract() {
    FILE_PATH=$1.sol

    CONTRACT_NAME=$(basename $1)

    echo -e "\n========" $CONTRACT_NAME ">>>>>>>>"

    $COMPILER --allow-paths $CONTRACTS_DIR $CONTRACTS_DIR/$FILE_PATH openzeppelin-solidity=$OPENZEPPELIN_DIR --bin --abi --optimize --optimize-runs 5000000 --overwrite -o $CONTRACTS_COMPILED_DIR
    cp $CONTRACTS_COMPILED_DIR/$CONTRACT_NAME.abi $FRONT_CONTRACTS_DIR/$CONTRACT_NAME.json

    echo -e "\n<<<<<<<<" $CONTRACT_NAME "========\n"
}


rm -rf $FRONT_CONTRACTS_DIR
rm -rf $CONTRACTS_COMPILED_DIR

mkdir $FRONT_CONTRACTS_DIR

for CONTRACT_PATH in RockPaperScissors
do
    compile_contract $CONTRACT_PATH
done

rm -rf build


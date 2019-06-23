# Камень, ножницы, бумага

Реализация игры "Камень, ножницы, бумага" на блокчейне Ethereum, посредством смарт-контрактов написаных на языке Solidity.

При деплое в публичной сети: https://krondev.github.io/rpsgame

# Сборка и запуск

Состав проекта:

- смарт-контракты
- фроненд проекта, для взаимодействия со смарт-контрактами
- прообраз приватной сети Ethereum на основе Geth


### Smart contracts

- необходимо настроить сеть и запустить ноду Ethereum. 
- деплой происходит в localhost:8545.
- компилятор Solidity для Linux

```
    cd smart-contracts
    npm install
    ./sc-artifacts.sh
    truffle migrate --reset
``` 

- Сохраните полученный адрес смарт-контракта

    
### Frontend

- необходимо установить в свой браузер расшрение Metamask (https://metamask.io)

- Собрать и запустить фронтенд
```
    cd front
    npm install && npm run build
    npm run start
```
    
- приложение откроется по адресу localhost:3000

### Backend

Work In Progress


### Substrate

Work in Progress

### Docker Compose 

Work In Progress

# Ссылки

https://en.wikipedia.org/wiki/Rock-paper-scissors
https://en.wikipedia.org/wiki/Commitment_scheme

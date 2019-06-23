import React from 'react';
import ReactDOM from 'react-dom';
import Web3 from 'web3';
import axios from "axios";

import './index.css';
import App from './components/App';
import * as serviceWorker from './serviceWorker';

// window.addEventListener('load', () => {
//     if (typeof window.web3 !== 'undefined') {
//
//         window.web3js = new Web3(window.web3.currentProvider);
//     } else {
//         console.log('No web3? You should consider trying MetaMask!');
//         window.web3js = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
//     }
//     console.log("Current version of web3 is " + window.web3js.version);
//
//     // axios.get("/api/info").then(response => {
//     //     const data = response.data.result;
//     //     if (!data.pstContractAddress) {
//     //         let errorMessage = "pst contract is not valid!";
//     //         console.error(errorMessage);
//     //         return alert(errorMessage);
//     //     }
//     //     const pst = new window.web3j.eth.Contract(pstAbi, data.pstContractAddress);
//     //     pst.methods.pieAddress.call()
//     //         .then(result => {
//     //             window.contracts = {};
//     //             window.contracts.pstAddress = data.pstContractAddress;
//     //             window.contracts.pieAddress = result;
//     //             startApp();
//     //         })
//     //
//     // })
// });

ReactDOM.render(<App />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.register();

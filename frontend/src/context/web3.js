import React, { Component } from "react";
import Web3 from 'web3';
import TruffleContract from 'truffle-contract'

const DEFAULT_STATE = {
    web3network: "",
    web3networkName: "",
    web3connected: false,
    isMetaMaskConnected: false,
    isMetaMaskLocked: true,
    accounts: [],
    web3provider: '',
};

export const Web3Context = React.createContext(DEFAULT_STATE);

class Web3Provider extends Component {

    constructor(props) {
        super(props);

        this.state = {
            web3network: window.localStorage.getItem("web3network") || "",
            web3networkName: window.localStorage.getItem("web3networkName") || "",
            web3connected: window.localStorage.getItem("web3connected") || false,
            isMetaMaskLocked: window.localStorage.getItem("isMetaMaskLocked") || true,
            web3provider: '',
            accounts: '',
        };

    }

    alert = (e) => {
        console.log("network changed: ", e)
    };
    
    accountsChanged = (e) => {
        window.web3.eth.getAccounts((error, account) => {

            if (account.length === 0) {
                this.setState({
                    isMetaMaskLocked: true,
                });

                window.localStorage.setItem('isMetaMaskLocked', true);
            } else {
                this.setState({
                    accounts: account,
                    isMetaMaskLocked: false
                });
                window.localStorage.setItem("current_eth_address", account);
                window.localStorage.setItem('isMetaMaskLocked', false);
            }
        });
    };

    componentDidMount() {

        if (typeof window.ethereum !== 'undefined' || (typeof window.web3 !== 'undefined')) {

            const provider = window['ethereum'] || window.web3.currentProvider;

            console.log("window.web3.currentProvider: ", provider);

            provider.enable();
            provider.publicConfigStore.on('networkChanged', (e) => this.alert(e));
            provider.on('accountsChanged', (e) => this.accountsChanged(e));
            this.accountsChanged();

            this.setState(state => {
                return {
                    web3connected: true
                }
            });
            window.localStorage.setItem('web3connected', true);

        } else {

            this.setState({
                web3connected: false,
            })
        }
    }

    switchNetwork = (netId) => {
        this.setState(state => {
            return {
                web3network: netId,
            };
        });

        window.localStorage.setItem('web3network', netId);
    };

    setNetwork = () => {
        let networkName, netId;

        window.web3.version.getNetwork((err, networkId) => {
            switch (networkId) {
                case "1":
                    console.log('This is mainnet')
                    networkName = "Main";
                    netId = 1;
                    break;
                case "2":
                    console.log('This is the deprecated Morden test network.')
                    netId = 2;
                    networkName = "Morden";
                    break;
                case "3":
                    console.log('This is the ropsten test network.')
                    netId = 3;
                    networkName = "Ropsten";
                    break;
                case "4":
                    console.log('This is the Rinkeby test network.')
                    netId = 4;
                    networkName = "Rinkeby";
                    break;
                case "42":
                    console.log('This is the Kovan test network.')
                    netId = 5;
                    networkName = "Kovan";
                    break;
                default:
                    console.log('This is an unknown network.')
                    netId = networkId;
                    networkName = networkId;
            }

            this.setState({
                web3networkName: networkName,
                web3network: networkId
            })
        });
    };

    render() {
        return (
            <Web3Context.Provider value={{
                ...this.state,
                switchNetwork: this.switchNetwork
            }}>
                {this.props.children}
            </Web3Context.Provider>
        );
    }
}

export const
    Consumer = Web3Context.Consumer;
export const
    Provider = Web3Provider;

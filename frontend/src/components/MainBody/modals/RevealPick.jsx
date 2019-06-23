import {Button, Modal, ModalHeader, ModalBody, ModalFooter, Input} from 'reactstrap';
import React, {Component} from 'react';
import {hexToNumberString, soliditySha3, asciiToHex} from "web3-utils";
import axios from "axios";
import web3 from 'web3';
import randomBytes from 'randombytes'


class RevealPick extends Component {

    constructor(props, context) {
        super(props, context);
        this.state = {
            pick: '',
            secret: '',
            encyptedPick: '',
            modal: false
        }
    }

    handleChange = (e) => {
        this.setState({
            [e.target.name]: e.target.value
        }, () => console.log(this.state))
    };

    toggle = () => {
        this.setState(prevState => ({
            modal: !prevState.modal
        }));
    };

    handleRevealPickClick = () => {
        const {instance, gameReady} = this.props;
        const {pick, secret} = this.state;

        const seed = soliditySha3({type: 'bytes32', value: asciiToHex(secret)});
        const encryptedPick = soliditySha3({type: 'uint', value: pick}, {type: 'bytes32', value: seed});

        instance.methods
            .revealPick("gameId", "pickInt", "seed")
            .send({from: window.localStorage.getItem("current_eth_address"), value: 2000000000000000})
            .then(result => {
                console.log("result: ", result);
                gameReady()
            })
            .catch(error => {
                console.log("error: ", error)
            })
    };

    render() {
        return (

            <React.Fragment>
                <Button outline color="primary" onClick={this.toggle}
                        disabled={this.props.disabled}>{this.props.label}</Button>

                <Modal isOpen={this.state.modal} toggle={this.toggle}>
                    <ModalHeader toggle={this.toggle}>Add proof for raise money!</ModalHeader>

                    <ModalBody>
                        <div>Description body Description body Description body Description body</div>
                        <div className="d-flex align-items-baseline">
                            <div className="col-4">Secret code:</div>
                            <Input type="text" name="secret" id="secret" onChange={(e) => this.handleChange(e)}/>
                        </div>
                        {' '}
                        <div className="d-flex align-items-baseline">
                            <div className="col-4">Your choice:</div>
                            <Input type="select" name="pick" id="pick" onChange={(e) => this.handleChange(e)}>
                                <option name="null" value="0"></option>
                                <option name="rock" value="1">Rock</option>
                                <option name="paper" value="2">Paper</option>
                                <option name="scissors" value="3">Scissors</option>
                            </Input>
                        </div>
                    </ModalBody>

                    <ModalFooter>
                        <Button className="pr-2" color="primary" onClick={this.handleRevealPickClick}>Join</Button>
                        <Button color="secondary" onClick={this.toggle}>Cancel</Button>
                    </ModalFooter>
                </Modal>

            </React.Fragment>
        );
    }

}

export default RevealPick;
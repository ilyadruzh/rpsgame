import {Button, Modal, ModalHeader, ModalBody, ModalFooter, Input} from 'reactstrap';
import React, {Component} from 'react';
import {soliditySha3, asciiToHex, fromAscii} from "web3-utils";
import './Loading.css';

class JoinGame extends Component {

    constructor(props, context) {
        super(props, context);
        this.state = {
            pick: '',
            secret: '',
            encyptedPick: '',
            modal: false,
            isLoading: false
        }
    }

    handleChange = (e) => {
        this.setState({
            [e.target.name]: e.target.value
        })
    };

    toggle = () => {
        this.setState(prevState => ({
            modal: !prevState.modal
        }));
    };

    handleJoinGameClick = () => {
        const {instance, gameReady, gameId} = this.props;
        const {pick, secret} = this.state;

        console.log(pick);
        console.log(fromAscii(secret))

        const seed = soliditySha3({type: 'bytes32', value: fromAscii(secret)});
        const encryptedPick = soliditySha3({type: 'uint', value: pick}, {type: 'bytes32', value: seed});

        this.setState({ isLoading: true });

        instance.methods
            .joinGame(gameId, encryptedPick)
            .send({from: window.localStorage.getItem("current_eth_address"), value: 2000000000000000})
            .then(result => {
                gameReady();
                this.setState(prevState => ({
                    modal: !prevState.modal,
                    isLoading: false
                }));
            })
            .catch(error => {
                console.log("error: ", error);
                this.setState(prevState => ({
                    modal: !prevState.modal,
                    isLoading: false
                }));
            })
    };

    render() {
        return (

            <React.Fragment>
                <Button outline color="primary" onClick={this.toggle} disabled={this.props.disabled}>Join to
                    Game</Button>

                <Modal isOpen={this.state.modal} toggle={this.toggle}>

                    { (this.state.isLoading) ? <div className="loading"></div> : ''  }

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
                        <Button className="pr-2" color="primary" onClick={this.handleJoinGameClick}>Join</Button>
                        <Button color="secondary" onClick={this.toggle}>Cancel</Button>
                    </ModalFooter>
                </Modal>

            </React.Fragment>
        );
    }

}

export default JoinGame;
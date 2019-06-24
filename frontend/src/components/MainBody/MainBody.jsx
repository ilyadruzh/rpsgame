import React, {Component} from 'react';
import {Row, Col, Container, InputGroup, FormControl, Button} from 'react-bootstrap'
import Web3 from 'web3';
import StartGame from './modals/StartGame';
import JoinGame from './modals/JoinGame';
import gameAbi from '../../contracts/RockPaperScissors'
import RevealPick from "./modals/RevealPick";

class MainBody extends Component {

    constructor(props) {
        super(props);

        this.state = {
            contractAddress: window.localStorage.getItem("gameContract"),
            gameInstance: '',
            gameId: '',
            gameStarted: false,
            gameAceptingWithdrawal: false,
            winner: '',
            currentGame: '',
            isLoading: false,
            isPlayer1Revealed: false,
            isPlayer2Revealed: false,
            games: []
        };
    }

    componentDidMount() {
        this.initGameContractInstance();
        ("state: ", this.state)
    }

    initGameContractInstance = () => {

        const instance = new Web3(window.ethereum).eth.Contract(gameAbi, this.state.contractAddress);

        this.setState({
            gameInstance: instance
        });
    };

    getCurrentActiveGame = () => {

        const {gameInstance} = this.state;

        gameInstance.methods
            .getCurrentGame()
            .call({from: window.localStorage.getItem("current_eth_address")})
            .then(result => {
                this.setState({
                    currentGame: result["_hex"],
                    gameStarted: true
                }, () => console.log("currentGame: ", this.state.currentGame))

            })
            .catch(error => {
                console.log("error: ", error)
            })
    };

    handleContractAddressChange = (e) => {
        this.setState({
            contractAddress: e.target.value
        }, () => {
            this.initGameContractInstance();
            window.localStorage.setItem("gameContract", this.state.contractAddress);
        })
    };

    gameCreated = (game) => {
        this.setState({
            gameStarted: true
        }, () => this.getCurrentActiveGame())
    };

    gameReadyToWithdrawal = () => {

        this.setState({
            gameAceptingWithdrawal: true
        }, () => console.log(this.state))
    };

    playerRevealedPick = (player) => {

        console.log("player:", player);

        let playerNum = (player == "Player 1") ? "isPlayer1Revealed" : "isPlayer2Revealed";

        this.setState({
            [playerNum] : true
        }, () => this.resolution())

    };

    resolution = () => {
        const {gameInstance} = this.state;

        gameInstance.methods
            .getWinnerByGameId(this.state.currentGame)
            .call({from: window.localStorage.getItem("current_eth_address")})
            .then(result => {
                console.log("winner: ", result);
            })
            .catch(error => {
                console.log("error: ", error)
            })
    };

    renderGameInfo = () => {
        return (
            <Col md="auto">
                <div className="card mb-4 shadow-sm">
                    <img src="img/rockpaper.jpg"/>
                    <div className="card-body">
                        <p className="card-text">Теперь вы можете проверить свои ходы</p>
                        <div className="d-flex justify-content-between align-items-center">
                            <div className="btn-group">
                                <RevealPick
                                    label="Player 1"
                                    instance={this.state.gameInstance}
                                    gameId={this.state.currentGame}
                                    disabled={(this.state.isPlayer1Revealed) ? true : false}
                                    playerRevealedPick={(player) => this.playerRevealedPick(player)}
                                />
                            </div>

                            <div className="btn-group">
                                <RevealPick
                                    label="Player 2"
                                    instance={this.state.gameInstance}
                                    gameId={this.state.currentGame}
                                    disabled={(this.state.isPlayer2Revealed) ? true : false}
                                    playerRevealedPick={(player) => this.playerRevealedPick(player)}
                                />
                            </div>
                            <small className="text-muted">Winner: {this.state.winner}</small>
                        </div>
                    </div>
                </div>
            </Col>
        );
    };

    render() {
        return (

            <main role="main">

                <section className="jumbotron text-center">
                    <div className="container">
                        <h1 className="jumbotron-heading">Rock–paper–scissors</h1>
                        <p className="lead text-muted">Rock–paper–scissors is a hand game usually played between two
                            people,
                            in which each player simultaneously forms one of three shapes with an outstretched hand.
                            These shapes are "rock" (a closed fist), "paper" (a flat hand), and "scissors"
                            (a fist with the index finger and middle finger extended, forming a V). "Scissors" is
                            identical to the two-fingered V sign (also indicating "victory" or "peace") except that it
                            is pointed horizontally instead of being held upright in the air.
                            A simultaneous, zero-sum game, it has only two possible outcomes: a draw, or a win for one
                            player and a loss for the other. </p>

                        <InputGroup className="mb-3">
                            <InputGroup.Prepend>
                                <InputGroup.Text id="basic-addon1">@</InputGroup.Text>
                            </InputGroup.Prepend>
                            <FormControl
                                placeholder={this.state.contractAddress}
                                aria-label="Smart Contract Address"
                                aria-describedby="basic-addon1"
                                onChange={(e) => this.handleContractAddressChange(e)}

                            />
                        </InputGroup>

                        <Row className="justify-content-md-center">
                            <Col xs lg="2"></Col>
                            <Col md="auto">
                                <StartGame
                                    label="Start Game"
                                    instance={this.state.gameInstance}
                                    disabled={(this.state.contractAddress != "" && !this.state.gameStarted) ? false : true}
                                    gameStarted={(game) => this.gameCreated(game)}
                                />

                                {' '}

                                {
                                    (this.state.gameStarted === true) ? (
                                    <JoinGame
                                        instance={this.state.gameInstance}
                                        gameId={this.state.currentGame}
                                        disabled={(this.state.gameAceptingWithdrawal) ? true : false}
                                        gameReady={() => this.gameReadyToWithdrawal()}
                                    />) : ''
                                }

                            </Col>
                            <Col xs lg="2"></Col>
                        </Row>
                    </div>
                </section>

                {
                    (this.state.gameAceptingWithdrawal) ? (
                        <div className="album py-5 bg-light">
                            <Container>

                                <Row className="justify-content-md-center">
                                    <Col xs lg="2"></Col>

                                    {this.renderGameInfo()}

                                    <Col xs lg="2"></Col>
                                </Row>
                            </Container>
                        </div>
                    ) : ''
                }
            </main>

        );
    }
}

export default MainBody;
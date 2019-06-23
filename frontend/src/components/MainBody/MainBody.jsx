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
            contractAddress: '',
            gameInstance: '',
            gameId: '',
            gameStarted: false,
            gameAceptingWithdrawal: false,
            winner: '',
            games: []
        };
    }

    componentDidMount() {
        this.initGameContractInstance();
    }

    initGameContractInstance = () => {

        const instance = new Web3(window.ethereum).eth.Contract(gameAbi, this.state.contractAddress);

        console.log("instance: ", instance)

        this.setState({
            gameInstance: instance
        }, () => this.getCurrentGame());
    };

    getCurrentGame = () => {

        const {gameInstance} = this.state;

        gameInstance.methods
            .getCurrentGame()
            .call({from: window.localStorage.getItem("current_eth_address"), value: 2000000000000000})
            .then(result => {
                console.log("result: ", result);
                // TODO: setState gameId
            })
            .catch(error => {
                console.log("error: ", error)
            })
    }

    handleContractAddressChange = (e) => {
        this.setState({
            contractAddress: e.target.value
        }, () => this.initGameContractInstance())
    };

    gameCreated = (game) => {
        console.log("game: ", game);

        this.setState({
            gameStarted: true
        })
    };

    gameReadyToWithdrawal = () => {

        console.log("gameReadyToWithdrawal");

        this.setState({
            gameAceptingWithdrawal: true
        })
    };

    renderGameInfo = () => {
        return (
            <Col md={4}>
                <div className="card mb-4 shadow-sm">
                    <img src="img/rockpaper.jpg" />
                    <div className="card-body">
                        <p className="card-text">Теперь вы можете проверить свои ходы</p>
                        <div className="d-flex justify-content-between align-items-center">
                            <div className="btn-group">
                                <RevealPick label="Player 1" />
                            </div>

                            <div className="btn-group">
                                <RevealPick label="Player 2" />
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
                                placeholder="Smart Contract Address"
                                aria-label="Smart Contract Address"
                                aria-describedby="basic-addon1"
                                onChange={(e) => this.handleContractAddressChange(e)}
                            />
                        </InputGroup>

                        <p>
                            <StartGame
                                instance={this.state.gameInstance}
                                disabled={(this.state.contractAddress != "" && this.state.gameStarted == false) ? false : true}
                                gameStarted={(game) => this.gameCreated(game)}
                            />
                        </p>

                        {
                            (this.state.gameStarted) ?
                                (<p>

                                    <JoinGame
                                        instance={this.state.gameInstance}
                                        gameId={this.state.gameId}
                                        gameReady={() => this.gameReadyToWithdrawal()}
                                    />

                                </p>) : ''
                        }
                    </div>
                </section>

                {
                    (this.state.gameStarted) ? (
                        <div className="album py-5 bg-light">
                            <Container className="container">

                                <Row className="row">
                                    {
                                        this.renderGameInfo()
                                    }
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
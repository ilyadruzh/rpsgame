pragma solidity ^0.5.8;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";

/// @title Rock-Paper-Scissors game
contract RockPaperScissors {
    using SafeMath for uint256;

    uint256 public gameId = 0;
    uint256 public waitingTime = 1 days;

    struct Game {
        GameStage stage;
        address player1;
        address player2;
        address winner;

        bytes32 player1EncryptedPick;
        bytes32 player2EncryptedPick;

        Pick player1DecryptedPick;
        Pick player2DecryptedPick;

        bytes32 player1Seed;
        bytes32 player2Seed;

        mapping(address => uint256) deposits;
        mapping(address => uint256) allowedWithdrawal;

        uint256 endtimeForJoin;
        uint256 endtimeForReveal;
    }

    enum GameStage {
        NotExist,
        Created,
        Started,
        AllowedForWithdrawal,
        Ended
    }
    enum Pick {Null, Rock, Paper, Scissors}
    enum Result {Null, Standoff, Win, Misfire}

    mapping(uint256 => Game) public games;

    event Created(uint256 gameId, address player1, uint256 deposit, uint256 endtimeForJoin);
    event Started(uint256 gameId, address player1, address player2, uint256 deposit, uint256 endtimeForReveal);
    event AcceptedWithdrawal(
        uint256 gameId,
        address player1,
        address player2,
        uint256 player1AllowedWithdrawal,
        uint256 player2AllowedWithdrawal
    );

    constructor() public payable {}

    /// Создать игру
    /// @param encryptedPick зашифрованный выбор
    /// @dev 
    function createGame(bytes32 encryptedPick) public payable {
        require(msg.value >= 1 szabo, "deposit must be greater than the 1 szabo");

        gameId += 1;
        Game storage game = games[gameId];
        game.player1 = msg.sender;
        game.deposits[msg.sender] = msg.value;
        game.player1EncryptedPick = encryptedPick;
        game.stage = GameStage.Created;
        game.endtimeForJoin = block.timestamp.add(waitingTime);

        emit Created(
            gameId,
            game.player1,
            game.deposits[game.player1],
            game.endtimeForJoin
        );
    }

    /// Присоедениться к текущей игре
    /// @param _gameId идентификатор игры
    /// @param encryptedPick your encoded pick for RPS game
    /// @dev 
    function joinGame(uint256 _gameId, bytes32 encryptedPick) public payable {
        Game storage game = games[_gameId];

        require(game.stage != GameStage.NotExist, "the game does not exist");
        require(msg.value == game.deposits[game.player1], "deposit must be equal the player1's amount");
        require(timeIsntOver(game.endtimeForJoin), "the game was closed for participation");
        gameStageCorrect(game, GameStage.Created);

        game.player2 = msg.sender;
        game.deposits[msg.sender] = msg.value;
        game.player2EncryptedPick = encryptedPick;
        game.stage = GameStage.Started;
        game.endtimeForReveal = block.timestamp.add(waitingTime);


        emit Started(
            gameId,
            game.player1,
            game.player2,
            game.deposits[game.player2],
            game.endtimeForReveal
        );
    }

    /// Раскрыть свой выбор
    /// @param _gameId идентификатор игры
    /// @param pickNum сделанный изначально выбор
    /// @param seed секретный код
    /// @dev 
    function revealPick(uint256 _gameId, uint256 pickNum, bytes32 seed) public {

        Game storage game = games[_gameId];

        require(timeIsntOver(game.endtimeForReveal), "the endtime to reveal your pick of this game has passed");
        gameStageCorrect(game, GameStage.Started);
        accessOnlyForParticipants(game, msg.sender);

        Pick pick = numToPick(pickNum);
        bytes32 ePick = encryptedPick(pickNum, seed);

        if (msg.sender == game.player1) {
            require(game.player1EncryptedPick == ePick, "commit verification is failed");
            game.player1DecryptedPick = pick;
            game.player1Seed = seed;
        } else if (msg.sender == game.player2) {
            require(game.player2EncryptedPick == ePick, "commit verification is failed");
            game.player2DecryptedPick = pick;
            game.player2Seed = seed;
        }

        if (game.player1DecryptedPick != Pick.Null && game.player2DecryptedPick != Pick.Null) {

            Result result = resolution(game.player1DecryptedPick, game.player2DecryptedPick);

            if (result == Result.Win) {
                game.allowedWithdrawal[game.player1] = game.deposits[game.player1].mul(2);
//                game.winner = game.player1;
            } else if (result == Result.Misfire) {
                game.allowedWithdrawal[game.player2] = game.deposits[game.player2].mul(2);
//                game.winner = game.player2;
            } else if (result == Result.Standoff) {
                game.allowedWithdrawal[game.player1] = game.deposits[game.player1];
                game.allowedWithdrawal[game.player2] = game.deposits[game.player2];
            }

            game.stage = GameStage.AllowedForWithdrawal;

            emit AcceptedWithdrawal(
                gameId,
                game.player1,
                game.player2,
                game.allowedWithdrawal[game.player1],
                game.allowedWithdrawal[game.player2]
            );
        }
    }

    /// Вывести средства из игры
    /// @param _gameId идентификатор игры
    /// @dev 
    function withdraw(uint256 _gameId) public {

        Game storage game = games[_gameId];
        uint256 allowedAmount = game.allowedWithdrawal[msg.sender];

        require(allowedAmount != 0, "you haven't access to withdraw");
        gameStageCorrect(game, GameStage.AllowedForWithdrawal);
        accessOnlyForParticipants(game, msg.sender);

        game.allowedWithdrawal[msg.sender] = 0;
        msg.sender.transfer(allowedAmount);
    }

    /// Вернуть средства из игры
    /// @param _gameId идентификатор игры
    /// @dev 
    function rescue(uint256 _gameId) public {

        Game storage game = games[_gameId];

        require(isAllowedToRescueAtCreated(game) || isAllowedToRescueAtStarted(game), "invalid rescue");
        accessOnlyForParticipants(game, msg.sender);

        uint256 player1Deposit = game.deposits[game.player1];
        uint256 player2Deposit = game.deposits[game.player2];

        game.deposits[game.player1] = 0;
        game.deposits[game.player2] = 0;

        msg.sender.transfer(player1Deposit.add(player2Deposit));
    }

    /// Доступный баланс для снятия
    /// @param _gameId идентификатор игры
    /// @param playerAddress адрес игрока
    /// @dev 
    /// @return кол-во денег доступных для снятия
    function getAllowedWithdrawalAmount(uint256 _gameId, address playerAddress) public view returns (uint256) {
        Game storage game = games[_gameId];
        return game.allowedWithdrawal[playerAddress];
    }

    /// Узнать депозит по игре
    /// @param _gameId идентификатор игры
    /// @param playerAddress адрес игрока
    /// @dev 
    /// @return стоимость депозита
    function depositOf(uint _gameId, address playerAddress) public view returns (uint256) {
        Game storage game = games[_gameId];
        return game.deposits[playerAddress];
    }

    /// Решение о выигрыше
    /// @param pick1 выбор игрока 1
    /// @param pick2  выбор игрока 2
    /// @dev 
    /// @return резлльтат игры
    function resolution(Pick pick1, Pick pick2) public pure returns (Result) {

        if (pick1 == pick2) {
            return Result.Standoff;
        } else if (
            (pick1 == Pick.Rock && pick2 == Pick.Scissors) ||
            (pick1 == Pick.Paper && pick2 == Pick.Rock) ||
            (pick1 == Pick.Scissors && pick2 == Pick.Paper)
        ) {
            return Result.Win;
        } else if (
            (pick1 == Pick.Rock && pick2 == Pick.Paper) ||
            (pick1 == Pick.Paper && pick2 == Pick.Scissors) ||
            (pick1 == Pick.Scissors && pick2 == Pick.Rock)
        ) {
            return Result.Misfire;
        } else {
            assert(false);
        }
    }

    /// Доступен ли возврат средств
    /// @param game проверяемая игра
    /// @dev 
    /// @return можно ли вернуть деньги
    function isAllowedToRescueAtCreated(Game storage game) private view returns (bool) {

        return game.stage == GameStage.Created &&
        msg.sender == game.player1 &&
        game.deposits[game.player1] != 0 &&
        timeIsOver(game.endtimeForJoin);
    }

    /// Доступен ли возврат средств
    /// @param game проверяемая игра
    /// @dev 
    /// @return можно ли вернуть деньги
    function isAllowedToRescueAtStarted(Game storage game) private view returns (bool) {
        return game.stage == GameStage.Started &&
        isRevealed(game, msg.sender) &&
        game.deposits[game.player1] != 0 &&
        game.deposits[game.player2] != 0 &&
        timeIsOver(game.endtimeForReveal);
    }

    /// Время закончилось
    function timeIsOver(uint256 time) private view returns (bool) {
        return block.timestamp > time;
    }

    /// Время не закончилось
    function timeIsntOver(uint256 time) private view returns (bool) {
        return !timeIsOver(time);
    }

    /// Выбор раскрыт?
    /// @param game текущая игра
    /// @param playerAddress адрес игрока
    /// @dev 
    /// @return сделал ли пользователь выбор?
    function isRevealed(Game memory game, address playerAddress) private pure returns (bool) {
        require(playerAddress == game.player1 || playerAddress == game.player2, "Unknown player");

        if (playerAddress == game.player1) {
            return game.player1DecryptedPick != Pick.Null;
        } else if (playerAddress == game.player2) {
            return game.player2DecryptedPick != Pick.Null;
        }
    }

    /// Доступ только для участников
    /// @param game проверяемая игра
    /// @param sender адрес отправителя
    /// @dev 
    function accessOnlyForParticipants(Game memory game, address sender) private pure {
        require(sender == game.player1 || sender == game.player2, "forbidden");
    }

    /// Корректна ли стадия игры?
    /// @param game проверяемая игра
    /// @param stage стадия игры
    /// @dev 
    function gameStageCorrect(Game memory game, GameStage stage) private pure {
        require(game.stage == stage, "Stage is invalid");
    }

    /// Из числа в перечисление
    /// @param pickNum выбор ввиде числа
    /// @dev 
    /// @return возврат в видел перечисления
    function numToPick(uint256 pickNum) private pure returns (Pick) {
        Pick pick = Pick(pickNum);
        require(pick == Pick.Rock || pick == Pick.Paper || pick == Pick.Scissors, "Invalid value");

        return pick;
    }

    /// Шифрование выбора
    /// @param pickNum выбранный вариант
    /// @param seed секретный код для шифрования
    /// @dev 
    /// @return возвращаемый хэщ
    function encryptedPick(uint256 pickNum, bytes32 seed) private pure returns (bytes32) {
        return keccak256(abi.encodePacked(pickNum, seed));
    }

    /// Получить индентифкатор последней по счету игры
    /// retrun идентификатор игры
    function getCurrentGame() public view returns (uint256) {
        return gameId;
    }

    // function getGameInfo() public view returns () {}

    /// Получить победителя по конкретной игре
    /// @param _gameId идентификатор игры
    /// @dev
    /// return
    function getWinnerByGameId(uint256 _gameId) public view returns (address) {
        Game memory game = games[_gameId];

        return game.winner;
    }

    function() external payable {}
}

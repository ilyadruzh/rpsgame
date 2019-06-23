/* eslint-env mocha */

const RockPaperScissors = artifacts.require('RockPaperScissors');
const truffleAssert = require('truffle-assertions');
const { time } = require('openzeppelin-test-helpers');

const { soliditySha3, toBN, toWei } = web3.utils;

const PICK = {
  NULL: 0,
  ROCK: 1,
  PAPER: 2,
  SCISSORS: 3,
};

function createEncryptedPick(pick, hashedSecret) {
  return soliditySha3({ type: 'uint', value: pick }, { type: 'bytes32', value: hashedSecret });
}

async function calcFeeFromTxReceipt(receipt) {
  const tx = await web3.eth.getTransaction(receipt.tx);
  const gasUsed = toBN(receipt.receipt.gasUsed);
  const gasPrice = toBN(tx.gasPrice);
  return gasPrice.mul(gasUsed);
}

const encryptedPick = createEncryptedPick(PICK.ROCK, soliditySha3('aft random rock'));
const encryptedPickRock = encryptedPick;
const encryptedPickScissors = createEncryptedPick(PICK.SCISSORS, soliditySha3('aft random scissors'));
const encryptedPickPaper = createEncryptedPick(PICK.PAPER, soliditySha3('aft random paper'));

contract('Камень ножницы бумага', (accounts) => {
  
  let instance;
  
  const deploy = async () => {
    instance = await RockPaperScissors.new();
  };

  describe('Создание игры', () => {
    beforeEach(deploy);

    context('с отправкой ETH', () => {
      it('должна создасться новая игра и установлен депозит', async () => {
        await instance.createGame(encryptedPick, { from: accounts[0], value: toWei('1', 'szabo') });
        assert.equal(1, await instance.gameId.call());

        const firstGame = await instance.games.call(1);
        assert.equal(accounts[0], firstGame.player1);
        assert.equal(toWei('1', 'szabo'), await instance.depositOf(1, accounts[0]));

        await instance.createGame(encryptedPick, { from: accounts[1], value: toWei('42', 'szabo') });
        assert.equal(2, await instance.gameId.call());

        const secondGame = await instance.games.call(2);
        assert.equal(accounts[1], secondGame.player1);
        assert.equal(toWei('42', 'szabo'), await instance.depositOf(2, accounts[1]));
      });
    });

    context('без отправки ETH', () => {
      it('должно вернуться', async () => {
        await truffleAssert.reverts(
          instance.createGame(encryptedPick),
          'deposit must be greater than the 1 szabo',
        );
      });
    });

  });

  describe('Присоединение к игре', () => {

    beforeEach(async () => {
      await deploy();
      await instance.createGame(encryptedPick, { from: accounts[0], value: toWei('1', 'szabo') });
    });

    context('с депозитом равным установленому депозиту', () => {
      it('игра обновится', async () => {
        await instance.joinGame(1, encryptedPick, { from: accounts[1], value: toWei('1', 'szabo') });

        const game = await instance.games.call(1);
        assert.equal(accounts[1], game.player2);
      });
    });

    context('когда определен неверный идентификатор игры', () => {
      it('произойдет revert', async () => {
        await truffleAssert.reverts(
          instance.joinGame(42, encryptedPick, { from: accounts[1], value: toWei('1', 'szabo') }),
          'the game does not exist',
        );
      });
    });

    context('депозит неравен установленому депозиту', () => {
      it('произойдет revert', async () => {
        await truffleAssert.reverts(
          instance.joinGame(1, encryptedPick, { from: accounts[1], value: toWei('3', 'szabo') }),
          'deposit must be equal the player1\'s amount',
        );
      });
    });

  });

  describe('Раскрытие руки', () => {

    beforeEach(async () => {
      await deploy();
      await instance.createGame(encryptedPickRock, { from: accounts[0], value: toWei('1', 'szabo') });
      await instance.joinGame(1, encryptedPickScissors, { from: accounts[1], value: toWei('1', 'szabo') });
    });

    describe('пройти проверку и сохранить ее результат', () => {
      
      context('когда msg.sender является player1', () => {
      
        it('следует обновить атрибуты player1', async () => {
          const secret = soliditySha3('aft random rock');
          await instance.revealPick(1, PICK.ROCK, secret, { from: accounts[0] });

          const game = await instance.games.call(1);
          assert.equal(PICK.ROCK, game.player1DecryptedPick);
          assert.equal(secret, game.player1Seed);
        });
      });

      context('когда msg.sender является player2', () => {
        
        it('следует обновить атрибуты player2', async () => {
          const secret = soliditySha3('aft random scissors');
          await instance.revealPick(1, PICK.SCISSORS, secret, { from: accounts[1] });

          const game = await instance.games.call(1);
          assert.equal(PICK.SCISSORS, game.player2DecryptedPick);
          assert.equal(secret, game.player2Seed);
        });
      });

      context('когда проверяеый выбор отличается от первоначально использованной выбора', () => {
        
        it('произойдет revert', async () => {
          const secret = soliditySha3('aft random scissors');

          await truffleAssert.reverts(
            instance.revealPick(1, PICK.ROCK, secret, { from: accounts[1] }),
            'commit verification is failed',
          );
        });
      });

      context('когда секрет, который передается, отличается от первоначально использованного секрета', () => {
        
        it('произойдет revert', async () => {
          const secret = soliditySha3('apple');

          await truffleAssert.reverts(
            instance.revealPick(1, PICK.SCISSORS, secret, { from: accounts[1] }),
            'commit verification is failed',
          );
        });
      });
    });

    describe('сохранение результата', () => {
      
      context('когда выиграл player1', () => {
      
        it('необходимо обновить результат игры', async () => {
          await instance.revealPick(1, PICK.ROCK, soliditySha3('aft random rock'), { from: accounts[0] });
          await instance.revealPick(1, PICK.SCISSORS, soliditySha3('aft random scissors'), { from: accounts[1] });

          assert.equal(toWei('2', 'szabo'), await instance.getAllowedWithdrawalAmount.call(1, accounts[0]));
          assert.equal(toWei('0', 'szabo'), await instance.getAllowedWithdrawalAmount.call(1, accounts[1]));
        });
      });

      context('когда player1 проиграл', () => {
      
        it('необходимо обновить результат игры', async () => {
          await instance.createGame(encryptedPickPaper, { from: accounts[0], value: toWei('1', 'szabo') });
          await instance.joinGame(2, encryptedPickScissors, { from: accounts[1], value: toWei('1', 'szabo') });
          await instance.revealPick(2, PICK.PAPER, soliditySha3('aft random paper'), { from: accounts[0] });
          await instance.revealPick(2, PICK.SCISSORS, soliditySha3('aft random scissors'), { from: accounts[1] });

          assert.equal(toWei('0', 'szabo'), await instance.getAllowedWithdrawalAmount.call(2, accounts[0]));
          assert.equal(toWei('2', 'szabo'), await instance.getAllowedWithdrawalAmount.call(2, accounts[1]));
        });
      });

      context('когда ничья', () => {
        
        it('необходимо обновить результат игры', async () => {
          await instance.createGame(createEncryptedPick(PICK.ROCK, soliditySha3('tiger')), { from: accounts[0], value: toWei('1', 'szabo') });
          await instance.joinGame(2, createEncryptedPick(PICK.ROCK, soliditySha3('dragon')), { from: accounts[1], value: toWei('1', 'szabo') });
          await instance.revealPick(2, PICK.ROCK, soliditySha3('dragon'), { from: accounts[1] });
          await instance.revealPick(2, PICK.ROCK, soliditySha3('tiger'), { from: accounts[0] });

          assert.equal(toWei('1', 'szabo'), await instance.getAllowedWithdrawalAmount.call(2, accounts[0]));
          assert.equal(toWei('1', 'szabo'), await instance.getAllowedWithdrawalAmount.call(2, accounts[1]));
        });
      });
    });

  });

  describe('Получение выигрыша', () => {

    context('когда победил player1', () => {

      beforeEach(async () => {
        await deploy();
        await instance.createGame(encryptedPickRock, { from: accounts[0], value: toWei('3', 'szabo') });
        await instance.joinGame(1, encryptedPickScissors, { from: accounts[1], value: toWei('3', 'szabo') });
        await instance.revealPick(1, PICK.SCISSORS, soliditySha3('aft random scissors'), { from: accounts[1] });
        await instance.revealPick(1, PICK.ROCK, soliditySha3('aft random rock'), { from: accounts[0] });
      });

      context('когда player1 пытается получить выигрыш', () => {

        it('получит весь депозит', async () => {
          const beforeBalance = toBN(await web3.eth.getBalance(accounts[0]));
          const receipt = await instance.withdraw(1, { from: accounts[0] });
          const afterBalance = toBN(await web3.eth.getBalance(accounts[0]));

          const fee = await calcFeeFromTxReceipt(receipt);
          const delta = afterBalance.sub(beforeBalance).toString(10);
          const deltaWithoutFee = toBN(toWei('6', 'szabo'));

          assert.equal(delta, deltaWithoutFee.sub(fee).toString(10));
        });
      });

      context('когда player2 пытается получить выигрыш', () => {
       
        it('получит отказ', async () => {
          truffleAssert.reverts(
            instance.withdraw(1, { from: accounts[1] }),
            'you havn\'t access to withdraw',
          );
        });
      });
    });

  });

});

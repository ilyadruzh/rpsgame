const RockPaperScissors = artifacts.require("RockPaperScissors");

module.exports = function (deployer) {
    deployer.deploy(RockPaperScissors)
    .then(() => console.log("CONTRACT ADDRESS: ", RockPaperScissors.address));
};

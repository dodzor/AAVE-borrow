const aaveDeFi = artifacts.require("AAVEDeFi");

module.exports = function(deployer) {
    deployer.deploy(aaveDeFi);
}

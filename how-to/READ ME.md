Steps:
1. Install node
```sh
% node -v
```

2. Install node dependencies
```sh
% npm install 
```

3. Optional: Install Truffle globbaly
```sh
% npm install -g truffle@5.11.5"
% npx truffle version
Truffle v5.11.5 (core: 5.11.5)
Ganache v7.9.1
Solidity - 0.8.4 (solc-js)
Node v16.16.0
Web3.js v1.10.0
```
# note: mention solc version in truffle-config.js

4. Optional: Install Ganache(Ethereum client) globally
```sh
% npm install -g ganache-cli
% npx ganache-cli -f https://mainnet.infura.io/v3/INFURA_URL -p 8549
```

5. Migrate contracts
```sh 
% npx truffle compile
% npx truffle migrate --reset(deploys a new copy of the smart contract)
% npx truffle console
% token = await BorrowAAVE.deployed()
% name = await token.name()

6. use Mocha(comes with Truffle) testing framework and Chai assertion library
6.1 truffle test


5. Start React dev server
```sh
% npm run start
```
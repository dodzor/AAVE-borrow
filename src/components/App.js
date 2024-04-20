import React, { Component } from 'react'
import Web3 from 'web3'
import { ethers } from 'ethers'
import AaveDefi from '../abis/AAVEDeFi.json'
import './App.css'

const fromWei = (str) => (+str / 10**18).toString()
const toWei = (str) => (+str * 10**18).toString()

class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      web3: '',
      ethers: '',
      account: '',
      aaveDeFi: '',
      aaveDeFiAddress: '',
      totalETHDeposits: 0,
      totalDAIBorrows: 0,
      daiETHPrice: 0,
      ethBalance: 0,
      daiBalance: 0,
      ethDeposit: 0,
      miniABI: [ //Stripped ERC20 miniABI
        // balanceOf
        {
          "constant":true,
          "inputs":[{"name":"_owner","type":"address"}],
          "name":"balanceOf",
          "outputs":[{"name":"balance","type":"uint256"}],
          "type":"function"
        },
        // decimals
        {
          "constant":true,
          "inputs":[],
          "name":"decimals",
          "outputs":[{"name":"","type":"uint8"}],
          "type":"function"
        }
      ],
      daiTokenAddress: "0x6B175474E89094C44Da98b954EedeAC495271d0F"
    }

    // this.handleChange = this.handleChange.bind(this); //this is not needed when using arrow functions
  }

  async componentDidMount() {
    await this.loadWeb3()
    await this.loadEthers()
    await this.loadBlockchainData()
    await this.loadBlockchainDataUsingEthers()
    await this.loadTotalEthDeposits()
    await this.loadTotalEthDepositsUsingEthers()
    await this.loadTotalDaiBorrows()
    await this.loadDaiEthPrice()
    await this.loadETHBalance()
    await this.loadDAIBalance()
    await this.loadDAIBalanceUsingEthers()
    await this.loadATokenBalance()
    await this.getAccountUsingWeb3()
    await this.getAccountUsingEthers()
  }

  getWeb3Provider() {
    let provider
    if (window.ethereum) {
      provider = new Web3(window.ethereum)
    }
    return provider
  }
  
  getEthersProvider() {
    let provider
    if (window.ethereum) {
      provider = new ethers.providers.Web3Provider(window.ethereum)
    }
    return provider
  }

  async getAccountUsingWeb3() {
    const web3 = this.getWeb3Provider()
    let account
    
    if (web3) {
      const accounts = await web3.eth.getAccounts()
      account = accounts[0]
    }	
    return account
  }

  async getAccountUsingEthers() {
    if (window.ethereum) {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
      const account = ethers.utils.getAddress(accounts[0])
      return account
    }
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
      this.setState({web3: window.web3})
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
      this.setState({web3: window.web3})
    } else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }
  

  async loadEthers() {
    if (window.ethereum) {
      const connection = new ethers.providers.Web3Provider(window.ethereum)
      this.setState({ethers: connection})
    } else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }

  async loadBlockchainData() {
    const web3 = this.state.web3
    // Load account
    const accounts = await web3.eth.getAccounts()
    this.setState({account: accounts[0]})
    // Network ID
    const networkId = await web3.eth.net.getId();
    const networkData = AaveDefi.networks[networkId]
    if (networkData) {
      // set connection to contract in state
      const aaveDeFi = new web3.eth.Contract(AaveDefi.abi, networkData.address)
      this.setState({aaveDeFiAddress: networkData.address})
      this.setState({aaveDeFi})
      // set loading false after getting from blockchain
      this.setState({ loading: false})
    } else {
      window.alert('AaveDeFi contract not deployed to detected network.')
    }
  }

  async loadBlockchainDataUsingEthers() {
    const ethersProvider = this.state.ethers
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })

    //const { chainId } = await ethers.getNetwork() //1337
    const chainId = 1
    const networkData = AaveDefi.networks[chainId];
    if (networkData) {
      const aaveDeFiEthers = new ethers.Contract(networkData.address, AaveDefi.abi, ethersProvider)
      this.setState({aaveDeFiAddress: networkData.address})
      this.setState({aaveDeFiEthers})
        // set loading false after getting from blockchain
      this.setState({ loading: false})
    } else {
      window.alert('AaveDeFi contract not deployed to detected network.')
    }
  }

  async loadTotalEthDeposits() {
    let totalETHDeposits = await this.state.aaveDeFi.methods.totalETHDeposits(this.state.account).call()
    console.log("TOTAL ETH DEPOSITS" + totalETHDeposits.toString())
    totalETHDeposits = fromWei(totalETHDeposits.toString())
    this.setState({totalETHDeposits})
  }

  async loadTotalEthDepositsUsingEthers() {
    let totalETHDeposits = await this.state.aaveDeFiEthers.totalETHDeposits(this.state.account)
    totalETHDeposits = fromWei(totalETHDeposits)
    this.setState({totalETHDeposits})
  }

  async loadTotalDaiBorrows() {
    let totalDAIBorrows = await this.state.aaveDeFi.methods.totalDAIBorrows(this.state.account).call()
    totalDAIBorrows = fromWei(totalDAIBorrows.toString())
    console.log("TOTAL DAI BORROWS" + totalDAIBorrows.toString())
    this.setState({totalDAIBorrows})
  }

  async loadDaiEthPrice() {
    let daiETHPrice = await this.state.aaveDeFi.methods.daiEthprice().call()

    daiETHPrice = fromWei(daiETHPrice.toString()) //for some reason the return value is 0
    daiETHPrice = 0.000282235061256101 // just for testing
    console.log('daiETHprice: ' + daiETHPrice)

    this.setState({daiETHPrice})
  }

  async loadETHBalance() {
    const web3 = this.state.web3

    if(this.state.account) {
      let ethBalance  = await web3.eth.getBalance(this.state.account)
      ethBalance = fromWei(ethBalance.toString())
      this.setState({ethBalance})
    }
  }

  async loadDAIBalance() {
    const web3 = this.state.web3
    let contract = new web3.eth.Contract(this.state.miniABI, this.state.daiTokenAddress)
    
    if(this.state.account) {
      let daiBalance = await contract.methods.balanceOf(this.state.account).call()
      daiBalance = fromWei(daiBalance.toString())
      this.setState({daiBalance})
    }
  }

  async loadDAIBalanceUsingEthers() {
    let contract = new ethers.Contract(this.state.daiTokenAddress, this.state.miniABI, this.state.ethers)

    if (this.state.account) {
      let daiBalance = await contract.balanceOf(this.state.account)
      daiBalance = fromWei(daiBalance)
    }
  }

  async loadATokenBalance() {
    const web3 = this.state.web3

    let aWETHAddress = "0x030bA81f1c18d280636F32af80b9AAd02Cf0854e"
    let contract = new web3.eth.Contract(this.state.miniABI, aWETHAddress)

    if(this.state.aaveDeFi) {
      let aWETHBalances = await contract.methods.balanceOf(this.state.aaveDeFiAddress).call()
      aWETHBalances = fromWei(aWETHBalances.toString())
      this.setState({ aWETHBalances })
    }
  }

  handleChange = async (event) => {
      const ethDeposit = toWei(event.target.value)
      await this.setState({ethDeposit})
      console.log(`ETH DEPOSIT: ${ethDeposit}`)
  }

  borrowDAI = async () => {
    console.log('Starting process borrowing DAI from Aave')
    const ltv = 0.8 // loan to value ratio for ETH
    const safetyFactor = 0.6 // borrow only portion of max allowable to avoid liquidations
    const ethAmount = +this.state.ethDeposit.toString()
    const maxSafeETHBorrow = ltv * ethAmount
    const daiEthPriceValue = +this.state.daiETHPrice.toString()
    const safeMaxDAIBorrow = maxSafeETHBorrow * safetyFactor/ daiEthPriceValue / 10**18
    const safeMaxDAIBorrowWei = toWei(safeMaxDAIBorrow)
    const safeMaxDAIBorrowWeiBN = new this.state.web3.utils.BN(safeMaxDAIBorrowWei)
    console.log(safeMaxDAIBorrowWeiBN);

    await this.setState({loading: true})
    this.state.aaveDeFi.methods.borrowDAIAgainstETH(safeMaxDAIBorrowWeiBN)
    .send({from: this.state.account, value: this.state.ethDeposit})
    .on('transactionHash', (hash) => {
      this.setState({loading: false})
      window.location.reload()
      console.log('Successfully completed borrowing DAI')
    })
  }

  render() {
    return (
      <div>
        <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
          <h2>Aave DeFi</h2>
          <a
              className="mr-5"
              href={`https://etherscan.io/address/${this.state.account}`}
              target="_blank"
              rel="noopener noreferrer"
          >
             Account: {this.state.account}
          </a>
        </nav>
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 d-flex text-center">
              <div className="content mr-auto ml-auto">
              <h1>Aave DEFI DAPP</h1>
                <p>
                  Borrow some DAI from Aave by depositing ETH!
                </p>
                <p>
                  To borrow DAI you have to deposit some collateral in this case, ETH!
                </p>
                <p>
                  When you click button below, Metamask will prompt you to choose amount of ETH to send before submititng transaction.
                </p>
                <div>
                  <label>
                    Amount ETH Deposit:
                    <input type="text" value={this.state.value} onChange={this.handleChange} />
                  </label>
                  <button
                    className="mt-5 btn btn-primary btn-lg"
                    onClick = {this.borrowDAI}
                  >
                    Borrow DAI
                  </button>
                  {this.state.loading ? 
                    <div>Loading...</div> :
                  <>
                      <p className="mt-5">View WALLET balances below!</p>
                      <div className="row justify-content-center">
                        <div className="col-auto">
                          <table className ="table table-responsive m-auto">
                            <thead>
                              <tr>
                                <th scope="col">ETH Balance</th>
                                <th scope="col">DAI Balance</th>
                                <th scope="col">aWETH Balances(*AaveDeFi Contract*)</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td>{this.state.ethBalance}</td>
                                <td>{this.state.daiBalance}</td>
                                <td>{this.state.aWETHBalances}</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>          
                      <hr/>
                      <p className="mt-5">View your TOTAL Deposits and TOTAL BORROWS on our AaveDeFi Contract!</p>
                      <div className="row justify-content-center">
                        <div className ="col-auto">
                          <table className ="table table-responsive m-auto">
                            <thead>
                              <tr>
                                <th scope="col">Total ETH Deposits</th>
                                <th scope="col">Total DAI Borrows</th>
                                <th scope="col">Latest DAI/ETH price used</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td>{this.state.totalETHDeposits}</td>
                                <td>{this.state.totalDAIBorrows}</td>                              
                                <td><a 
                                  href="https://www.coingecko.com/en/coins/dai/eth" 
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >{this.state.daiETHPrice}</a></td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </>  
                }
                </div> 
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;

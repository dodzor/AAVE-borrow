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
    ]
    }

    // this.handleChange = this.handleChange.bind(this);
  }

  async componentDidMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
    await this.loadTotalEthDeposits()
    await this.loadTotalDaiBorrows()
    await this.loadDaiEthPrice()
    await this.loadETHBalance()
    await this.loadDAIBalance()
    await this.loadATokenBalance()
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
      await this.setState({ loading: false})
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

    let daiTokenAddress = "0x6B175474E89094C44Da98b954EedeAC495271d0F"
    let contract = new web3.eth.Contract(this.state.miniABI, daiTokenAddress)
    
    if(this.state.account) {
      let daiBalance = await contract.methods.balanceOf(this.state.account).call()
      daiBalance = fromWei(daiBalance.toString())
      this.setState({daiBalance})
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

  handleChange = (event) => {
      const ethDeposit = toWei(event.target.value)
      this.setState({ethDeposit})
      console.log(`ETH DEPOSIT: ${this.state.ethDeposit}`)
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

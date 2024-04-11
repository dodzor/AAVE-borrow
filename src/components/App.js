import React, { Component } from 'react'
import Web3 from 'web3'
import { ethers } from 'ethers'
import './App.css'

class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      web3: '',
      account: '',
    }
  }

  async componentDidMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
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
    const accounts = await web3.eth.getAccounts()
    this.setState({account: accounts[0]})
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
                
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;

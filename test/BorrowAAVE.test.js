const AAVEDeFi = artifacts.require('./AAVEDeFi')

require('chai')
    .use(require('chai-as-promised'))
    .should()

contract("AAVEDeFi", (accounts) => {
    let aaveDeFi
    let lendingPoolAddressesProvider = "0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5" // mainnet V2 lendingPoolAddresesProvider
    let lendingPoolAddress = "0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9" // mainnet lendingPool address
    let priceOracleAddress = "0xA50ba011c48153De246E5192C8f9258A2ba79Ca9" // mainnet Price Oracle address

    before(async () => {
        aaveDeFi = await AAVEDeFi.deployed()
    })

    describe('deployment', async () => {
        it('deploys successfully', async () => {
            const address = aaveDeFi.address
            assert.notEqual(address, '0x0')
            assert.notEqual(address, '')
            assert.notEqual(address, null)
            assert.notEqual(address, undefined)
        })

        it('has a the correct name', async () => {
            const name = await aaveDeFi.name()
            assert.equal(name, 'AAVE DeFi')
        })

        it('tracks the correct lendingPoolAddressesProvider address', async () => {
            const provider = await aaveDeFi.provider()
            assert.equal(provider, lendingPoolAddressesProvider)
        })

        it('tracks the correct lendingPoolAddress address', async () => {
            const lendingPool = await aaveDeFi.lendingPool()
            assert.equal(lendingPool, lendingPoolAddress)
        })

        it('tracks the correct priceOracleAddress address', async () => {
            const priceOracle = await aaveDeFi.priceOracle()
            assert.equal(priceOracle, priceOracleAddress)
        })
    })
})
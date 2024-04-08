const BorrowAAVE = artifacts.require('./BorrowAAVE')

require('chai')
    .use(require('chai-as-promised'))
    .should()

contract("BorrowAAVE", (accounts) => {
    let contract

    before(async () => {
        contract = await BorrowAAVE.deployed()
    })

    describe('deployment', async () => {
        it('deploys successfully', async () => {
            const address = contract.address
            assert.notEqual(address, '0x0')
            assert.notEqual(address, '')
            assert.notEqual(address, null)
            assert.notEqual(address, undefined)
        })

        it('has a name', async () => {
            const name = await contract.name()
            assert.equal(name, 'Borrow AAVE')
        })
    })
})
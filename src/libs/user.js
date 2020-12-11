const ScryptaCore = require("@scrypta/core")
const scrypta = new ScryptaCore(true)

module.exports.auth = async function auth(id) {
    if(localStorage.getItem('SID') !== null){
        if(localStorage.getItem('SID').indexOf('xpub') !== -1){
            localStorage.setItem('xSID', localStorage.getItem('SID'))
        }
    }
    if(localStorage.getItem('xSID') !== null){
        let SIDS = localStorage.getItem('xSID').split(':')
        let address = await scrypta.deriveKeyfromXPub (SIDS[0], "m/0")
        return {
            address: address.pub,
            walletstore: localStorage.getItem('xSID'),
            xpub: SIDS[0]
        }
    }else{
        return false
    }
}
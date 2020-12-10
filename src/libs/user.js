module.exports.auth = async function auth(id) {
    if(localStorage.getItem('SID') !== null){
        let SIDS = localStorage.getItem('SID').split(':')
        return {
            walletstore: localStorage.getItem('SID'),
            address: SIDS[0]
        }
    }else{
        return false
    }
}
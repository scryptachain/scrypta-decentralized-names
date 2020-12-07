let ScryptaCore = require("@scrypta/core")
const scrypta = new ScryptaCore(true)
const ScryptaDB = require('./db')
const db = new ScryptaDB(true)

module.exports.auth = async function auth(id) {
    let wallet = await scrypta.returnDefaultxSid()
    let defaultid = await localStorage.getItem('default')
    if(id !== undefined && id !== null && id.length > 0){
        defaultid = id
    }
    if(defaultid === null){
        if(wallet !== false && wallet !== ''){
            try{
                let SIDS = wallet.split(":")
                let xpub = SIDS[0];
                wallet = await db.get('xsid', 'xpub', xpub)
                let master = await scrypta.deriveKeyfromXPub(xpub, 'm/0')
                return {
                    xsid: wallet.wallet,
                    xpub: xpub,
                    label: wallet.label,
                    master: master.pub
                }
            }catch(e){
                return false
            }
        }else{
            await scrypta.importBrowserSID()
            let defaultid = await scrypta.returnDefaultIdentity()
            if(defaultid !== false && defaultid !== ''){
                try{
                    let SIDS = defaultid.split(":")
                    let address = SIDS[0];
                    wallet = await scrypta.returnIdentity(address)
                    return {
                        sid: wallet.wallet,
                        address: address,
                        label: wallet.label,
                        master: address
                    }
                }catch(e){
                    return false
                }
            }else{
                let sid = await db.get('wallet')
                let xsid = await db.get('xsid')
                if(xsid.length > 0){
                    let SIDS = xsid[0].wallet.split(":")
                    let xpub = SIDS[0];
                    let master = await scrypta.deriveKeyfromXPub(xpub, 'm/0')
                    return {
                        xsid: xsid[0].wallet,
                        xpub: xpub,
                        label: xsid[0].label,
                        master: master.pub
                    }
                }else if(sid.length > 0){
                    let SIDS = sid[0].wallet.split(":")
                    let address = SIDS[0];
                    return {
                        sid:  sid[0].wallet,
                        address: address,
                        label: sid[0].label,
                        master: address
                    }
                }else{
                    return false
                }
            }
        }
    }else{
        if(defaultid.indexOf('xpub') !== -1){
            let SIDS = defaultid.split(':')
            let wallet = await db.get('xsid', 'xpub', SIDS[0])
            let master = await scrypta.deriveKeyfromXPub(wallet.xpub, 'm/0')
            return {
                xsid: wallet.wallet,
                xpub: wallet.xpub,
                label: wallet.label,
                master: master.pub
            }
        }else{
            let SIDS = defaultid.split(':')
            let wallet = await db.get('wallet', 'address', SIDS[0])
            return {
                sid: wallet.wallet,
                address: wallet.address,
                label: wallet.label,
                master: wallet.address
            }
        }
    }
}

module.exports.configs = async function configs() {
    return new Promise(async response => {
        
        let language = await db.get('settings', 'set', 'language')
        if(!language){
            language = 'en'
            await db.put('settings', { set: 'language', value: 'en' })
        }else{
            language = language.value
        }

        let chain = await db.get('settings', 'set', 'chain')
        if(!chain){
            chain = 'LYRA'
            await db.put('settings', { set: 'chain', value: 'LYRA' })
        }else{
            chain = chain.value
        }

        response({
            chain: chain,
            language: language
        })
    })

}
module.exports = class ScryptaDB {
    constructor(isBrowser = false){
        const db = this 
        db.isBrowser = isBrowser
        db.data = {}
        db.dir = './db'
    }

    loadBrowserDB(){
        const db = this
        return new Promise(response => {
            const collections = ["settings", "wallet", "xsid"]
            for(let x in collections){
                if (localStorage.getItem(collections[x]) !== null) {
                    db.data[collections[x]] = JSON.parse(localStorage.getItem(collections[x]))
                }else{
                    db.data[collections[x]] = []
                    localStorage.setItem(collections[x], JSON.stringify([]))
                }
            }
            response(true)
        })
    }

    put(collection, doc){
        const db = this

        return new Promise(async response => {
            await db.loadBrowserDB()
            let found = false
            for(let x in db.data[collection]){
                if(JSON.stringify(doc) === JSON.stringify(db.data[collection][x])){
                    found = true
                }
            }
            if(!found){
                db.data[collection].push(doc)
                localStorage.setItem(collection, JSON.stringify(db.data[collection]))
            }
            response(true)
        })    
    }

    get(collection, selector = '', id = ''){
        const db = this
        return new Promise(async response => {
            await db.loadBrowserDB()
            if(selector !== '' && id !== ''){
                let found = false
                let doc
                for(let x in db.data[collection]){
                    if(!found){
                        if(db.data[collection][x][selector] === id){
                            found = true
                            doc = db.data[collection][x]
                        }
                    }
                }

                if(found){
                    response(doc)
                }else{
                    response(false)
                }
            }else{
                response(db.data[collection])
            }
        })
    }

    update(collection, selector, id, doc){
        const db = this
        return new Promise(async response => {
            await db.loadBrowserDB()

            let found = false
            for(let x in db.data[collection]){
                if(!found){
                    if(db.data[collection][x][selector] === id){
                        found = true
                        db.data[collection][x] = doc
                    }
                }
            }

            if(found){
                if(db.isBrowser){
                    localStorage.setItem(collection, JSON.stringify(db.data[collection]))
                }else{
                    db.fs.writeFileSync(db.dir + '/' + collection + '.json', JSON.stringify(db.data[collection]))
                }
                response(doc)
            }else{
                response(false)
            }
        })
    }

    delete(collection, selector, id){
        const db = this
        return new Promise(async response => {
            await db.loadBrowserDB()
            let toStore = []
            for(let x in db.data[collection]){
                if(db.data[collection][x][selector] !== id){
                    toStore.push(db.data[collection][x])
                }
            }
            if(db.isBrowser){
                localStorage.setItem(collection, JSON.stringify(toStore))
            }else{
                db.fs.writeFileSync(db.dir + '/' + collection + '.json', JSON.stringify(toStore))
            }
            response(true)
        })
    }

    destroy(collection){
        const db = this
        db.data[collection] = []
        return new Promise(async response => {
            await db.loadBrowserDB()
            localStorage.setItem(collection, '[]')
            
            response(true)
        })
    }
}
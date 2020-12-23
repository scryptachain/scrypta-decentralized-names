import React, { useState, useEffect } from 'react';
import { Form, Heading, Container, Columns, Modal, Section, } from 'react-bulma-components';
import { NavBar, } from '../components/navbar.jsx';
import { useParams } from 'react-router-dom';
import Gravatar from 'react-gravatar'
const ScryptaCore = require('@scrypta/core')
const scrypta = new ScryptaCore(true)
scrypta.staticnodes = true
const { Input, Control } = Form;

export function Showcase(props) {
    let [listed, setList] = useState([])
    let [searcher, setSearcher] = useState("")
    let [password, setPassword] = useState("")
    let [isSearching, setSearching] = useState(false)
    let [isAvailable, setAvailability] = useState(false)
    let [checked, setChecked] = useState(false)
    let [balance, setBalance] = useState(0)
    let [isBuying, setBuying] = useState(false)
    let [showConfirm, setShowConfirm] = useState(false)
    let [selected, setSelected] = useState({})
    let [showDialog, setShowDialog] = useState(false)
    let [textDialog, setTextDialog] = useState("")
    let [titleDialog, setTitleDialog] = useState("")


    let ban = ["register:turinglabs"]
    useEffect(() => {
        async function init() {
            let address = await scrypta.createAddress('-', false)
            let request = await scrypta.createContractRequest(address.walletstore, '-', { contract: "LcD7AGaY74xvVxDg3NkKjfP6QpG8Pmxpnu", function: "names", params: {} })
            let response = await scrypta.sendContractRequest(request)
            let registered = []
            for (let k in response) {
                if (registered.indexOf(response[k].name) === -1 && response[k].price !== undefined && response[k].price !== null) {
                    registered.push(response[k])
                }
            }
            setChecked(true)
            setList(registered)
        }
        if (!checked) {
            init()
        }
    })


    async function searchName() {
        if (searcher.length > 0 && !isSearching) {
            setSearching(true)
            let address = await scrypta.createAddress('-', false)
            let request = await scrypta.createContractRequest(address.walletstore, '-', { contract: "LcD7AGaY74xvVxDg3NkKjfP6QpG8Pmxpnu", function: "search", params: { "name": searcher } })
            let response = await scrypta.sendContractRequest(request)
            setSearching(false)
            if (response.message !== undefined && response.message === 'Name not found.') {
                setAvailability(true)
            } else if (response.address !== undefined) {
                openDialog('Ops', 'This domain is taken by ' + response.address)
                setAvailability(false)
            }
        } else {
            openDialog('Ops', 'Write a name first!')
        }
    }

    const returnSell = () => {
        if (listed.length > 0) {
            let inSell = []
            for (let k in listed) {
                if (listed[k].payment !== null && listed[k].payment !== null) {
                    inSell.push(listed[k])
                }
            }
            inSell = inSell.reverse()
            if (inSell.length > 0) {
                return <Columns style={{ marginTop: "40px" }}>
                    {inSell.map((value, index) => {
                        if (ban.indexOf(value.name) === -1) {
                            return (
                                <Columns.Column key={index} size="half">
                                    <div className="nes-container is-rounded">
                                        <div className="nes-container is-rounded with-title" align="center" style={{ marginTop: "10px" }} >
                                            <h1 className="title" style={{ fontSize: "22px", fontWeight: "600" }}>{value.name}</h1>
                                            <Gravatar style={{ padding: 0, margin: "10px 0", width: "50%" }} email={value.uuid} />
                                            <div style={{ textAlign: "left", marginTop: "10px" }}>
                                                <p style={{ fontSize: "12px" }}>Registered by:<br /> <b>{value.owner} </b></p>
                                                <p style={{ fontSize: "12px" }}>Domain ID:<br /><b>{value.uuid} </b></p><br />
                                            </div>
                                            <div style={{ height: "70px"}}>
                                                <div style={{ float: "left" }}>
                                                    <i style={{ margin: "0" }} className="nes-icon big coin"></i>
                                                </div>
                                                <h1 style={{float: "left", paddingLeft: "60px", textAlign: "left", marginTop: "10px" }}>Price:<br/> <b> {value.price} LYRA</b></h1>
                                                {returnBuyButton(value)}
                                            </div>
                                        </div>
                                    </div>
                                </Columns.Column>
                            )
                        } else {
                            return false;
                        }
                    })}
                </Columns>
            }
        } else {
            return (
                <p>Nothing to show</p>
            )
        }
    }

    function _handleKeyDown(e) {
        if (e.key === 'Enter') {
            searchName()
        }
    }

    async function buyDomain() {
        if (password.length > 0 && !isBuying) {
            setBuying(true)
            let master = await scrypta.readxKey(password, props.user.walletstore)
            if (master !== false) {
                let key = await scrypta.deriveKeyFromSeed(master.seed, "m/0")
                let masterkey = await scrypta.importPrivateKey(key.prv, '-', false)
                let balance = await scrypta.get('/balance/' + key.pub)

                if (balance.balance >= (parseFloat(selected.price) + 0.001)) {
                    let buyTx = await scrypta.send(masterkey.walletstore, '-', selected.payment, parseFloat(selected.price), "names://buy:" + selected.uuid)
                    if (buyTx !== null && buyTx.length === 64) {
                        openDialog('Well Done', 'Name bougth!')
                        setAvailability(false)
                        setSearcher("")
                        setBuying(false)
                        setShowConfirm(false)
                        setPassword("")
                        setTimeout(async function () {
                            let address = await scrypta.createAddress('-', false)
                            let request = await scrypta.createContractRequest(address.walletstore, '-', { contract: "LcD7AGaY74xvVxDg3NkKjfP6QpG8Pmxpnu", function: "names", params: {} })
                            let response = await scrypta.sendContractRequest(request)
                            let registered = []
                            for (let k in response) {
                                if (response[k].owner !== props.user.address && registered.indexOf(response[k].name) === -1 && response[k].price !== undefined && response[k].price !== null) {
                                    registered.push(response[k])
                                }
                            }
                            setChecked(true)
                            setList(registered)
                            
                        }, 1500)
                    } else {
                        setBuying(false)
                        openDialog('Ops', 'Something goes wrong, please retry!')
                    }
                } else {
                    setBuying(false)
                    openDialog('Ops', 'Not enough funds!')
                }
            } else {
                setBuying(false)
                openDialog('Ops', 'Wrong password!')
            }
        }
    }

    const returnConfirmBox = () => {
        if (showConfirm) {
            return <Modal show={showConfirm} onClose={() => setShowConfirm(false)}>
                <Modal.Content style={{ textAlign: "center" }}>
                    <Section style={{ backgroundColor: 'white' }}>
                        <Heading>Confirm to Buy</Heading>
                            This name is still available, enter your password to buy it!<br /><br />
                        <div className="nes-field">
                            <Input className="nes-input" style={{ width: "100%!important", textAlign: "center" }} placeholder="Insert wallet password" type="password" onChange={(evt) => { setPassword(evt.target.value) }} value={password} />
                            <br></br><br></br>
                        </div>
                        {!isBuying ? <button className="nes-btn is-success" onClick={buyDomain}>Confirm and Buy</button> : <div>Registering, please wait...</div>}
                    </Section>
                </Modal.Content>
            </Modal>
        }
    }

    function returnDialog() {
        if (showDialog) {
            return (
                <div className="dialog-wrapper">
                    <dialog className="nes-dialog" open>
                        <p className="title">{titleDialog}</p>
                        <p>{textDialog}</p>
                        <menu className="dialog-menu">
                            <button className="nes-btn" onClick={() => { setShowDialog(false) }} className="nes-btn is-primary">OK</button>
                        </menu>
                    </dialog>
                </div>
            )
        }
    }

    function returnBuyButton(value){
        if(props.user.address !== value.owner) {
            return(
                <button className="nes-btn is-success" style={{ marginTop: "15px", float: "right" }} onClick={() => { setShowConfirm(true); setSelected(value) }}>BUY</button>
            )
        }else{
            return(
                <button className="nes-btn is-primary" style={{ marginTop: "15px", float: "right" }} onClick={() => { window.location = '/details/' + value.uuid }}>DETAILS</button>
            )
        }
    }
    function openDialog(title, text) {
        setTitleDialog(title)
        setTextDialog(text)
        setShowDialog(true)
    }

    return (
        <div className="Showcase">
            {returnConfirmBox()}
            {returnDialog()}
            <NavBar />
            <Container>
                <div style={{ marginTop: "150px" }}>
                    <div className="nes-container is-rounded" style={{ position: "relative" }}>
                        <div className="nes-field">
                            <Input className="nes-input" onKeyDown={_handleKeyDown} style={{ width: "100%!important" }} onChange={(evt) => { 
                                let name = evt.target.value.toLocaleLowerCase(); 
                                name = name.replace(/[^\w\s]/gi, "");
                                setSearcher(name) 
                            }} value={searcher} placeholder={"Search a blockchain name"} />
                        </div>
                        {!isSearching ? <Control style={{ position: "absolute", bottom: 13, right: 15 }}>
                            <button className="nes-btn is-primary" onClick={searchName} color="info">Search</button>
                        </Control> : <div style={{ marginTop: "20px" }}>Searching...</div>}
                    </div>
                </div>
                    {returnSell()}
            </Container>
        </div>
    );
}
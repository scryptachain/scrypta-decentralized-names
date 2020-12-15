import { Button } from 'react-bulma-components';
import React, { useState, useEffect } from 'react';
import { Form, Heading, Card, Content, Media, Container, Columns, Box, Modal, Section, } from 'react-bulma-components';
import { NavBar, } from '../components/navbar.jsx';
import { useParams } from 'react-router-dom';
import Gravatar from 'react-gravatar'
const ScryptaCore = require('@scrypta/core')
const scrypta = new ScryptaCore(true)
scrypta.staticnodes = true
const { Input, Control } = Form;

export function Showcase(props) {
    let [owned, setOwned] = useState([])
    let [searcher, setSearcher] = useState("")
    let [password, setPassword] = useState("")
    let [isSearching, setSearching] = useState(false)
    let [isAvailable, setAvailability] = useState(false)
    let [checked, setChecked] = useState(false)
    let [balance, setBalance] = useState(0)
    let [isBuying, setBuying] = useState(false)
    let [showConfirm, setShowConfirm] = useState(false)
    let [selected, setSelected] = useState({})


    let ban = ["register:turinglabs"]
    useEffect(() => {
        async function init() {
            let address = await scrypta.createAddress('-', false)
            let request = await scrypta.createContractRequest(address.walletstore, '-', { contract: "LcD7AGaY74xvVxDg3NkKjfP6QpG8Pmxpnu", function: "names", params: {} })
            let response = await scrypta.sendContractRequest(request)
            let registered = []
            for (let k in response) {
                console.log(response[k].price)
                if (response[k].owner !== props.user.address && registered.indexOf(response[k].name) === -1 && response[k].price !== undefined && response[k].price !== null) {
                    registered.push(response[k])
                }
            }
            setChecked(true)
            setOwned(registered)
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
                alert('This domain is taken by ' + response.address)
                setAvailability(false)
            }
        } else {
            alert('Write a name first!')
        }
    }

    const returnSell = () => {
        if (owned.length > 0) {
            let inSell = []
            for (let k in owned) {
                if (owned[k].payment !== null && owned[k].payment !== null) {
                    inSell.push(owned[k])
                }
            }
            if (inSell.length > 0) {
                return <div>
                    {inSell.map((value, index) => {
                        if (ban.indexOf(value.name) === -1) {
                            return <div key={index}>
                                <Card>
                                    <Card.Content align="center">
                                        <h1 style={{ fontSize: "26px", fontWeight: "600" }}>{value.name}</h1>
                                        <Gravatar style={{ marginTop: "10px", width: "100%" }} email={value.uuid} />
                                        <div style={{ position: "relative", fontSize: "12px" }} >
                                            <div style={{ textAlign: "left" }}>
                                                Registered by: <b>{value.owner} </b><br />
                                                Domain ID: <b>{value.uuid} </b><br />
                                            </div>
                                            <h1 style={{ fontSize: "22px", marginTop: "10px" }}>Price: <b> {value.price} LYRA</b></h1>
                                        </div>
                                        <Button style={{ marginTop: "10px" }} color="success" onClick={() => { setShowConfirm(true); setSelected(value) }} renderAs="a">BUY</Button>

                                    </Card.Content>
                                </Card>
                            </div>
                        } else {
                            return false;
                        }
                    })}
                </div>
            }
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
                        alert('Name bougth!')
                        setAvailability(false)
                        setSearcher("")
                        setBuying(false)
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
                            setOwned(registered)
                        }, 1500)
                    } else {
                        setBuying(false)
                        alert('Something goes wrong, please retry!')
                    }
                } else {
                    setBuying(false)
                    alert('Not enough funds!')
                }
            } else {
                setBuying(false)
                alert('Wrong password!')
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
                        <Input style={{ width: "100%!important", textAlign: "center" }} placeholder="Insert wallet password" type="password" onChange={(evt) => { setPassword(evt.target.value) }} value={password} /><br></br><br></br>
                        {!isBuying ? <Button onClick={buyDomain} color="info">Confirm and Buy</Button> : <div>Registering, please wait...</div>}
                    </Section>
                </Modal.Content>
            </Modal>
        }
    }

    return (
        <div className="Showcase">
            {returnConfirmBox()}
            <NavBar />
            <Section>
                <Container style={{ position: "relative" }}>
                    <Input onKeyDown={_handleKeyDown} className="myInput" style={{ width: "100%!important" }} onChange={(evt) => { setSearcher(evt.target.value) }} value={searcher} placeholder={"Search a blockchain domain"} />
                    {!isSearching ? <Control style={{ position: "absolute", bottom: 0, right: 0 }}>
                        <Button className="myButton" onClick={searchName} color="info">Search</Button>
                    </Control> : <div style={{ marginTop: "20px" }}>Searching...</div>}
                </Container>
                <Columns align="center">
                    <Columns.Column size={3} style={{ marginTop: "40px" }}>
                        {returnSell()}
                    </Columns.Column>
                </Columns>
            </Section>
        </div>
    );
}
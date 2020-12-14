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
    

    let ban = ["register:turinglabs"]
    useEffect(() => {
        async function init() {
            let address = await scrypta.createAddress('-', false)
            let request = await scrypta.createContractRequest(address.walletstore, '-', { contract: "LcD7AGaY74xvVxDg3NkKjfP6QpG8Pmxpnu", function: "names", params: {} })
            let response = await scrypta.sendContractRequest(request)
            let registered = []
            for (let k in response) {
                if (response[k].owner === props.user.address && registered.indexOf(response[k].name) === -1) {
                    registered.push(response[k])
                }
            }
            let written = await scrypta.post("/read", { address: props.user.address })
            let totalBalance = 0
            let totFees = 0
            for (let k in written.data) {
                if (written.data[k].data.indexOf("sell:") === 0) {
                    let split = written.data[k].data.split(':')
                    let balance = await scrypta.get("/balance/" + split[2])
                    if (balance.balance > 0) {
                        let fees = balance.balance / 100 * 10
                        let canWithdraw = balance.balance - fees - 0.002
                        totFees += fees
                        totalBalance += canWithdraw
                    }
                }
            }
            totalBalance = totalBalance.toFixed(8)
            setChecked(true)
            setOwned(registered)
            setBalance(totalBalance)
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
                            return <div>
                                <Card>
                                    <Card.Content align="center">
                                        <h1 style={{ fontSize: "32px", fontWeight: "600" }}>{value.name}</h1>
                                        <Gravatar style={{ marginTop: "10px", width: "100%" }} email={value.uuid} />
                                        <div style={{ position: "relative" }} key={index}>
                                            <div style={{ textAlign: "left" }}>
                                                Registered by: <b>{value.owner} </b><br />
                                                Domain ID: <b>{value.uuid} </b><br />
                                            </div>
                                            <h1 style={{ fontSize: "30px", marginTop: "10px" }}>Price: <b> {value.price} LYRA</b></h1>
                                        </div>
                                        <Button style={{ marginTop: "20px" }} color="success" renderAs="a">BUY</Button>
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

    return (
        <div className="Showcase">
            <NavBar />
            <Container style={{ position: "relative" }}>
                <h1 style={{ fontSize: "22px", fontWeight: 600, color: "#005D7F" }}><br />What do you want to register today?</h1><br></br>
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
        </div>
    );
}
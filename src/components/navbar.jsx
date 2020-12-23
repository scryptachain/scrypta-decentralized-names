import { Navbar } from 'react-bulma-components';
import { button } from 'react-bulma-components';
import React, { useState, useEffect } from 'react';
import Scrypta from '../assets/logo.png'


const ScryptaCore = require('@scrypta/core')
const scrypta = new ScryptaCore(true)

export function NavBar() {
    let [logged, setLogged] = useState(false)

    async function authUser() {
        if (localStorage.getItem('SID') !== null) {
            if (localStorage.getItem('SID').indexOf('xpub') !== -1) {
                localStorage.setItem('xSID', localStorage.getItem('SID'))
            }
        }
        if (localStorage.getItem('xSID') !== null) {
            let SIDS = localStorage.getItem('xSID').split(':')
            let address = await scrypta.deriveKeyfromXPub(SIDS[0], "m/0")
            return {
                address: address.pub,
                walletstore: localStorage.getItem('xSID'),
                xpub: SIDS[0]
            }
        } else {
            return false
        }
    }

    useEffect(() => {
        async function fetchUser() {
            let auth = await authUser();
            if (auth !== false) {
                setLogged(true)
            }
        }
        if (!logged) {
            fetchUser()
        }
    }, [logged])

    const LoginButton = () => {
        if (logged) {
            return (
                <Navbar className="noMobile">
                    <Navbar.Brand>
                        <Navbar.Item renderAs="a" href="/">
                            <img src={Scrypta} style={{ paddingRight: "20px" }} alt="Scrypta Decentralized Names" />
                            <h1 style={{ color: "white", margin: "10px 0" }}>Scrypta Decentralized Names</h1>
                        </Navbar.Item>
                    </Navbar.Brand>
                    <Navbar.Container position="end">
                        <Navbar.Menu >
                            <Navbar.Item renderAs="a" href="/">
                                <button className="nes-btn is-warning" >Dashboard</button>
                            </Navbar.Item>
                            <Navbar.Item renderAs="a" href="/showcase">
                                <button className="nes-btn is-success" >Showcase</button>
                            </Navbar.Item>
                            <Navbar.Item onClick={() => { localStorage.removeItem('wallet'); localStorage.removeItem('xSID'); localStorage.removeItem('SID'); setLogged(false); window.location = "/" }}>
                                <button className="nes-btn is-error" style={{ marginRight: "30px" }}>LOGOUT</button>
                            </Navbar.Item>
                        </Navbar.Menu>
                    </Navbar.Container>
                </Navbar>
            )
        } else {
            return (
                <Navbar>
                    <Navbar.Brand>
                        <Navbar.Item renderAs="a" href="/">
                            <img src={Scrypta} style={{ paddingRight: "20px" }} alt="Scrypta Decentralized Names" />
                            <h1 style={{ color: "white", margin: "10px 0" }}>Scrypta Decentralized Names</h1>
                        </Navbar.Item>
                        <Navbar.Burger />
                    </Navbar.Brand>
                    <Navbar.Container position="end">
                        <Navbar.Menu >
                            <Navbar.Item renderAs="a" href="/how-it-works">
                                <button className="nes-btn is-warning" style={{ marginRight: "30px" }}>HOW IT WORKS</button>
                            </Navbar.Item>
                        </Navbar.Menu>
                    </Navbar.Container>
                </Navbar>
            )
        }
    }

    return (
        <Navbar className="noMobile"
            active={true}
            transparent={false}
            style={{ backgroundColor: "#005D7F" }}
        >
            <Navbar.Brand>
                <Navbar.Item href="/">
                    <img src="/logo.png" alt="Scrypta Dentralized Names" style={{ marginRight: "15px" }} height="28" />
                    <h1 style={{ color: "white", marginTop: "12px" }}>Decentralized Names</h1>
                </Navbar.Item>
                <Navbar.Burger />
            </Navbar.Brand>
            {LoginButton()}
        </Navbar>
    );
}
import { Navbar } from 'react-bulma-components';
import { button } from 'react-bulma-components';
import React, { useState, useEffect } from 'react';

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
            return <Navbar.Menu >
                <Navbar.Container position="end">
                    <Navbar.Item>
                        <a href="/showcase">
                            <button className="nes-btn is-warning" >Dashboard</button>
                        </a>
                    </Navbar.Item>
                    <Navbar.Item>
                        <a href="/showcase">
                            <button className="nes-btn is-success" >Showcase</button>
                        </a>
                    </Navbar.Item>
                    <Navbar.Item onClick={() => { localStorage.removeItem('wallet'); localStorage.removeItem('xSID'); localStorage.removeItem('SID'); setLogged(false); window.location = "/" }}>
                        <button className="nes-btn is-error" style={{ marginRight: "30px" }}>LOGOUT</button>
                    </Navbar.Item>
                </Navbar.Container>
            </Navbar.Menu>
        } else {
            return <Navbar.Menu >
                <Navbar.Container position="end">
                    <Navbar.Item>
                        <a href="/how-it-works">
                            <button className="nes-btn is-warning" style={{ marginRight: "30px" }}>HOW IT WORKS</button>
                        </a>
                    </Navbar.Item>
                </Navbar.Container>
            </Navbar.Menu>
        }
    }

    return (
        <Navbar
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
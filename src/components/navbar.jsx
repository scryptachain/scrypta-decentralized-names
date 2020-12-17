import { Navbar } from 'react-bulma-components';
import { button } from 'react-bulma-components';
import React, { useState, useEffect } from 'react';
const User = require("../libs/user");

export function NavBar() {
    let [logged, setLogged] = useState(false)

    useEffect(() => {
        async function fetchUser() {
            let auth = await User.auth();
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
                            <button className="nes-btn is-success" >Go to Showcase</button>
                        </a>
                    </Navbar.Item>
                    <Navbar.Item onClick={() => { localStorage.removeItem('wallet'); localStorage.removeItem('xSID'); localStorage.removeItem('SID'); setLogged(false); window.location="/" }}>
                        <button className="nes-btn is-error" style={{ marginRight: "30px" }}>LOGOUT</button>
                    </Navbar.Item>
                </Navbar.Container>
            </Navbar.Menu>
        } else {
            return <Navbar.Menu >
                <Navbar.Container position="end">
                    <Navbar.Item renderAs="a" href="/how-it-works">
                        <button className="nes-btn is-warning" style={{ marginRight: "30px" }}>HOW IT WORKS</button>
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
                <Navbar.Item renderAs="a" href="/">
                    <img src="/logo.png" alt="Scrypta Dentralized Names" style={{ marginRight: "15px" }} height="28" />
                    <h1 style={{ color: "white", marginTop: "12px" }}>Decentralized Names</h1>
                </Navbar.Item>
                <Navbar.Burger />
            </Navbar.Brand>
            {LoginButton()}
        </Navbar>
    );
}
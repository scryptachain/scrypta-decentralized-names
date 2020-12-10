import { Navbar } from 'react-bulma-components';
import { Button } from 'react-bulma-components';
import React, { useState, useEffect } from 'react';
const User = require("../libs/user");

export function NavBar() {
    let [logged, setLogged] = useState(false)
    
    useEffect(() => {
        async function fetchUser(){
            let auth = await User.auth();
            if (auth !== false) {
                setLogged(true)
            }
        }
        if(!logged){
            fetchUser()
        }
    }, [logged])

    const LoginButton = () =>{
        if(logged){
          return <Navbar.Menu >
                <Navbar.Container position="end">
                    <Navbar.Item renderAs="a" href="#" onClick={() => { localStorage.removeItem('wallet'); localStorage.removeItem('SID'); setLogged(false) }}>
                        <Button color="info">LOGOUT</Button>
                    </Navbar.Item>
                </Navbar.Container>
            </Navbar.Menu>
        } else {
          return <Navbar.Menu >
                <Navbar.Container position="end">
                    <Navbar.Item renderAs="a" href="/login">
                        <Button color="info">LOGIN</Button>
                    </Navbar.Item>
                </Navbar.Container>
            </Navbar.Menu>
        }
      }

    return (
        <Navbar
            active={true}
            transparent={false}
            color="primary"
        >
            <Navbar.Brand>
                <Navbar.Item renderAs="a" href="/">
                    <img src="/logo.png" alt="Scrypta Dentralized Names" style={{ marginRight: "15px" }} height="28" /> Decentralized Names
                    </Navbar.Item>
                <Navbar.Burger />
            </Navbar.Brand>
            {LoginButton()}
        </Navbar>
    );
}
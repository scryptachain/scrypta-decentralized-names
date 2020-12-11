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
                    <Navbar.Item renderAs="a" href="#" onClick={() => { localStorage.removeItem('wallet'); localStorage.removeItem('xSID'); setLogged(false) }}>
                        <Button color="danger" style={{marginRight: "30px"}}>LOGOUT</Button>
                    </Navbar.Item>
                </Navbar.Container>
            </Navbar.Menu>
        } else {
          return <Navbar.Menu >
                <Navbar.Container position="end">
                    <Navbar.Item renderAs="a" href="/login">
                        <Button color="success" style={{marginRight: "30px"}}>LOGIN</Button>
                    </Navbar.Item>
                </Navbar.Container>
            </Navbar.Menu>
        }
      }

    return (
        <Navbar
            active={true}
            transparent={false}
            style={{backgroundColor: "#005D7F"}}
        >
            <Navbar.Brand>
                <Navbar.Item renderAs="a" href="/">
                    <img src="/logo.png" alt="Scrypta Dentralized Names" style={{ marginRight: "15px" }} height="28"/> 
                    <h1 style={{color: "white"}}>Decentralized Names</h1>
                    </Navbar.Item>
                <Navbar.Burger />
            </Navbar.Brand>
            {LoginButton()}
        </Navbar>
    );
}
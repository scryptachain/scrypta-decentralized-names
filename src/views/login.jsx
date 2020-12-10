import { NavBar } from "../components/navbar";
import React, { useEffect } from 'react';
const User = require("../libs/user");

export function Login() {
    let user
    useEffect(() => {
        async function fetchUser() {
          let auth = await User.auth()
          if(auth !== false){
            window.location = '/'
          }
        }
        fetchUser();
      }, [user]);

    return (
        <div className="Login">
            <NavBar />
            Login page
            <div id="scrypta-login" dapp="Demo dApp"></div>
        </div>
    );
}
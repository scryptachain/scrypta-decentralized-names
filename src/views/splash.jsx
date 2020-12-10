import { Button } from 'react-bulma-components';
import React, { useState } from 'react';
const ScryptaCore = require('@scrypta/core')
const scrypta = new ScryptaCore(true)

export function Splash() {
    return (
        <div className="Splash">
            <div>
                <h1><span style={{ fontSize: "70px", marginTop: "30px" }}>Scrypta</span><br />Decentralized Names</h1><br />
            </div>
            <p>
                This is an example of how Scrypta Smart Contracts works, let's define what you'll be able to do with this dApp:<br />
                Please login with your extension to start play with this dApp.<br /><br />
            </p>
            <ul>
                <li>A list of public blockchain names, managed directly by the Smart Contract</li>
                <li>You'll be able to register your own name</li>
            </ul><br />
            <h1>
                Want to see what's going on without stress?<br />
                Don't panic, push below button.
            </h1><br />
            <Button onClick={
                async () => {
                    localStorage.setItem('isGuest', true)
                    window.location.reload()
                }} color="primary">Enter!</Button>
        </div>
    );
}
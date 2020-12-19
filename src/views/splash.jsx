import { Section, Image, Container, Heading } from 'react-bulma-components';
import React, { useState } from 'react';
import LogoWhite from '../assets/logo-white.svg'
const ScryptaCore = require('@scrypta/core')
const scrypta = new ScryptaCore(true)

export function Splash() {
    return (
        <div className="Splash">
            <Section>
                <Container align="center">
                    <Heading>
                        <div style={{ width: "300px" }}>
                            <Image alt="Scrypta" src={LogoWhite} />
                        </div>
                    </Heading>
                    <Heading style={{ color: "white", marginTop: "30px", fontSize: "30px" }}>
                        Decentralized Names
                    </Heading>
                </Container>
                <Section>
                    <p>
                        Please login with your <a style={{ color: "#fff", textDecoration: "underline" }} href="https://chrome.google.com/webstore/detail/scrypta-manent-wallet/didcemkbebjgcbblnimfajmnmedgagjf" target="_blank">extension</a> to start playing with this dApp.<br /><br />
                        This is what you can do here:
                    </p>
                    <ul>
                        <li>A list of public blockchain names</li>
                        <li>You'll be able to register your own name</li>
                        <li>You'll be able to sell or buy names</li>
                    </ul><br />
                    <h1>
                        Want to see what's going on?<br />
                        Don't panic, push below button.
                </h1><br />
                    <button className="nes-btn" onClick={
                        async () => {
                            localStorage.setItem('isGuest', true)
                            window.location.reload()
                        }}>Enter!</button>
                </Section>
            </Section>
        </div>

    );
}
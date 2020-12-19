import { NavBar } from "../components/navbar";
import { Container, Columns, Box, Content } from 'react-bulma-components';
import React, { useEffect } from 'react';
import Play from '../assets/play.png'
import Search from '../assets/mush.png'
import Enter from '../assets/enter.png'

const ScryptaCore = require('@scrypta/core')
const scrypta = new ScryptaCore(true)

export function Login() {
  let user

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
      let auth = await authUser()
      if (auth !== false) {
        window.location = '/'
      }
    }
    fetchUser();
  }, [user]);

  return (
    <div className="Login">
      <NavBar />
      <Container className="login-container" style={{ padding: "220px 0", backgroundColor: "#470F47" }} align="center">
        <Columns>
          <Columns.Column>
            <Box className="nes-container is-rounded" style={{ padding: "30px 20px", }}>
              <h1 style={{ color: "#005D7F", fontSize: "28px", fontWeight: "600" }}>Login</h1>
              <img src={Enter} style={{ height: "250px" }} alt="Login" />
              <Content>
                <p style={{ color: "#005D7F", fontSize: "16px", marginTop: "30px" }}>Login with Scrypta Manent Exstension.<br />You can download it for <a href="https://addons.mozilla.org/it/firefox/addon/scrypta-manent-wallet/?utm_source=addons.mozilla.org&utm_medium=referral&utm_content=search" target="_blank">Firefox</a> or <a href="https://chrome.google.com/webstore/detail/scrypta-manent-wallet/didcemkbebjgcbblnimfajmnmedgagjf?hl=it" target="_blanl">Chromium-based</a> browsers.</p>
              </Content>
            </Box>
          </Columns.Column>
          <Columns.Column>
            <Box className="nes-container is-rounded" style={{ padding: "30px 20px" }}>
              <h1 style={{ color: "#005D7F", fontSize: "28px", fontWeight: "600" }}>Search</h1>
              <img src={Search} style={{ height: "250px" }} alt="Search" />
              <Content>
                <p style={{ color: "#005D7F", fontSize: "16px", marginTop: "30px" }}>Search your blockchain name and check if it is available or buy an existent blockchain name sold by someone.</p>
              </Content>
            </Box>
          </Columns.Column>
          <Columns.Column>
            <Box className="nes-container is-rounded" style={{ padding: "30px 20px" }}>
              <h1 style={{ color: "#005D7F", fontSize: "28px", fontWeight: "600" }}>Register</h1>
              <img src={Play} style={{ height: "250px" }} alt="play" />
              <Content>
                <p style={{ color: "#005D7F", fontSize: "16px", marginTop: "30px" }}>Register your blockchain name forever. Your address will be linked to that name.</p>
              </Content>
            </Box>
          </Columns.Column>
        </Columns>
      </Container>
    </div>
  );
}
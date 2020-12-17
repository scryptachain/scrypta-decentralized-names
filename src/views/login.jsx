import { NavBar } from "../components/navbar";
import { Container, Columns, Box, Content } from 'react-bulma-components';
import React, { useEffect } from 'react';
import Play from '../assets/play.png'
import Search from '../assets/mush.png'
import Enter from '../assets/enter.png'
const User = require("../libs/user");

export function Login() {
  let user
  useEffect(() => {
    async function fetchUser() {
      let auth = await User.auth()
      if (auth !== false) {
        window.location = '/'
      }
    }
    fetchUser();
  }, [user]);

  return (
    <div className="Login">
      <NavBar />
      <Container style={{ padding: "220px 0", backgroundColor: "#470F47" }} align="center">
        <Columns>
          <Columns.Column>
            <Box className="nes-container is-rounded" style={{ padding: "30px 20px",  }}>
              <h1 style={{ color: "#005D7F", fontSize:"28px", fontWeight:"600" }}>Login</h1>
              <img src={Enter} style={{ height: "250px" }} alt="Login" />
              <Content>
                <p style={{ color: "#005D7F", fontSize: "16px", marginTop: "30px" }}>Login with Scrypta Manent Exstension.<br/>You can download it for Firefox or Chromium-based browsers.</p>
              </Content>
            </Box>
          </Columns.Column>
          <Columns.Column>
            <Box className="nes-container is-rounded" style={{ padding: "30px 20px" }}>
            <h1 style={{ color: "#005D7F", fontSize:"28px", fontWeight:"600" }}>Search</h1>
            <img src={Search} style={{ height: "250px" }} alt="Search" />
              <Content>
                <p style={{ color: "#005D7F", fontSize: "16px", marginTop: "30px" }}>Search your blockchain name and check if it is available or buy an existent blockchain name sold by someone.</p>
              </Content>
            </Box>
          </Columns.Column>
          <Columns.Column>
            <Box className="nes-container is-rounded" style={{ padding: "30px 20px" }}>
            <h1 style={{ color: "#005D7F", fontSize:"28px", fontWeight:"600" }}>Register</h1>
              <img src={Play} style={{ height: "250px" }} alt="play"/>
              <Content>
                <p style={{ color: "#005D7F", fontSize: "16px", marginTop: "30px"}}>Register your blockchain name forever. Your address will be linked to that name.</p>
              </Content>
            </Box>
          </Columns.Column>
        </Columns>
      </Container>
    </div>
  );
}
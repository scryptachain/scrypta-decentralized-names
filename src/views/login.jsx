import { NavBar } from "../components/navbar";
import { Container, Columns, Heading, Box, Media, Image, Content } from 'react-bulma-components';
import React, { useEffect } from 'react';
import LoginOne from '../assets/login.svg'
import Domain from '../assets/domain.svg'
import Check from '../assets/check.svg'
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
      <Container style={{ marginTop: "10px" }} align="center">
        <Columns style={{ marginTop: "100px" }}>
          <Columns.Column>
            <Box>
              <Media>
                <Media.Item renderAs="figure" position="left">
                  <Image size={64} alt="64x64" src={LoginOne} />
                </Media.Item>
                <Media.Item>
                  <Content>
                    <h1>Step One</h1>
                    <p>Lorem ipsum dolor sit amet......</p>
                  </Content>
                </Media.Item>
              </Media>
            </Box>
          </Columns.Column>
          <Columns.Column>
            <Box>
              <Media>
                <Media.Item renderAs="figure" position="left">
                  <Image size={64} alt="64x64" src={Domain} />
                </Media.Item>
                <Media.Item>
                  <Content>
                    <h1>Step Two</h1>
                    <p>Lorem ipsum dolor sit amet......</p>
                  </Content>
                </Media.Item>
              </Media>
            </Box>
          </Columns.Column>
          <Columns.Column>
            <Box>
              <Media>
                <Media.Item renderAs="figure" position="left">
                  <Image size={64} alt="64x64" src={Check} />
                </Media.Item>
                <Media.Item>
                  <Content>
                    <h1>Step Three</h1>
                    <p>Lorem ipsum dolor sit amet......</p>
                  </Content>
                </Media.Item>
              </Media>
            </Box>
          </Columns.Column>
        </Columns>
      </Container>
      <Container style={{ marginTop: "50px" }}>
        <div id="scrypta-login" dapp="Demo dApp"></div>
      </Container>
    </div>
  );
}
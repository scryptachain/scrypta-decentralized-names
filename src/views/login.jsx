import { NavBar } from "../components/navbar";
import { Container, Columns, Box, Media, Image, Content } from 'react-bulma-components';
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
        <Columns style={{ marginTop: "200px" }}>
          <Columns.Column>
            <Box className="myBox" style={{ padding: "50px 20px" }}>
              <Media>
                <Media.Item renderAs="figure" position="left">
                  <Image size={64} alt="64x64" src={LoginOne} />
                </Media.Item>
                <Media.Item>
                  <Content>
                    <h1 style={{ color: "#005D7F" }}>Step One</h1>
                    <p style={{ color: "#005D7F", fontSize: "16px" }}>Please login with Scrypta ID by clicking on the button below. You can synchronize it with Manent App, use the Scrypta Card or simply upload the .sid file</p>
                  </Content>
                </Media.Item>
              </Media>
            </Box>
          </Columns.Column>
          <Columns.Column>
            <Box className="myBox" style={{ padding: "50px 20px" }}>
              <Media>
                <Media.Item renderAs="figure" position="left">
                  <Image size={64} alt="64x64" src={Domain} />
                </Media.Item>
                <Media.Item>
                  <Content>
                    <h1 style={{ color: "#005D7F" }}>Step Two</h1>
                    <p style={{ color: "#005D7F", fontSize: "16px" }}>Once logged in, simply enter the Domain Name in the search bar to check if it is available and proceed with the domain registration.<br /><br /></p>
                  </Content>
                </Media.Item>
              </Media>
            </Box>
          </Columns.Column>
          <Columns.Column>
            <Box className="myBox" style={{ padding: "50px 20px" }}>
              <Media>
                <Media.Item renderAs="figure" position="left">
                  <Image size={64} alt="64x64" src={Check} />
                </Media.Item>
                <Media.Item>
                  <Content>
                    <h1 style={{ color: "#005D7F" }}>Step Three</h1>
                    <p style={{ color: "#005D7F", fontSize: "16px" }}>By clicking on the confirmation button you will have registered your Domain Name forever. The registration fee is only 10 LYRA. Enjoy!<br /><br /></p>
                  </Content>
                </Media.Item>
              </Media>
            </Box>
          </Columns.Column>
        </Columns>
      </Container>
      <Container align= "center" style={{ marginTop: "100px"}}>
        <div id="scrypta-login" dapp="Scrypta Decentralized Names"></div>
      </Container>
    </div>
  );
}
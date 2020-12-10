import { Button } from 'react-bulma-components';
import React, { useState } from 'react';
import { Form, Heading, Card, Content, Media, Container, Columns, Column, Label, Box, } from 'react-bulma-components';
import { NavBar, } from '../components/navbar.jsx';
const ScryptaCore = require('@scrypta/core')
const scrypta = new ScryptaCore(true)
const { Input, Field, Control } = Form;

export function Explore() {
  let [search, setSearch] = useState([])
  let [explore, setExplore] = useState([])
  let [searcher, setSearcher] = useState("")

  async function init() {
    let address = await scrypta.createAddress('MyPassword')
    let request = await scrypta.createContractRequest(address.walletstore, 'MyPassword', { contract: "LgSAtP3gPURByanZSM32kfEu9C1uyQ6Kfg", function: "search", params: { contract: "LcD7AGaY74xvVxDg3NkKjfP6QpG8Pmxpnu", version: "latest" } })
    setSearch(JSON.stringify(request))
  }

  init()

  return (
    <div>
      <NavBar />
      <div className="Explore">
        <Container>
          <Columns>
            <Columns.Column style={{ marginTop: "40px" }}>
              <Box>
                <h1><b>Search a name</b></h1>
                <Field>
                  <Input onChange={(evt) => { setSearcher(evt.target.value) }} value={searcher} />
                  <Control style={{ position: "absolute", top: "95px", right: "100px" }}>
                    <Button color="info">Search</Button>
                  </Control>
                </Field>
              </Box>
            </Columns.Column>
          </Columns>
        </Container>
        <Container>
          <Columns>
            <Columns.Column style={{ marginTop: "40px" }}>
              <Card>
                <Card.Content align="center">
                  <Media>
                    <Media.Item>
                      <Heading size={5} align="center">LATEST DOMAIN REGISTERED</Heading>
                    </Media.Item>
                  </Media>
                  <hr></hr>
                  <Content>
                    {search}
                  </Content>
                </Card.Content>
              </Card>
            </Columns.Column>
          </Columns>
        </Container>
      </div>
    </div>
  );
}
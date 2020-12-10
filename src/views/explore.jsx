import { Button } from 'react-bulma-components';
import React, { useState, useEffect } from 'react';
import { Form, Heading, Card, Content, Container, Columns, Box, } from 'react-bulma-components';
import { NavBar, } from '../components/navbar.jsx';
const ScryptaCore = require('@scrypta/core')
const scrypta = new ScryptaCore(true)
scrypta.staticnodes = true
const { Input, Control } = Form;

export function Explore() {
  let [history, setHistory] = useState([])
  let [searcher, setSearcher] = useState("")
  let ban = ["register:turinglabs"]
  useEffect(() => {
    async function init() {
      let address = await scrypta.createAddress('-', false)
      let request = await scrypta.createContractRequest(address.walletstore, '-', { contract: "LcD7AGaY74xvVxDg3NkKjfP6QpG8Pmxpnu", function: "names", params: {} })
      let response = await scrypta.sendContractRequest(request)
      setHistory(response)
    }
    if (history.length === 0) {
      init()
    }
  })

  async function searchName() {
    if (searcher.length > 0) {
      let address = await scrypta.createAddress('-', false)
      let request = await scrypta.createContractRequest(address.walletstore, '-', { contract: "LcD7AGaY74xvVxDg3NkKjfP6QpG8Pmxpnu", function: "search", params: { "name": searcher } })
      let response = await scrypta.sendContractRequest(request)
      if (response.message !== undefined && response.message === 'Name not found.') {
        alert('This domain is available, proceed!')
      } else if (response.address !== undefined) {
        alert('This domain is taken by ' + response.address)
      }
    } else {
      alert('Write a name first!')
    }
  }

  return (
      <div className="Explore">
      <NavBar />
        <Container>
          <Columns>
            <Columns.Column style={{ marginTop: "150px" }} align="center">
              <Card>
                <Content>
                </Content>
              </Card>
              <h1 style={{fontSize: "40px", fontWeight: "600"}}>Blockchain Domain Names</h1>
              <Box>
                <Input className="myInput" style={{ width: "100%!important" }} onChange={(evt) => { setSearcher(evt.target.value) }} value={searcher} placeholder={"Search a blockchain domain"} />
                <Control style={{ position: "absolute", top: "242px", right: "20px" }}>
                  <Button className="myButton" onClick={searchName} color="info">Search</Button>
                </Control>
              </Box>
            </Columns.Column>
          </Columns>
          <Columns>
            <Columns.Column style={{ marginTop: "40px" }}>
              <Card>
                <Card.Content align="center">
                  <Box className="header-color">
                    <Heading size={5} align="center" style={{color: "white"}}>LATEST DOMAIN REGISTERED</Heading>
                  </Box>
                  <hr></hr>
                  <Content>
                    {history.map((value, index) => {
                      if (ban.indexOf(value.name) === -1) {
                        return <div key={index}>
                          <h4 stlye={{ marginBottom: "-30px" }}>{value.name}</h4>
                            registered by: <b>{value.owner} </b><hr />
                        </div>
                      } else {
                        return false;
                      }
                    })}
                  </Content>
                </Card.Content>
              </Card>
            </Columns.Column>
          </Columns>
        </Container>
      </div>
  );
}
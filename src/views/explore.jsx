import { Button } from 'react-bulma-components';
import React, { useState, useEffect } from 'react';
import { Form, Heading, Card, Content, Media, Container, Columns, Box, } from 'react-bulma-components';
import { NavBar, } from '../components/navbar.jsx';
const ScryptaCore = require('@scrypta/core')
const scrypta = new ScryptaCore(true)
scrypta.staticnodes = true
const { Input, Control } = Form;

export function Explore() {
  let [history, setHistory] = useState([])
  let [searcher, setSearcher] = useState("")
  let ban = ["register:turinglabs"]

  async function init() {
    let address = await scrypta.createAddress('-')
    let request = await scrypta.createContractRequest(address.walletstore, '-', { contract: "LcD7AGaY74xvVxDg3NkKjfP6QpG8Pmxpnu", function: "names", params: {} })
    let response = await scrypta.sendContractRequest(request)
    setHistory(response)
  }

  useEffect(() => {
    if (history.length === 0) {
      init()
    }
  })

  async function searchName() {
    if (searcher.length > 0) {
      let address = await scrypta.createAddress('-')
      let request = await scrypta.createContractRequest(address.walletstore, '-', { contract: "LcD7AGaY74xvVxDg3NkKjfP6QpG8Pmxpnu", function: "search", params: { "name": searcher } })
      let response = await scrypta.sendContractRequest(request)
      if(response.message !== undefined && response.message === 'Name not found.'){
        alert('This domain is available, proceed!')
      } else if(response.address !== undefined){
        alert('This domain is taken by ' + response.address)
      }
    } else {
      alert('Write a name first!')
    }
  }

  return (
    <div>
      <NavBar />
      <div className="Explore">
        <Container>
          <Columns>
            <Columns.Column style={{ marginTop: "40px" }}>
              <Box>
                <h1><b>Search a name</b></h1>
                <Input style={{width: "100%!important; padding-right:300px"}} onChange={(evt) => { setSearcher(evt.target.value) }} value={searcher} />
                <Control style={{ position: "absolute", top: "95px", right: "20px" }}>
                  <Button onClick={searchName} color="info">Search</Button>
                </Control>
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
                      {history.map((value, index) => {
                        if (ban.indexOf(value.name) === -1) {
                          return <div key={index}>
                            <h4 stlye={{marginBottom:"-30px"}}>{value.name}</h4>
                            registered by: <b>{value.owner} </b><hr/>
                          </div>
                        }else{
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
    </div>
  );
}
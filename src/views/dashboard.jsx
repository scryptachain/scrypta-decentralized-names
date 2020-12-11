import { Button } from 'react-bulma-components';
import React, { useState, useEffect } from 'react';
import { Form, Heading, Card, Content, Media, Container, Columns, Box, Modal, Section, Image } from 'react-bulma-components';
import { NavBar, } from '../components/navbar.jsx';
import Gravatar from 'react-gravatar'
const ScryptaCore = require('@scrypta/core')
const scrypta = new ScryptaCore(true)
scrypta.staticnodes = true
const { Input, Control } = Form;

export function Dashboard(props) {
  let [owned, setOwned] = useState([])
  let [searcher, setSearcher] = useState("")
  let [password, setPassword] = useState("")
  let [isSearching, setSearching] = useState(false)
  let [isRegistering, setRegistering] = useState(false)
  let [isAvailable, setAvailability] = useState(false)

  let ban = ["register:turinglabs"]
  useEffect(() => {
    async function init() {
      let address = await scrypta.createAddress('-', false)
      let request = await scrypta.createContractRequest(address.walletstore, '-', { contract: "LcD7AGaY74xvVxDg3NkKjfP6QpG8Pmxpnu", function: "names", params: {} })
      let response = await scrypta.sendContractRequest(request)
      let registered = []
      for (let k in response) {
        if (response[k].owner === props.user.address && registered.indexOf(response[k].name) === -1) {
          registered.push(response[k])
        }
      }
      setOwned(registered)
    }
    if (owned.length === 0) {
      init()
    }
  })

  async function searchName() {
    if (searcher.length > 0 && !isSearching) {
      setSearching(true)
      let address = await scrypta.createAddress('-', false)
      let request = await scrypta.createContractRequest(address.walletstore, '-', { contract: "LcD7AGaY74xvVxDg3NkKjfP6QpG8Pmxpnu", function: "search", params: { "name": searcher } })
      let response = await scrypta.sendContractRequest(request)
      setSearching(false)
      if (response.message !== undefined && response.message === 'Name not found.') {
        setAvailability(true)
      } else if (response.address !== undefined) {
        alert('This domain is taken by ' + response.address)
        setAvailability(false)
      }
    } else {
      alert('Write a name first!')
    }
  }

  async function placeSell(toSell, price) {
    if (password.length > 0 && !isRegistering) {
      setRegistering(true)
      let mnemonic = await scrypta.readxKey(password, props.user.walletstore)
      if (mnemonic !== false) {
        let SIDS = localStorage.getItem('xSID').split(':')
        let hash = await scrypta.hash(toSell)
        let path = await scrypta.hashtopath(hash)
        let key = await scrypta.deriveKeyFromMnemonic(mnemonic, "m/0")
        let paymentAddress = await scrypta.deriveKeyfromXPub(SIDS[0], path)
        let toWrite = 'sell:' + toSell + ':' + paymentAddress.pub + ':' + price
        let writingKey = await scrypta.importPrivateKey(key.prv, '-', false)
        await scrypta.write(writingKey.walletstore, '-', toWrite, '', '', 'names://')
        setRegistering(false)
      } else {
        setRegistering(false)
        alert('Wrong password!')
      }
    }
  }

  async function removeSell(toRemove) {
    if (password.length > 0 && !isRegistering) {
      setRegistering(true)
      let mnemonic = await scrypta.readxKey(password, props.user.walletstore)
      if (mnemonic !== false) {
        let key = await scrypta.deriveKeyFromMnemonic(mnemonic, "m/0")
        let toWrite = 'remove:' + toRemove
        let writingKey = await scrypta.importPrivateKey(key.prv, '-', false)
        await scrypta.write(writingKey.walletstore, '-', toWrite, '', '', 'names://')
      } else {
        setRegistering(false)
        alert('Wrong password!')
      }
    }
  }

  async function takeFunds(toTake) {
    if (password.length > 0 && !isRegistering) {
      setRegistering(true)
      let mnemonic = await scrypta.readxKey(password, props.user.walletstore)
      if (mnemonic !== false) {
        let SIDS = localStorage.getItem('xSID').split(':')
        let hash = await scrypta.hash(toTake)
        let path = await scrypta.hashtopath(hash)
        let key = await scrypta.deriveKeyFromMnemonic(mnemonic, "m/0")
        let paymentAddress = await scrypta.deriveKeyfromXPub(SIDS[0], path)
        let balance = await scrypta.get('/balance/' + paymentAddress)
        if (balance.balance > 0) {
          let masterKey = await scrypta.importPrivateKey(key.prv, '-', false)
          // TODO: withdraw to main address
        } else {
          alert('Nothing to take!')
        }
      } else {
        setRegistering(false)
        alert('Wrong password!')
      }
    }
  }

  async function registerName() {
    if (password.length > 0 && !isRegistering) {
      setRegistering(true)
      let mnemonic = await scrypta.readxKey(password, props.user.walletstore)
      if (mnemonic !== false) {
        let key = await scrypta.deriveKeyFromMnemonic(mnemonic, "m/0")
        let balance = await scrypta.get('/balance/' + props.user.address)
        if (balance.balance >= 10.002) {
          let fee = await scrypta.send(props.user.walletstore, password, 'LSJq6a6AMigCiRHGrby4TuHeGirJw2PL5c', 10)
          if (fee.length === 64) {
            setTimeout(async function () {
              let written = await scrypta.write(props.user.walletstore, password, 'register:' + searcher, '', '', 'names://')
              if (written.txs[0].length === 64) {
                alert('Name registered!')
                setAvailability(false)
                setSearcher("")
                setRegistering(false)
                setTimeout(async function () {
                  let address = await scrypta.createAddress('-', false)
                  let request = await scrypta.createContractRequest(address.walletstore, '-', { contract: "LcD7AGaY74xvVxDg3NkKjfP6QpG8Pmxpnu", function: "names", params: {} })
                  let response = await scrypta.sendContractRequest(request)
                  let registered = []
                  for (let k in response) {
                    if (response[k].owner === props.user.address && registered.indexOf(response[k].name) === -1) {
                      registered.push(response[k])
                    }
                  }
                  setOwned(registered)
                }, 1500)
              } else {
                setRegistering(false)
                alert('Something goes wrong, please retry!')
              }
            }, 1500)
          } else {
            setRegistering(false)
            alert('Something goes wrong, please retry!')
          }
        } else {
          setRegistering(false)
          alert('Not enough funds!')
        }
      } else {
        setRegistering(false)
        alert('Wrong password!')
      }
    }
  }

  const returnOwned = () => {
    if (owned.length > 0) {
      return <div>
        {owned.map((value, index) => {
          if (ban.indexOf(value.name) === -1) {
            return <div key={index}>
              <h4 stlye={{ marginBottom: "-30px" }}>{value.name}</h4>
            registered by: <b>{value.owner} </b><hr />
            </div>
          } else {
            return false;
          }
        })}
      </div>
    } else {
      return <div>You don't have any decentralized name yet, please register something first!</div>
    }
  }

  function _handleKeyDown(e) {
    if (e.key === 'Enter') {
      searchName()
    }
  }

  const returnRegisterBox = () => {
    if (isAvailable) {
      return <Modal show={isAvailable} onClose={() => setAvailability(false)}>
        <Modal.Content style={{ textAlign: "center" }}>
          <Section style={{ backgroundColor: 'white' }}>
            <h1>Congratulations, this name is available,<br></br>enter your password to register it!</h1><br></br>
            This transaction will cost <b>10 LYRA</b>!<br></br><br></br>
            <Input style={{ width: "100%!important", textAlign: "center" }} type="password" onChange={(evt) => { setPassword(evt.target.value) }} value={password} /><br></br><br></br>
            {!isRegistering ? <Button onClick={registerName} color="info">REGISTER</Button> : <div>Registering, please wait...</div>}
          </Section>
        </Modal.Content>
      </Modal >
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
                <Media>
                  <Media.Item renderAs="figure" position="left">
                    <Gravatar style={{ borderRadius: "100px" }} email={props.user.address} />
                  </Media.Item>
                  <Media.Item>
                    <Content>
                      <p>
                        <strong>{props.user.address}</strong>
                        <br />
                        <small>My Blockchain Address</small>
                      </p>
                    </Content>
                  </Media.Item>
                </Media>
              </Box>
              <Box style={{ position: "relative" }}>
                <h1><br />What do you want to register today?</h1><br></br>
                <Input onKeyDown={_handleKeyDown} className="myInput" style={{ width: "100%!important" }} onChange={(evt) => { setSearcher(evt.target.value) }} value={searcher} placeholder={"Search a blockchain domain"} />
                {!isSearching ? <Control style={{ position: "absolute", bottom: "20px", right: "20px" }}>
                  <Button className="myButton" onClick={searchName} color="info">Search</Button>
                </Control> : <div style={{ marginTop: "20px" }}>Searching...</div>}
              </Box>
            </Columns.Column>
          </Columns>
        </Container>
        {returnRegisterBox()}
        <Container>
          <Columns>
            <Columns.Column style={{ marginTop: "40px" }}>
              <Card>
                <Card.Content align="center">
                  <Media>
                    <Media.Item>
                      <Heading size={5} align="center">YOUR REGISTERED DOMAINS</Heading>
                    </Media.Item>
                  </Media>
                  <hr></hr>
                  <Content>
                    {returnOwned()}
                  </Content>
                </Card.Content>
              </Card>
            </Columns.Column>
          </Columns>
        </Container>
      </div>
    </div >
  );
}
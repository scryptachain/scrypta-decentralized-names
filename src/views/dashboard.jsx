import { Button } from 'react-bulma-components';
import React, { useState, useEffect } from 'react';
import { Form, Heading, Card, Content, Media, Container, Columns, Box, Modal, Section, } from 'react-bulma-components';
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
  let [checked, setChecked] = useState(false)
  let [balance, setBalance] = useState(0)
  let [isWithdrawing, setWithdrawing] = useState(false)
  let [showWithdraw, setShowWithdraw] = useState(false)

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
      let written = await scrypta.post("/read", { address: props.user.address })
      let totalBalance = 0
      let totFees = 0
      for (let k in written.data) {
        if (written.data[k].data.indexOf("sell:") === 0) {
          let split = written.data[k].data.split(':')
          let balance = await scrypta.get("/balance/" + split[2])
          if(balance.balance > 0){
            let fees = balance.balance / 100 * 10
            let canWithdraw = balance.balance - fees - 0.002
            totFees += fees
            totalBalance += canWithdraw
          }
        }
      }
      totalBalance = totalBalance.toFixed(8)
      setChecked(true)
      setOwned(registered)
      setBalance(totalBalance)
    }
    if (!checked) {
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

  async function registerName() {
    if (password.length > 0 && !isRegistering) {
      setRegistering(true)
      let master = await scrypta.readxKey(password, props.user.walletstore)
      if (master !== false) {
        let key = await scrypta.deriveKeyFromSeed(master.seed, "m/0")
        let masterkey = await scrypta.importPrivateKey(key.prv, '-', false)
        let balance = await scrypta.get('/balance/' + key.pub)
        if (balance.balance >= 10.002) {
          let fee = await scrypta.send(masterkey.walletstore, '-', 'LSJq6a6AMigCiRHGrby4TuHeGirJw2PL5c', 10)
          if (fee.length === 64) {
            setTimeout(async function () {
              let written = await scrypta.write(masterkey.walletstore, '-', 'register:' + searcher, '', '', 'names://')
              if (written.txs[0].length === 64) {
                alert('Name registered!')
                setAvailability(false)
                setSearcher("")
                setRegistering(false)
                setTimeout(async function () {
                  window.location.reload()
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
  async function withdrawFunds() {
    if (password.length > 0 && !isWithdrawing) {
      setWithdrawing(true)
      let master = await scrypta.readxKey(password, props.user.walletstore)
      if (master !== false) {
        let written = await scrypta.post("/read", { address: props.user.address })
        for (let k in written.data) {
          if (written.data[k].data.indexOf("sell:") === 0) {
            let split = written.data[k].data.split(':')
            let balance = await scrypta.get("/balance/" + split[2])
            let fees = balance.balance / 100 * 10
            let canWithdraw = balance.balance - fees - 0.002 
            if (balance.balance > 0) {
              let hash = await scrypta.hash(split[1])
              let path = await scrypta.hashtopath(hash)
              let key = await scrypta.deriveKeyFromSeed(master.seed, "m/0")
              let balance = await scrypta.get('/balance/' + key.pub)
              if (balance.balance >= 0.001) {
                let paymentAddress = await scrypta.deriveKeyFromSeed(master.seed, path)
                let writingKey = await scrypta.importPrivateKey(paymentAddress.prv, '-', false)
                let fee = await scrypta.send(writingKey.walletstore, '-', 'LSJq6a6AMigCiRHGrby4TuHeGirJw2PL5c', fees)
                if (fee.length === 64){
                  setTimeout(async function(){
                    await scrypta.send(writingKey.walletstore, '-', props.user.address, canWithdraw)
                    alert('Withdraw successfully done!')
                    setWithdrawing(false)
                    setShowWithdraw(false)
                    setTimeout(async function(){
                      let totalBalance = 0
                      for (let k in written.data) {
                        if (written.data[k].data.indexOf("sell:") === 0) {
                          let split = written.data[k].data.split(':')
                          let balance = await scrypta.get("/balance/" + split[2])
                          if(balance.balance > 0){
                            let fees = balance.balance / 100 * 10
                            let canWithdraw = balance.balance - fees - 0.002
                            totalBalance += canWithdraw
                          }
                        }
                      }
                      totalBalance = totalBalance.toFixed(8)
                    }, 1000)
                  }, 1000)
                }
              }
            }
          }
        }
      } else {
        setWithdrawing(false)
        alert('Wrong password!')
      }
    }
  }

  const returnOwned = () => {
    if (owned.length > 0) {
      return <div>
        {owned.map((value, index) => {
          if (ban.indexOf(value.name) === -1) {
            return <div style={{ position: "relative", textAlign: "left" }} key={index}>
              <Button style={{ position: "absolute", top: "15px", right: "0px" }} color="success" href={"/details/" + value.uuid} renderAs="a"> Details </Button>
              <small>Domain Name:</small>
              <h4 stlye={{ marginBottom: "-30px", marginTop: 0 }}>{value.name}</h4>
              <b>{value.uuid} </b><hr />
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

  const returnSell = () => {
    if (owned.length > 0) {
      let inSell = []
      for (let k in owned) {
        if (owned[k].payment !== null && owned[k].payment !== null) {
          inSell.push(owned[k])
        }
      }
      if (inSell.length > 0) {
        return <div>
          {inSell.map((value, index) => {
            if (ban.indexOf(value.name) === -1) {
              return <div> <Columns.Column style={{ marginTop: "40px" }}>
                <Button color="success" renderAs="a" href="/showcase">Go to Showcase</Button>
                <Card>
                  <Card.Content align="center">
                    <Media>
                      <Media.Item>
                        <Box className="header-color">
                          <Heading size={5} align="center" style={{ color: "white" }}>FOR SALE</Heading>
                        </Box>
                      </Media.Item>
                    </Media>
                    <Content>
                      <div style={{ position: "relative" }} key={index}>
                        <Button.Group style={{ position: "absolute", top: 0, right: "0px" }}>
                          <Button color="success" href={"/details/" + value.uuid} renderAs="a"> Details </Button>
                        </Button.Group>
                        <div style={{ textAlign: "left" }}>
                          <small>Domain Name:</small>
                          <h4 stlye={{ marginBottom: "-30px" }}>{value.name}</h4>
                            Registered by: <b>{value.owner} </b><br />
                            Domain ID: <b>{value.uuid} </b><br />
                            Price: <b> {value.price} LYRA</b> <hr />
                        </div>
                      </div>
                    </Content>
                  </Card.Content>
                </Card>
              </Columns.Column>
              </div>
            } else {
              return false;
            }
          })}
        </div>
      }
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
            <Heading>Congratulations</Heading>
            This name is available, enter your password to register it!<br /><br />
            Transaction will cost <b>10 LYRA</b>!<br /><br />
            <Input style={{ width: "100%!important", textAlign: "center" }} placeholder="Insert wallet password" type="password" onChange={(evt) => { setPassword(evt.target.value) }} value={password} /><br></br><br></br>
            {!isRegistering ? <Button onClick={registerName} color="info">REGISTER</Button> : <div>Registering, please wait...</div>}
          </Section>
        </Modal.Content>
      </Modal >
    }
  }

  const returnWithdrawBox = () => {
    if (showWithdraw) {
      return <Modal show={showWithdraw} onClose={() => setShowWithdraw(false)}>
        <Modal.Content style={{ textAlign: "center" }}>
          <Section style={{ backgroundColor: 'white' }}>
            <Heading>Withdraw all</Heading> <br /><br />
            <Input style={{ width: "100%!important", textAlign: "center", marginTop: "20px" }} type="password" onChange={(evt) => { setPassword(evt.target.value) }} placeholder="Insert wallet password" value={password} /><br></br><br></br>
            {!isWithdrawing ? <Button onClick={withdrawFunds} color="success">WITHDRAW ALL FUNDS</Button> : <div>Withdrawing, please wait...</div>}
          </Section>
        </Modal.Content>
      </Modal >
    }
  }

  return (
    <div className="Explore">
      <NavBar />
      <Container>
        <Columns style={{ marginTop: "70px" }}>
          <Columns.Column size={9}>
            <Box style={{ height: "150px", padding: "50px 20px" }}>
              <Media>
                <Media.Item renderAs="figure" position="left">
                  <Gravatar style={{ borderRadius: "100px" }} email={props.user.address} />
                </Media.Item>
                <Media.Item>
                  <Content>
                    <p style={{ marginTop: "5px" }}>
                      <small>My Blockchain Address</small><br />
                      <strong>{props.user.address}</strong>
                    </p>
                  </Content>
                </Media.Item>
              </Media>
            </Box>
          </Columns.Column>
          <Columns.Column align="center">
            <Box style={{ height: "150px", padding: "15px 20px", backgroundColor: "#429A98", color: "white" }}>
              <h1>I have Earned:</h1>
              <h1 style={{ fontSize: "22px", fontWeight: 600 }}>{balance} LYRA</h1>
              <Button style={{ marginTop: "5px" }} color="success" onClick={() => setShowWithdraw(true)}>Withdraw</Button>
            </Box>
          </Columns.Column>
        </Columns>
        <Container style={{ position: "relative" }}>
          <h1 style={{ fontSize: "22px", fontWeight: 600, color: "#005D7F" }}><br />What do you want to register today?</h1><br></br>
          <Input onKeyDown={_handleKeyDown} className="myInput" style={{ width: "100%!important" }} onChange={(evt) => { setSearcher(evt.target.value) }} value={searcher} placeholder={"Search a blockchain domain"} />
          {!isSearching ? <Control style={{ position: "absolute", bottom: 0, right: 0 }}>
            <Button className="myButton" onClick={searchName} color="info">Search</Button>
          </Control> : <div style={{ marginTop: "20px" }}>Searching...</div>}
        </Container>
      </Container>
      {returnRegisterBox()}
      {returnWithdrawBox()}
      <Container>
        <Columns>
          <Columns.Column style={{ marginTop: "40px" }}>
            <Card>
              <Card.Content align="center">
                <Media>
                  <Media.Item>
                    <Box className="header-color">
                      <Heading size={5} align="center" style={{ color: "white" }}>YOUR REGISTERED DOMAIN</Heading>
                    </Box>
                  </Media.Item>
                </Media>
                <Content>
                  {returnOwned()}
                </Content>
              </Card.Content>
            </Card>
          </Columns.Column>
          {returnSell()}
        </Columns>
      </Container>
    </div>
  );
}
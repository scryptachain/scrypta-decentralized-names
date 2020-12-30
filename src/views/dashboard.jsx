import React, { useState, useEffect } from 'react';
import { Form, Heading, Content, Media, Container, Columns, Box, Modal, Section, } from 'react-bulma-components';
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
  let [showDialog, setShowDialog] = useState(false)
  let [textDialog, setTextDialog] = useState("")
  let [titleDialog, setTitleDialog] = useState("")

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
          if (balance.balance > 0) {
            let fees = balance.balance / 100 * 10
            let canWithdraw = balance.balance - fees - 0.002
            totFees += fees
            totalBalance += canWithdraw
          }
        }
      }
      totalBalance = (totalBalance - totFees).toFixed(8)
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
      let request = await scrypta.createContractRequest(address.walletstore, '-', { contract: "LcD7AGaY74xvVxDg3NkKjfP6QpG8Pmxpnu", function: "check", params: { "name": searcher } })
      let response = await scrypta.sendContractRequest(request)
      setSearching(false)
      if (response.available !== undefined && response.available === true) {
        setAvailability(true)
      } else if (response.record.owner !== undefined) {
        openDialog('Ops', 'This domain is taken by ' + response.record.owner)
        setAvailability(false)
      }
    } else {
      setSearching(false)
      openDialog('Ops', 'Write a name first!')
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
        scrypta.debug = true
        if (balance.balance >= 10.002) {
          let written = await scrypta.write(masterkey.walletstore, '-', 'register:' + searcher, '', '', 'names://')
          if (written.txs[0].length === 64) {
            setTimeout(async function () {
              let fee = await scrypta.send(masterkey.walletstore, '-', 'LSJq6a6AMigCiRHGrby4TuHeGirJw2PL5c', 10)
              if (fee.length === 64) {
                openDialog('Well Done', 'Name registered! Wait next confirmed block to see it in your Dashboard')
                setAvailability(false)
                setSearcher("")
                setRegistering(false)
              } else {
                setRegistering(false)
                openDialog('Ops', 'Something goes wrong, please retry!')
              }
            }, 1500)
          } else {
            setRegistering(false)
            openDialog('Ops', 'Something goes wrong, please retry!')
          }
        } else {
          setRegistering(false)
          openDialog('Ops', 'Not enough funds!')
        }
      } else {
        setRegistering(false)
        openDialog('Ops', 'Wrong password!')
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
            let fees = balance.balance / 100 * 1.5
            let canWithdraw = balance.balance - fees - 0.002
            if (balance.balance > 0) {
              let hash = await scrypta.hash(split[1])
              let path = await scrypta.hashtopath(hash)
              let key = await scrypta.deriveKeyFromSeed(master.seed, "m/0")
              let balance = await scrypta.get('/balance/' + key.pub)
              if (balance.balance >= 0.001) {
                let paymentAddress = await scrypta.deriveKeyFromSeed(master.seed, path)
                let writingKey = await scrypta.importPrivateKey(paymentAddress.prv, '-', false)
                let tx = await scrypta.send(writingKey.walletstore, '-', props.user.address, canWithdraw)
                if (tx.length === 64) {
                  setTimeout(async function () {
                    await scrypta.send(writingKey.walletstore, '-', 'LSJq6a6AMigCiRHGrby4TuHeGirJw2PL5c', fees)
                    openDialog('Well Done', 'Withdraw successfully done!')
                    setWithdrawing(false)
                    setShowWithdraw(false)
                    setTimeout(async function () {
                      let totalBalance = 0
                      for (let k in written.data) {
                        if (written.data[k].data.indexOf("sell:") === 0) {
                          let split = written.data[k].data.split(':')
                          let balance = await scrypta.get("/balance/" + split[2])
                          if (balance.balance > 0) {
                            let fees = balance.balance / 100 * 1.5
                            let canWithdraw = balance.balance - fees - 0.002
                            totalBalance += canWithdraw
                          }
                        }
                      }
                      totalBalance = totalBalance.toFixed(8)
                      setBalance(totalBalance)
                    }, 1000)
                  }, 1000)
                }
              }
            }
          }
        }
      } else {
        setWithdrawing(false)
        openDialog('Ops', 'Wrong password!')
      }
    }
  }

  const returnOwned = () => {
    owned.sort((a, b) => {
      if (a.name < b.name) return -1
      return a.name > b.name ? 1 : 0
    })
    if (owned.length > 0) {
      return <div>
        {owned.map((value, index) => {
          if (ban.indexOf(value.name) === -1) {
            return (
              <div style={{ position: "relative", textAlign: "left", margin: "40px 0" }} key={index}>
                <div className="nes-container is-rounded with-title mobile-owned">
                  <h4 className="title">{value.name}</h4>
                  NFT ID: <b>{value.uuid} </b>
                  <a href={"/details/" + value.uuid}>
                    <button className="nes-btn is-success mobile-btn-owned" style={{ position: "absolute", top: "5px", right: "10px" }}> Details </button>
                  </a>
                </div>
              </div>
            )
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
    owned.sort((a, b) => {
      if (a.name < b.name) return -1
      return a.name > b.name ? 1 : 0
    })
    if (owned.length > 0) {
      let inSell = []
      for (let k in owned) {
        if (owned[k].payment !== null && owned[k].payment !== null) {
          inSell.push(owned[k])
        }
      }
      if (inSell.length > 0) {
        return <div className="nes-container is-rounded" style={{ marginTop: "20px" }}>
          <Box className="header-color2">
            <Heading size={5} align="center" style={{ color: "white" }}>FOR SALE</Heading>
          </Box>
          {inSell.map((value, index) => {
            if (ban.indexOf(value.name) === -1) {
              return (
                <div style={{ position: "relative", marginTop: "40px" }} key={index}>
                  <div className="nes-container is-rounded with-title  mobile-sell" style={{ textAlign: "left" }}>
                    <h4 className="title" stlye={{ marginBottom: "-30px" }}>{value.name}</h4>
                      Registered by: <b>{value.owner} </b><br />
                      Domain ID: <b>{value.uuid} </b><br />
                    <div style={{ display: "flex", margin: "7px 0", textAlign: "left" }}>
                      <i className="nes-icon coin"></i>
                      <p style={{ margin: "7px 7px" }}> Price: <b>{value.price} LYRA</b></p></div>
                  </div>
                  <a href={"/details/" + value.uuid}>
                    <button className="nes-btn is-success mobile-btn" style={{ position: "absolute", top: 40, right: 20 }}> Details
                  </button>
                  </a>
                </div>)
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
            {!isRegistering ? <button className="nes-btn is-primary" onClick={registerName} color="info">REGISTER</button> : <div>Registering, please wait...</div>}
          </Section>
        </Modal.Content>
      </Modal >
    }
  }

  const returnWithdrawBox = () => {
    if (showWithdraw) {
      return <Modal show={showWithdraw} onClose={() => setShowWithdraw(false)}>
        <Modal.Content style={{ textAlign: "center", border: "5px solid #000000" }}>
          <Section style={{ backgroundColor: 'white' }}>
            <Heading>Withdraw all</Heading><br />
            <div className="nes-field">
              <Input className="nes-input" style={{ width: "100%!important", textAlign: "center", marginTop: "20px" }} type="password" onChange={(evt) => { setPassword(evt.target.value) }} placeholder="Insert wallet password" value={password} />
            </div><br /><br />
            {!isWithdrawing ? <button className="nes-btn is-success" onClick={withdrawFunds} color="success">WITHDRAW ALL FUNDS</button> : <div>Withdrawing, please wait...</div>}
          </Section>
        </Modal.Content>
      </Modal >
    }
  }

  function returnDialog() {
    if (showDialog) {
      return (
        <div className="dialog-wrapper">
          <dialog className="nes-dialog" open>
            <p className="title">{titleDialog}</p>
            <p>{textDialog}</p>
            <menu className="dialog-menu">
              <button onClick={() => { setShowDialog(false) }} className="nes-btn is-primary">OK</button>
            </menu>
          </dialog>
        </div>
      )
    }
  }

  function openDialog(title, text) {
    setTitleDialog(title)
    setTextDialog(text)
    setShowDialog(true)
  }

  return (
    <div className="Explore">
      {returnDialog()}
      <NavBar />
      <Container className="dashboard-container" style={{ padding: "50px 0" }}>
        <div >
          <Container>
            <Columns style={{ marginTop: "70px" }}>
              <Columns.Column size={9}>
                <Box className="nes-container is-rounded dashboard-box">
                  <Media>
                    <Media.Item renderAs="figure" position="left">
                      <Gravatar style={{ width: "90px" }} email={props.user.address} />
                    </Media.Item>
                    <Media.Item>
                      <Content>
                        <p style={{ fontSize: "22px", marginTop: "10px" }}>
                          <small>My Blockchain Address</small><br />
                          <strong>{props.user.address}</strong>
                        </p>
                      </Content>
                    </Media.Item>
                  </Media>
                </Box>
              </Columns.Column>
              <Columns.Column align="center">
                <Box className="nes-container is-rounded" style={{ height: "220px", padding: "15px", textAlign: "center" }}>
                  <h1>You have earned:</h1>
                  <div style={{ fontSize: "16px", fontWeight: 600, marginTop: "15px", textAlign: "left" }}>
                    <div style={{ float: "left" }}>
                      <i style={{ margin: "0" }} className="nes-icon big coin"></i>
                    </div>
                    <div style={{ float: "left", paddingLeft: "60px", marginTop: "10px" }}>{balance}<br />LYRA</div>
                  </div>
                  <br /><br />
                  <button className="nes-btn is-primary" style={{ marginTop: "35px", width: "100%" }} color="success" onClick={() => setShowWithdraw(true)}>Withdraw</button>
                </Box>
              </Columns.Column>
            </Columns>
            <div className="nes-container is-rounded" style={{ marginBottom: "30px", position: "relative" }}>
              <h1 style={{ backgroundColor: "none", lineHeight: "20px", fontSize: "22px", fontWeight: 600 }}><br />What do you want to register today?</h1><br></br>
              <div className="nes-field">
                <input className="nes-input mod-size" onKeyDown={_handleKeyDown} style={{ width: "100%!important" }} onChange={(evt) => {
                  let name = evt.target.value.toLocaleLowerCase();
                  name = name.replace(/ /g, '_').replace(/[^\w\s]/gi, "");
                  setSearcher(name);
                }} value={searcher} placeholder={"Search a blockchain name"} /></div>
              {!isSearching ? <Control style={{ position: "absolute", bottom: 16, right: 21 }}>
                <button className="nes-btn mod-size is-primary" onClick={searchName}>Search</button>
              </Control> : <div style={{ marginTop: "20px" }}>Searching...</div>}
            </div>
          </Container>
          {returnRegisterBox()}
          {returnWithdrawBox()}
          <div className="nes-container is-rounded" >
            <Box style={{ marginTop: "20px" }} className="header-color">
              <Heading size={5} align="center" style={{ color: "white" }}>YOUR REGISTERED NAMES</Heading>
            </Box>
            {returnOwned()}
          </div>
          {returnSell()}
        </div>
      </Container>
    </div >
  );
}
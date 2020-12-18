import React, { useState, useEffect } from 'react';
import { Form, Heading, Container, Box, } from 'react-bulma-components';
import { NavBar, } from '../components/navbar.jsx';
const ScryptaCore = require('@scrypta/core')
const scrypta = new ScryptaCore(true)
scrypta.staticnodes = true
const { Input, Control } = Form;

export function Explore() {
  let [history, setHistory] = useState([])
  let [inSell, setSell] = useState([])
  let [showDialog, setShowDialog] = useState(false)
  let [textDialog, setTextDialog] = useState("")
  let [titleDialog, setTitleDialog] = useState("")
  let [searcher, setSearcher] = useState("")
  let ban = ["register:turinglabs"]
  useEffect(() => {
    async function init() {
      let address = await scrypta.createAddress('-', false)
      let request = await scrypta.createContractRequest(address.walletstore, '-', { contract: "LcD7AGaY74xvVxDg3NkKjfP6QpG8Pmxpnu", function: "names", params: {} })
      let response = await scrypta.sendContractRequest(request)
      response = response.reverse()
      setHistory(response)
      let sellArray = []
      for (let k in response) {
        if (response[k].payment !== null && response[k].payment !== undefined) {
          sellArray.push(response[k])
        }
      }
      setSell(sellArray)
    }
    if (history.length === 0) {
      init()
    }
  })

  function _handleKeyDown(e) {
    if (e.key === 'Enter') {
      searchName()
    }
  }

  async function searchName() {
    if (searcher.length > 0) {
      let address = await scrypta.createAddress('-', false)
      let request = await scrypta.createContractRequest(address.walletstore, '-', { contract: "LcD7AGaY74xvVxDg3NkKjfP6QpG8Pmxpnu", function: "search", params: { "name": searcher } })
      let response = await scrypta.sendContractRequest(request)
      if (response.message !== undefined && response.message === 'Name not found.') {
        openDialog('Well done', 'Proceed with login and register this name!')
      } else if (response.address !== undefined) {
        openDialog('Ops', 'This domain is taken by ' + response.address)
      }
    } else {
      openDialog('Ops', 'Write a name to search first!')
    }
  }

  function returnRegistered() {
    if (history.length > 0) {
      return (
        <Container align="left">
          {history.map((value, index) => {
            if (ban.indexOf(value.name) === -1) {
              return <div style={{ marginBottom: "30px" }} key={index}>
                <div className="nes-container is-rounded with-title" >
                  <p className="title">{value.name}</p>
                  Registered by: <b>{value.owner} </b><br></br>
                  Unique ID: {value.uuid} </div>
              </div>
            } else {
              return false;
            }
          })}
        </Container>
      )
    } else {
      return (
        <div>Loading from blockchain...</div>
      )
    }
  }

  function returnSell() {
    if (inSell.length > 0) {
      return (
        <div>
          <div align="center">
            <Box className="header-color2">
              <Heading size={5} align="center" style={{ color: "white" }}>NAMES FOR SALE</Heading>
            </Box>
            <Container align="left">
              {inSell.map((value, index) => {
                if (ban.indexOf(value.name) === -1 && value.payment !== null && value.payment !== undefined) {
                  return (
                    <div key={index} style={{ margin: "30px 0" }}>
                      <div className="nes-container is-rounded with-title mobile-sell" >
                        <p className="title">{value.name}</p>
                          Registered by: <b>{value.owner} </b><br></br>
                          Unique id: <b>{value.uuid}</b><br />
                        <div style={{ display: "flex", margin: "7px 0" }}>
                          <i class="nes-icon coin"></i>
                          <p style={{ margin: "7px 7px" }}> Price: <b>{value.price} LYRA</b></p></div>
                      </div>
                    </div>
                  )
                } else {
                  return false;
                }
              })}
            </Container>
          </div>
        </div>
      )
    } else {
      return (
        <div>Nothing to show...</div>
      )
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
              <button className="nes-btn" onClick={() => { setShowDialog(false) }} className="nes-btn is-primary">OK</button>
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
      <NavBar />
      {returnDialog()}
      <Container style={{marginTop: "150px", marginBottom: "60px"}}>
        <div className="nes-container is-rounded" align="center">
          <h1 style={{ fontSize: "30px", fontWeight: "600", margin: "20px 0" }}>Blockchain Names</h1>
          <div style={{ position: "relative", marginTop: "40px" }}>
            <div className="nes-field">
              <input className="nes-input mod-size" onKeyDown={_handleKeyDown} style={{ width: "100%!important" }} onChange={(evt) => { setSearcher(evt.target.value) }} value={searcher} placeholder={"Search a blockchain name"} /></div>
            <Control style={{ position: "absolute", bottom: -4, right: 0 }}>
              <button className="nes-btn mod-size is-primary" onClick={searchName}>Search</button>
            </Control>
          </div>
        </div>
        <Container className="nes-container is-rounded" style={{ marginTop: "40px" }}>
          <div>
            <div align="center">
              <Box className="header-color">
                <Heading size={5} align="center" style={{ color: "white" }}>LATEST REGISTERED NAMES</Heading>
              </Box>
              {returnRegistered()}
            </div>
          </div>
        </Container>
        <Container className="nes-container is-rounded" style={{ marginTop: "50px" }}>
          {returnSell()}
        </Container>
      </Container>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { Form, Heading, Container, Box, } from 'react-bulma-components';
import { NavBar, } from '../components/navbar.jsx';
const ScryptaCore = require('@scrypta/core')
const scrypta = new ScryptaCore(true)
scrypta.staticnodes = true
const { Control } = Form;

export function Explore(props) {
  let [history, setHistory] = useState([])
  let [inSell, setSell] = useState([])
  let [isLoading, setLoading] = useState(true)
  let [showDialog, setShowDialog] = useState(false)
  let [textDialog, setTextDialog] = useState("")
  let [titleDialog, setTitleDialog] = useState("")
  let [searcher, setSearcher] = useState("")
  let [max, setMax] = useState(15)
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
      setLoading(false)
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
      let request = await scrypta.createContractRequest(address.walletstore, '-', { contract: "LcD7AGaY74xvVxDg3NkKjfP6QpG8Pmxpnu", function: "check", params: { "name": searcher } })
      let response = await scrypta.sendContractRequest(request)
      if (response.available !== undefined && response.available === true) {
        openDialog('Well done', 'Proceed with login and register this name!')
      } else if (response.record.owner !== undefined) {
        openDialog('Ops', 'This domain is taken by ' + response.record.owner)
      }
    } else {
      openDialog('Ops', 'Write a name to search first!')
    }
  }

  function returnRegistered() {
    if (history.length > 0 && !isLoading) {
      return (
        <Container align="left">
          {history.map((value, index) => {
            let imax = max + 3
            if (ban.indexOf(value.name) === -1 && index <= imax) {
              return <div style={{ marginBottom: "30px" }} key={index}>
                <div className="nes-container is-rounded with-title explorer-container">
                  <p className="title">{value.name}</p>
                  Owner: <b>{value.owner} </b><br></br>
                  NFT ID: {value.uuid} </div>
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
    if (inSell.length > 0 && !isLoading) {
      return (
        <div>
          <div align="center">
            <Box className="header-color2">
              <Heading size={5} align="center" style={{ color: "white" }}>NAMES FOR SALE</Heading>
            </Box>
            <Container align="left">
              {inSell.map((value, index) => {
                if (ban.indexOf(value.name) === -1 && value.payment !== null && value.payment !== undefined && index < max) {
                  return (
                    <div key={index} style={{ margin: "30px 0" }}>
                      <div className="nes-container is-rounded with-title explorer-container-sell" >
                        <p className="title">{value.name}</p>
                          Owner: <b>{value.owner} </b><br></br>
                          NFT ID: <b>{value.uuid}</b><br />
                        <div style={{ display: "flex", margin: "7px 0" }}>
                          <i className="nes-icon coin"></i>
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
      <NavBar />
      {returnDialog()}
      {isLoading ? <div style={{marginTop: "150px", color: "#fff", textAlign: "center", padding: "40vh 0"}}>Loading data from blockchain, please wait...</div> : 
      <Container style={{marginTop: "150px", marginBottom: "60px"}}>
      {props.user === undefined ? 
        <div className="nes-container is-rounded" align="center">
          <div style={{ position: "relative" }}>
            <div className="nes-field">
              <input className="nes-input mod-size" onKeyDown={_handleKeyDown} style={{ width: "100%!important" }} onChange={(evt) => { 
                let name = evt.target.value.toLocaleLowerCase(); 
                name = name.replace(/ /g, '_').replace(/[^\w\s]/gi, "");
                setSearcher(name)
              }} value={searcher} placeholder={"Search a blockchain name"} /></div>
            <Control style={{ position: "absolute", bottom: -4, right: 0 }}>
              <button className="nes-btn mod-size explore-btn is-primary" onClick={searchName}>Search</button>
            </Control>
          </div>
        </div>
        : "" }
        <Container className="nes-container is-rounded" style={{ marginTop: "50px" }}>
          <div class="columns">
            <div class="column is-half">
                <Box className="header-color explorer-title">
                  <Heading size={5} align="center" style={{ color: "white" }}>LATEST REGISTERED NAMES</Heading>
                </Box>
                {returnRegistered()}
            </div>
            <div class="column is-half">
              {returnSell()}
            </div>
          </div>
          <div>
            <button onClick={() => { setMax(9999999999) }} style = {{ width:"100%"}} className="nes-btn is-primary">SHOW ALL</button>
          </div>
        </Container>
      </Container>}
    </div>
  );
}
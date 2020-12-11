import { Button } from 'react-bulma-components';
import React, { useState, useEffect } from 'react';
import { Form, Heading, Card, Content, Media, Container, Columns, Box, Modal, Section, Image } from 'react-bulma-components';
import { NavBar, } from '../components/navbar.jsx';
import Gravatar from 'react-gravatar'
import { useParams } from 'react-router-dom';
const ScryptaCore = require('@scrypta/core')
const scrypta = new ScryptaCore(true)
scrypta.staticnodes = true
const { Input, Control } = Form;

export function Details(props) {
    let { uuid } = useParams()
    let [blockchainData, setData] = useState({ uuid: "" })
    let [password, setPassword] = useState("")
    let [to, setTo] = useState("")
    let [price, setPrice] = useState(0)
    let [isTransfering, setTransfering] = useState(false)
    let [isSelling, setSelling] = useState(false)
    let [showTransfer, setShow] = useState(false)

    useEffect(() => {
        async function readBlockchain() {
            let data = await scrypta.post("/read", { uuid: uuid })
            let domain = data.data[0]
            let split = domain.data.split(':')
            domain.time = domain.time * 1000
            domain.domain = split[1]
            domain.date = new Date(domain.time).getDate() + ' ' + (new Date(domain.time).getMonth() + 1) + ' ' + new Date(domain.time).getFullYear()
            console.log(domain)
            setData(domain)
        }
        if (blockchainData.uuid === "") {
            readBlockchain()
        }
    })

    if (blockchainData.uuid === "") {
        return (<div className="Details">
            <NavBar />
            <Container style={{ padding: "45vh 0 0 0", textAlign: "center" }}>
                Loading...
            </Container>
        </div>)
    } else {
        async function placeSell(toSell, price) {
            if (password.length > 0 && !isTransfering) {
                setTransfering(true)
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
                    setTransfering(false)
                } else {
                    setTransfering(false)
                    alert('Wrong password!')
                }
            }
        }

        async function removeSell(toRemove) {
            if (password.length > 0 && !isTransfering) {
                setTransfering(true)
                let mnemonic = await scrypta.readxKey(password, props.user.walletstore)
                if (mnemonic !== false) {
                    let key = await scrypta.deriveKeyFromMnemonic(mnemonic, "m/0")
                    let toWrite = 'remove:' + toRemove
                    let writingKey = await scrypta.importPrivateKey(key.prv, '-', false)
                    await scrypta.write(writingKey.walletstore, '-', toWrite, '', '', 'names://')
                } else {
                    setTransfering(false)
                    alert('Wrong password!')
                }
            }
        }

        async function takeFunds(toTake) {
            if (password.length > 0 && !isTransfering) {
                setTransfering(true)
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
                    setTransfering(false)
                    alert('Wrong password!')
                }
            }
        }

        async function transferName() {
            if (password.length > 0 && !isTransfering) {
              setTransfering(true)
              let master = await scrypta.readxKey(password, props.user.walletstore)
              if (master !== false) {
                let key = await scrypta.deriveKeyFromSeed(master.seed, "m/0")
                let masterkey = await scrypta.importPrivateKey(key.prv, '-', false)
                let balance = await scrypta.get('/balance/' + key.pub)
                let validate = await scrypta.get('/validate/' + to)
                if (balance.balance >= 0.001) {
                if(validate.data.isvalid === true){
                    let written = await scrypta.write(masterkey.walletstore, '-', 'transfer:' + uuid + ':' + to, '', '', 'names://')
                    if (written.txs[0].length === 64) {
                        alert('Name registered!')
                        setShow(false)
                        setTo("")
                        setTransfering(false)
                        setTimeout(async function () {
                        window.location.reload()
                        }, 1500)
                    } else {
                        setTransfering(false)
                        alert('Something goes wrong, please retry!')
                    }
                }else{
                    alert('Recipient address is not valid')
                }
                } else {
                  setTransfering(false)
                  alert('Not enough funds!')
                }
              } else {
                setTransfering(false)
                alert('Wrong password!')
              }
            }
        }

        const returnTransferBox = () => {
            if (showTransfer) {
              return <Modal show={showTransfer} onClose={() => setShow(false)}>
                <Modal.Content style={{ textAlign: "center" }}>
                  <Section style={{ backgroundColor: 'white' }}>
                    <Heading>Transfer {blockchainData.domain}</Heading>
                    Transfer this domain to a friend!<br /><br />
                    <Input style={{ width: "100%!important", textAlign: "center" }} type="text" onChange={(evt) => { setTo(evt.target.value) }} placeholder="Insert recipient address" value={to} /><br></br>
                    <Input style={{ width: "100%!important", textAlign: "center" }} type="password" onChange={(evt) => { setPassword(evt.target.value) }} placeholder="Insert wallet password" value={password} /><br></br><br></br>
                    {!isTransfering ? <Button onClick={transferName} color="info">TRANSFER</Button> : <div>Transferring, please wait...</div>}
                  </Section>
                </Modal.Content>
              </Modal >
            }
          }

        return (
            <div className="Details">
                {returnTransferBox()}
                <NavBar />
                <Container>
                    <Columns style={{ marginTop: "100px" }}>
                        <Columns.Column>
                            <h1 style={{ fontSize: "30px", fontWeight: "600" }}>Details of: {blockchainData.domain}</h1><br />
                            <p style={{ fontSize: "16px" }}>Use the buttons next door to transfer, donate or sell your domain. Simply enter the user's Scrypta Blockchain address, enter the amount and confirm!</p><br /><br />
                            <Box>
                                <Media>
                                    <Media.Item renderAs="figure" position="left">
                                        <Gravatar style={{ borderRadius: "100px" }} email={uuid} />
                                    </Media.Item>
                                    <Media.Item>
                                        <Content>
                                            <p style={{ marginTop: "5px" }}>
                                                <small>UUID Domain Name</small><br />
                                                <strong>{uuid}</strong>
                                                <br />
                                            </p>
                                        </Content>
                                    </Media.Item>
                                </Media>
                            </Box>
                            <Box>
                                {blockchainData.domain}<br></br>
                                {blockchainData.block}<br></br>
                                {blockchainData.txid}<br></br>
                                {blockchainData.date}
                            </Box>
                            <Button.Group>
                                <Button color="info" onClick={() => { setShow(true) }}>Transfer</Button>
                                <Button color="success">Sell</Button>
                            </Button.Group>
                        </Columns.Column>
                    </Columns>
                </Container>
            </div>
        );
    }
}
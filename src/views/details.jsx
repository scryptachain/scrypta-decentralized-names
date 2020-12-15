import { Button } from 'react-bulma-components';
import React, { useState, useEffect } from 'react';
import { Form, Heading, Content, Media, Container, Columns, Box, Modal, Section, Image } from 'react-bulma-components';
import { NavBar, } from '../components/navbar.jsx';
import Gravatar from 'react-gravatar'
import { useParams } from 'react-router-dom';
import Txid from '../assets/txid.svg'
import Domain from '../assets/domain-white.svg'
import Check from '../assets/check-white.svg'
import Block from '../assets/block.svg'

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
    let [showTransfer, setShowTranfer] = useState(false)
    let [isSelling, setSelling] = useState(false)
    let [showSell, setShowSell] = useState(false)
    let [showRemove, setShowRemove] = useState(false)
    let [isRemoving, setRemoving] = useState (false)


    useEffect(() => {
        async function readBlockchain() {
            let data = await scrypta.post("/read", { uuid: uuid })
            let domain = data.data[0]
            let split = domain.data.split(':')
            domain.time = domain.time * 1000
            domain.domain = split[1]
            domain.date = new Date(domain.time).getDate() + ' ' + (new Date(domain.time).getMonth() + 1) + ' ' + new Date(domain.time).getFullYear()
            let address = await scrypta.createAddress('-', false)
            let request = await scrypta.createContractRequest(address.walletstore, '-', { contract: "LcD7AGaY74xvVxDg3NkKjfP6QpG8Pmxpnu", function: "check", params: { name: domain.domain} })
            let response = await scrypta.sendContractRequest(request)
            domain.smartcontract = response.record
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
        async function placeSell() {
            if (password.length > 0 && !isSelling && price > 0) {
                setSelling(true)
                let master = await scrypta.readxKey(password, props.user.walletstore)
                if (master !== false) {
                    let SIDS = localStorage.getItem('xSID').split(':')
                    let hash = await scrypta.hash(blockchainData.uuid)
                    let path = await scrypta.hashtopath(hash)
                    let key = await scrypta.deriveKeyFromSeed(master.seed, "m/0")
                    let balance = await scrypta.get('/balance/' + key.pub)
                    if (balance.balance >= 0.001) {
                        let paymentAddress = await scrypta.deriveKeyfromXPub(SIDS[0], path)
                        let toWrite = 'sell:' + blockchainData.uuid + ':' + paymentAddress.pub + ':' + price
                        let writingKey = await scrypta.importPrivateKey(key.prv, '-', false)
                        let written = await scrypta.write(writingKey.walletstore, '-', toWrite, '', '', 'names://')
                        if (written.txs !== undefined && written.txs[0] !== undefined && written.txs[0].length === 64) {
                            setSelling(false)
                            alert('Sell placed!')
                            setShowSell(false)
                            setSelling(false)
                            setTimeout(async function () {
                                window.location.reload()
                            }, 1500)
                        } else {
                            setSelling(false)
                            alert('Something goes wrong, retry!')
                        }
                    } else {
                        setSelling(false)
                        alert('Not enough balance!')
                    }
                } else {
                    setSelling(false)
                    alert('Wrong password!')
                }
            }
        }

        async function removeSell() {
            if (password.length > 0 && !isRemoving) {
                setRemoving(true)
                let mnemonic = await scrypta.readxKey(password, props.user.walletstore)
                if (mnemonic !== false) {
                    let key = await scrypta.deriveKeyFromSeed(mnemonic.seed, "m/0")
                    console.log(key)
                    let toWrite = 'remove:' + blockchainData.uuid
                    let writingKey = await scrypta.importPrivateKey(key.prv, '-', false)
                    let written = await scrypta.write(writingKey.walletstore, '-', toWrite, '', '', 'names://')
                    if (written.txs !== undefined && written.txs[0] !== undefined && written.txs[0].length === 64){
                        alert("Sell removed")
                        window.location.reload()
                    } else {
                        alert("Something goes wrong!")
                    } 
                } else {
                    setRemoving(false)
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
                        if (validate.data.isvalid === true) {
                            let written = await scrypta.write(masterkey.walletstore, '-', 'transfer:' + uuid + ':' + to, '', '', 'names://')
                            if (written.txs[0].length === 64) {
                                alert('Name transfered!')
                                setShowTranfer(false)
                                setTo("")
                                setTransfering(false)
                                setTimeout(async function () {
                                    window.location.reload()
                                }, 1500)
                            } else {
                                setTransfering(false)
                                alert('Something goes wrong, please retry!')
                            }
                        } else {
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
                return <Modal show={showTransfer} onClose={() => setShowTranfer(false)}>
                    <Modal.Content style={{ textAlign: "center" }}>
                        <Section style={{ backgroundColor: 'white' }}>
                            <Heading>Transfer <span style={{ color: "#429A98" }}>{blockchainData.domain}</span></Heading>
                            Transfer this domain to a friend!<br /><br />
                            <Input style={{ width: "100%!important", textAlign: "center" }} type="text" onChange={(evt) => { setTo(evt.target.value) }} placeholder="Insert recipient address" value={to} /><br></br>
                            <Input style={{ width: "100%!important", textAlign: "center", marginTop: "20px" }} type="password" onChange={(evt) => { setPassword(evt.target.value) }} placeholder="Insert wallet password" value={password} /><br></br><br></br>
                            {!isTransfering ? <Button onClick={transferName} color="success">TRANSFER</Button> : <div>Transferring, please wait...</div>}
                        </Section>
                    </Modal.Content>
                </Modal >
            }
        }

        const buttonForSale = () => {
            if (blockchainData.smartcontract.price === null) {
                return <div>
                    <Columns.Column>
                        <Button style={{ width: "100%", height: "80px", fontSize: "22px" }} color="success" onClick={() => { setShowTranfer(true) }}>Transfer</Button>
                    </Columns.Column>
                    <Columns.Column>
                        <Button style={{ width: "100%", height: "80px", fontSize: "22px" }} color="danger" onClick={() => { setShowSell(true) }}>Sell</Button>
                    </Columns.Column>
                </div>
            } else {
                return <Button style={{ width: "100%", height: "80px", fontSize: "22px" }} color="danger" onClick={() => { setShowRemove(true) }}>Undo Sell</Button>
            }
        }

        const returnSellBox = () => {
            if (showSell) {
                return <Modal show={showSell} onClose={() => setShowSell(false)}>
                    <Modal.Content style={{ textAlign: "center" }}>
                        <Section style={{ backgroundColor: 'white' }}>
                            <Heading>Sell <br /><span style={{ color: "#429A98" }}>{blockchainData.domain}</span></Heading>
                            Enter the desired amount for your domain <br /><br />
                            <Input style={{ width: "100%!important", textAlign: "center" }} type="text" onChange={(evt) => { setPrice(evt.target.value) }} placeholder="Insert Amount" value={price} /><br></br>
                            <Input style={{ width: "100%!important", textAlign: "center", marginTop: "20px" }} type="password" onChange={(evt) => { setPassword(evt.target.value) }} placeholder="Insert wallet password" value={password} /><br></br><br></br>
                            {!isSelling ? <Button onClick={placeSell} color="success">SELL</Button> : <div>Placing Sell, please wait...</div>}
                        </Section>
                    </Modal.Content>
                </Modal >
            }
        }

        const returnRemoveBox = () => {
            if (showRemove) {
                return <Modal show={showRemove} onClose={() => setShowRemove(false)}>
                    <Modal.Content style={{ textAlign: "center" }}>
                        <Section style={{ backgroundColor: 'white' }}>
                            <Heading>Remove form Showcase <br /><span style={{ color: "#429A98" }}>{blockchainData.domain}</span></Heading>
                            If doesn't want sell this domain, enter the password to confirm! <br /><br />
                            <Input style={{ width: "100%!important", textAlign: "center", marginTop: "20px" }} type="password" onChange={(evt) => { setPassword(evt.target.value) }} placeholder="Insert wallet password" value={password} /><br></br><br></br>
                            {!isRemoving ? <Button onClick={removeSell} color="success">Remove from Showcase</Button> : <div>Removing from Showcase, please wait...</div>}
                        </Section>
                    </Modal.Content>
                </Modal >
            }
        }

        return (
            <div className="Details">
                {returnTransferBox()}
                {returnSellBox()}
                {returnRemoveBox()}
                <NavBar />
                <Container style={{ marginTop: "120px" }}>
                    <h1 style={{ fontSize: "30px" }}>Details of: <span style={{ fontWeight: 600 }}>{blockchainData.domain}</span></h1>
                    <p style={{ fontSize: "16px" }}>Use the buttons below to transfer, donate or sell your domain. Simply enter the user's Scrypta Blockchain address, enter the amount and confirm!</p><br /><br />
                    <Columns>
                        <Columns.Column>
                            <Box>
                                <Media>
                                    <Media.Item renderAs="figure" position="left">
                                        <Gravatar style={{ borderRadius: "100px", marginTop: "10px" }} email={uuid} />
                                    </Media.Item>
                                    <Media.Item>
                                        <Content>
                                            <div style={{ marginTop: "5px" }}>
                                                <small>UUID Domain Name</small><br />
                                                <h1 style={{ marginTop: 0 }}>{uuid}</h1>
                                                <br />
                                            </div>
                                        </Content>
                                    </Media.Item>
                                </Media>
                            </Box>
                        </Columns.Column>
                    </Columns>
                    <Columns>
                        <Columns.Column>
                            <Box style={{ backgroundColor: "#0A5E7E" }}>
                                <Media style={{ padding: "40px 0" }}>
                                    <Media.Item>
                                        <Image style={{ padding: "5px 15px" }} size={64} alt="64x64" src={Domain} />
                                    </Media.Item>
                                    <Media.Item >
                                        <Content style={{ color: "white" }}>
                                            <p>Domain Name</p>
                                            <b>{blockchainData.domain}</b>
                                        </Content>
                                    </Media.Item>
                                </Media>
                            </Box>
                        </Columns.Column>
                        <Columns.Column>
                            <Box style={{ backgroundColor: "#19A1BC" }}>
                                <Media style={{ padding: "40px 0" }}>
                                    <Media.Item>
                                        <Image style={{ padding: "5px 15px" }} size={64} alt="64x64" src={Block} />
                                    </Media.Item>
                                    <Media.Item>
                                        <Content style={{ color: "white" }}>
                                            <p>Block</p>
                                            <b>{blockchainData.block}</b>
                                        </Content>
                                    </Media.Item>
                                </Media>
                            </Box>
                        </Columns.Column>
                        <Columns.Column>
                            <Box style={{ backgroundColor: "#429A98" }}>
                                <Media style={{ padding: "40px 0" }}>
                                    <Media.Item>
                                        <Image style={{ padding: "5px 15px" }} size={64} alt="64x64" src={Txid} />
                                    </Media.Item>
                                    <Media.Item>
                                        <Content style={{ color: "white" }}>
                                            <p>Blockchain Transaction</p>
                                            <b>{blockchainData.txid}</b>
                                        </Content>
                                    </Media.Item>
                                </Media>
                            </Box>
                        </Columns.Column>
                        <Columns.Column>
                            <Box style={{ backgroundColor: "#8EC6C5" }}>
                                <Media style={{ padding: "40px 0" }}>
                                    <Media.Item>
                                        <Image style={{ padding: "5px 15px" }} size={64} alt="64x64" src={Check} />
                                    </Media.Item>
                                    <Media.Item>
                                        <Content style={{ color: "white" }}>
                                            <p>Timestamp</p>
                                            <b>{blockchainData.date}</b>
                                        </Content>
                                    </Media.Item>
                                </Media>
                            </Box>
                        </Columns.Column>
                    </Columns>
                    <Columns>
                        {buttonForSale()}
                    </Columns>
                </Container>
            </div>
        );

    }
}
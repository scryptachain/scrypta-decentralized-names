import React, { useState, useEffect } from 'react';
import { Form, Heading, Content, Media, Container, Columns, Modal, Section } from 'react-bulma-components';
import { NavBar, } from '../components/navbar.jsx';
import Gravatar from 'react-gravatar'
import { useParams } from 'react-router-dom';

const ScryptaCore = require('@scrypta/core')
const scrypta = new ScryptaCore(true)
scrypta.staticnodes = true
const { Input } = Form;

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
    let [isRemoving, setRemoving] = useState(false)
    let [showDialog, setShowDialog] = useState(false)
    let [showUpdate, setShowUpdate] = useState(false)
    let [textDialog, setTextDialog] = useState("")
    let [titleDialog, setTitleDialog] = useState("")
    let [bitcoin, setBitcoin] = useState("")
    let [ethereum, setEthereum] = useState("")
    let [link, setLink] = useState("")
    let [youtube, setYoutube] = useState("")
    let [icon, setIcon] = useState("")
    let [isUpdating, setUpdating] = useState(false)
    let [what, setWhat] = useState("")
    let [isOwner, setOwner] = useState(false)

    useEffect(() => {
        async function readBlockchain() {
            let data = await scrypta.post("/read", { uuid: uuid })
            let domain = data.data[0]
            let split = domain.data.split(':')
            domain.time = domain.time * 1000
            domain.domain = split[1]
            domain.date = new Date(domain.time).getDate() + '/' + (new Date(domain.time).getMonth() + 1) + '/' + new Date(domain.time).getFullYear() + ' at ' + new Date(domain.time).getHours() + ':' + new Date(domain.time).getMinutes() + ':' + new Date(domain.time).getSeconds()
            let address = await scrypta.createAddress('-', false)
            let request = await scrypta.createContractRequest(address.walletstore, '-', { contract: "LcD7AGaY74xvVxDg3NkKjfP6QpG8Pmxpnu", function: "check", params: { name: domain.domain } })
            let response = await scrypta.sendContractRequest(request)
            domain.smartcontract = response.record
            if(domain.smartcontract.owner === props.user.address){
                setOwner(true)
            }
            if (domain.smartcontract.link !== undefined) {
                setLink(domain.smartcontract.link)
            }
            if (domain.smartcontract.bitcoin !== undefined) {
                setBitcoin(domain.smartcontract.bitcoin)
            }
            if (domain.smartcontract.ethereum !== undefined) {
                setEthereum(domain.smartcontract.ethereum)
            }
            if (domain.smartcontract.icon !== undefined) {
                setIcon(domain.smartcontract.icon)
            }
            if (domain.smartcontract.youtube !== undefined) {
                setYoutube(domain.smartcontract.youtube)
            }
            setData(domain)
        }
        if (blockchainData.uuid === "") {
            readBlockchain()
        }
    })

    if (blockchainData.uuid === "") {
        return (<div className="Details">
            <NavBar />
            <Container style={{ padding: "45vh 0", color: "#fff", textAlign: "center" }}>
                Loading data from the blockchain...
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
                            openDialog('Sell placed!', ' Please wait next block for confirmation.')
                            setShowSell(false)
                            setSelling(false)
                        } else {
                            setSelling(false)
                            openDialog('Ops', 'Something goes wrong, retry!')
                        }
                    } else {
                        setSelling(false)
                        openDialog('Ops', 'Not enough balance!')
                    }
                } else {
                    setSelling(false)
                    openDialog('Ops', 'Wrong password!')
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
                    if (written.txs !== undefined && written.txs[0] !== undefined && written.txs[0].length === 64) {
                        openDialog('Well Done', 'Sell removed, wait for next block for confirmation.')
                    } else {
                        openDialog('Ops', 'Something goes wrong!')
                    }
                } else {
                    setRemoving(false)
                    openDialog('Ops', 'Wrong password!')
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
                                openDialog('Well Done', 'Name transfered!')
                                setShowTranfer(false)
                                setTo("")
                                setTransfering(false)
                                setTimeout(async function () {
                                    window.location.reload()
                                }, 1500)
                            } else {
                                setTransfering(false)
                                openDialog('Ops', 'Something goes wrong, please retry!')
                            }
                        } else {
                            openDialog('Ops', 'Recipient address is not valid')
                        }
                    } else {
                        setTransfering(false)
                        openDialog('Ops', 'Not enough funds!')
                    }
                } else {
                    setTransfering(false)
                    openDialog('Ops', 'Wrong password!')
                }
            }
        }

        async function updateName() {
            if (password.length > 0 && !isUpdating) {
                setUpdating(true)
                let mnemonic = await scrypta.readxKey(password, props.user.walletstore)
                if (mnemonic !== false) {
                    let key = await scrypta.deriveKeyFromSeed(mnemonic.seed, "m/0")
                    let value = ''

                    switch (what) {
                        case "icon":
                            value = icon
                            break;
                        case "link":
                            value = link
                            value = value.replace("http://", "")
                            value = value.replace("https://", "")
                            break;
                        case "youtube":
                            value = youtube
                            value = value.replace("http://", "")
                            value = value.replace("https://", "")
                            break;
                        case "bitcoin":
                            value = bitcoin
                            break;
                        case "ethereum":
                            value = ethereum
                            break;
                        default:
                            break;
                    }

                    value = value.replace(":", "")
                    let toWrite = 'update:' + blockchainData.uuid + ':' + what + ':' + value
                    let writingKey = await scrypta.importPrivateKey(key.prv, '-', false)
                    let written = await scrypta.write(writingKey.walletstore, '-', toWrite, '', '', 'names://')
                    if (written.txs !== undefined && written.txs[0] !== undefined && written.txs[0].length === 64) {
                        openDialog('Well Done', 'Name updated, wait next block for confirmation!')
                        setUpdating(false)
                        setShowUpdate(false)
                        setWhat("")
                        setPassword("")
                    } else {
                        openDialog('Ops', 'Something goes wrong!')
                    }
                } else {
                    setUpdating(false)
                    openDialog('Ops', 'Wrong password!')
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
                            {!isTransfering ? <button className="nes-btn is-success" onClick={transferName} >TRANSFER</button> : <div>Transferring, please wait...</div>}
                        </Section>
                    </Modal.Content>
                </Modal >
            }
        }

        const buttonForSale = () => {
            if(isOwner){
                if (blockchainData.smartcontract.price === null) {
                    return <div>
                        <Columns>
                            <Columns.Column>
                                <button className="nes-btn is-success" style={{ width: "100%", height: "80px", fontSize: "22px" }} onClick={() => { setShowTranfer(true) }}>Transfer</button>
                            </Columns.Column>
                            <Columns.Column>
                                <button className="nes-btn is-error" style={{ width: "100%", height: "80px", fontSize: "22px" }} onClick={() => { setShowSell(true) }}>Sell</button>
                            </Columns.Column>
                        </Columns>
                    </div>
                } else {
                    return <button className="nes-btn is-error" style={{ width: "100%", height: "80px", fontSize: "22px" }} color="danger" onClick={() => { setShowRemove(true) }}>Undo Sell</button>
                }
            }
        }

        const returnSellBox = () => {
            if (showSell) {
                return <Modal show={showSell} onClose={() => setShowSell(false)}>
                    <Modal.Content style={{ textAlign: "center" }}>
                        <Section style={{ backgroundColor: 'white' }}>
                            <Heading style={{ fontSize: "22px" }}>Sell <br /><span style={{ color: "#429A98" }}>{blockchainData.domain}</span></Heading>
                            Enter the desired amount for your domain <br /><br />
                            <Input style={{ width: "100%!important", textAlign: "center" }} type="text" onChange={(evt) => { setPrice(evt.target.value) }} placeholder="Insert Amount" value={price} /><br></br>
                            <Input style={{ width: "100%!important", textAlign: "center", marginTop: "20px" }} type="password" onChange={(evt) => { setPassword(evt.target.value) }} placeholder="Insert wallet password" value={password} /><br></br><br></br>
                            {!isSelling ? <button className="nes-btn is-success" onClick={placeSell}>SELL</button> : <div>Placing Sell, please wait...</div>}
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
                            <Heading>Remove from marketplace <br /><span style={{ color: "red" }}>{blockchainData.domain}</span></Heading>
                            If you don't want to sell this domain anymore, enter the password to confirm! <br /><br />
                            <div className="nes-field">
                                <Input className="nes-input" style={{ width: "100%!important", textAlign: "center", marginTop: "20px" }} type="password" onChange={(evt) => { setPassword(evt.target.value) }} placeholder="Insert wallet password" value={password} />
                            </div><br></br><br></br>
                            {!isRemoving ? <button className="nes-btn is-error" onClick={removeSell} color="success">Remove from marketplace</button> : <div>Removing from marketplace, please wait...</div>}
                        </Section>
                    </Modal.Content>
                </Modal >
            }
        }

        const returnUpdateBox = () => {
            if (showUpdate) {
                return <Modal show={showUpdate} onClose={() => setShowUpdate(false)}>
                    <Modal.Content style={{ textAlign: "center" }}>
                        <Section style={{ backgroundColor: 'white' }}>
                            <Heading>Update <span style={{ color: "red" }}>{what}</span> for name <br /><span style={{ color: "red" }}>{blockchainData.domain}</span></Heading>
                            enter the password to update your name, please remember that these data are written in blockchain and are immutable, be careful.<br /><br />
                            <div className="nes-field">
                                <Input className="nes-input" style={{ width: "100%!important", textAlign: "center", marginTop: "20px" }} type="password" onChange={(evt) => { setPassword(evt.target.value) }} placeholder="Insert wallet password" value={password} />
                            </div><br></br><br></br>
                            {!isUpdating ? <button className="nes-btn is-error" onClick={updateName} color="success">Update metadata</button> : <div>Updating metadata, please wait...</div>}
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
            <div className="Details">
                {returnTransferBox()}
                {returnSellBox()}
                {returnUpdateBox()}
                {returnRemoveBox()}
                {returnDialog()}
                <NavBar />
                <Container style={{ marginTop: "150px" }}>
                    <div className="nes-container is-rounded" style={{ paddingTop: "30px" }}>
                        <div className="nes-container is-rounded with-title" style={{ marginBottom: "30px" }}>
                            <div className="title">
                                <h1 style={{ color: "red", fontWeight: 600, fontSize: "32px" }}>{blockchainData.domain}</h1><br /><br />
                            </div>
                            <Media>
                                <Media.Item renderAs="figure" position="left">
                                    {icon.length > 0 ? <img src={'https://ipfs.io/ipfs/' + icon} alt="IPFS-Icon" /> : <Gravatar style={{ marginTop: "10px", height: "200px", width: "200px" }} email={uuid} /> }
                                </Media.Item>
                                <Media.Item>
                                    <Content>
                                        <div style={{ marginTop: "5px" }}>
                                            <p style={{ marginTop: 0 }}>NFT identifier:<br /><b>{uuid}</b></p>
                                            <p style={{ marginTop: 0 }}>Owner:<br /> <b>{blockchainData.address}</b></p>
                                            <p style={{ marginTop: 0 }}>Block:<br /> <b>{blockchainData.block}</b></p>
                                            <p style={{ marginTop: 0 }}>TxID:<br /><b><a href={'https://bb.scryptachain.org/tx/' + blockchainData.txid} rel="noreferrer" target="_blank">{blockchainData.txid}</a></b></p>
                                            <p style={{ marginTop: 0 }}>Timestamp:<br /><b>{blockchainData.date}</b></p>
                                            {bitcoin.length > 0 ? <p style={{ marginTop: 0 }}>Bitcoin address:<br /><b>{bitcoin}</b></p> : "" }
                                            {ethereum.length > 0 ? <p style={{ marginTop: 0 }}>Ethereum address:<br /><b>{ethereum}</b></p> : "" }
                                            {link.length > 0 ? <p style={{ marginTop: 0 }}>Website:<br /><a href={'https://' + link} rel="noreferrer" target="_blank">{link}</a></p> : "" }
                                            {youtube.length > 0 ? <p style={{ marginTop: 0 }}>Youtube:<br /><b>{youtube}</b></p> : "" }
                                            {icon.length > 0 ? <p style={{ marginTop: 0 }}>IPFS:<br /><a href={'https://ipfs.io/ipfs/' + icon} rel="noreferrer" target="_blank">{icon}</a></p> : "" }
                                        </div>
                                    </Content>
                                </Media.Item>
                            </Media>
                        </div>
                    </div>
                </Container>
                {!isOwner ? <div></div> : 
                    <Container style={{ marginTop: "30px" }}>
                        <div className="nes-container is-rounded" style={{ paddingTop: "30px" }}>
                            <div className="nes-container is-rounded with-title" style={{ marginBottom: "30px" }}>
                                <div className="title">
                                    <h1 style={{ color: "red", fontWeight: 600, fontSize: "32px", marginBottom: "20px" }}>Metadata</h1>
                                    <small>Attach data to your name</small>
                                </div>
                                    <div style={{ marginTop: "40px" }}>
                                        <div style={{ position: "relative" }}>
                                            <h3>Bitcoin Address</h3>
                                            <div className="nes-field" style={{ marginBottom: "20px" }}>
                                                <Input style={{ height: "45px" }} onChange={(evt) => { setBitcoin(evt.target.value) }} value={bitcoin} className="nes-input" placeholder="Insert a Bitcoin address" />
                                            </div>
                                            <button className="nes-btn is-primary" onClick={() => { setWhat('bitcoin'); setShowUpdate(true) }} style={{ position: "absolute", top: 28, right: 0 }}>Save</button>
                                        </div>
                                        <div style={{ position: "relative" }}>
                                            <h3>Ethereum Address</h3>
                                            <div className="nes-field" style={{ marginBottom: "20px" }}>
                                                <Input style={{ height: "45px" }} onChange={(evt) => { setEthereum(evt.target.value) }} value={ethereum} className="nes-input" placeholder="Insert a Ethereum address" />
                                            </div>
                                            <button className="nes-btn is-primary" onClick={() => { setWhat('ethereum'); setShowUpdate(true) }} style={{ position: "absolute", top: 28, right: 0 }}>Save</button>
                                        </div>
                                        <div style={{ position: "relative" }}>
                                            <h3>Website</h3>
                                            <div className="nes-field" style={{ marginBottom: "20px" }}>
                                                <Input style={{ height: "45px" }} onChange={(evt) => { setLink(evt.target.value) }} value={link} className="nes-input" placeholder="Insert a link to your website" />
                                            </div>
                                            <button className="nes-btn is-primary" onClick={() => { setWhat('link'); setShowUpdate(true) }} style={{ position: "absolute", top: 28, right: 0 }}>Save</button>
                                        </div>
                                        <div style={{ position: "relative" }}>
                                            <h3>IPFS Image hash </h3>
                                            <div className="nes-field" style={{ marginBottom: "20px" }}>
                                                <Input style={{ height: "45px" }} onChange={(evt) => { setIcon(evt.target.value) }} value={icon} className="nes-input" placeholder="Insert a valid IPFS hash" />
                                            </div>
                                            <button className="nes-btn is-primary" onClick={() => { setWhat('icon'); setShowUpdate(true) }} style={{ position: "absolute", top: 28, right: 0 }}>Save</button>
                                        </div>
                                        <div style={{ position: "relative" }}>
                                            <h3>Youtube</h3>
                                            <div className="nes-field" style={{ marginBottom: "20px" }}>
                                                <Input style={{ height: "45px" }} onChange={(evt) => { setYoutube(evt.target.value) }} value={youtube} className="nes-input" placeholder="Insert a link to youtube video or channel" />
                                            </div>
                                            <button className="nes-btn is-primary" onClick={() => { setWhat('youtube'); setShowUpdate(true) }} style={{ position: "absolute", top: 28, right: 0 }}>Save</button>
                                        </div>
                                    </div>
                            </div>
                        </div>
                        <div style={{ marginTop: "30px" }}>
                            {buttonForSale()}
                        </div>
                    </Container>
                }
            </div>
        );
    }
}
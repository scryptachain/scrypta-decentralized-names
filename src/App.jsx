import './App.css';
import 'react-bulma-components/dist/react-bulma-components.min.css';
import { Button } from 'react-bulma-components';
import React, { useState } from 'react';
const ScryptaCore = require('@scrypta/core')
const scrypta = new ScryptaCore(true)

function App() {
  let [wallet, setWallet] = useState("")
  return (
    <div className="App">
      <header className="App-header">
        <pre style={{fontSize:"9px"}}>{wallet}</pre><br/>
        <Button onClick={async () => { let wallet = await scrypta.createAddress('dodododo'); setWallet(JSON.stringify(wallet)); }} color="primary">Give me a new wallet!</Button>
      </header>
    </div>
  );
}

export default App;

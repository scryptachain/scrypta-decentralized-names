import { Button } from 'react-bulma-components';
import React, { useState } from 'react';
import { Form } from 'react-bulma-components';
import { NavBar } from '../components/navbar.jsx';
const ScryptaCore = require('@scrypta/core')
const scrypta = new ScryptaCore(true)
const { Input, Field, Control } = Form;

export function Explore() {
  return (
    <div>
      <NavBar />
      <div className="Explore">
        <h1>Explore Decentralized Names</h1>
        <p>Try try try try try </p>
      </div>
    </div>
  );
}
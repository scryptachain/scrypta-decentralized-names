import './App.css';
import 'react-bulma-components/dist/react-bulma-components.min.css';
import React, { useState } from 'react';
import { Splash } from './views/splash.jsx'
import { Dashboard } from './views/dashboard.jsx'
import { Explore } from './views/explore.jsx'
import { Login } from './views/login.jsx'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";

const User = require("./libs/user");

function App() {
  let [logged, setLogged] = useState(false)
  let [guest, setGuest] = useState(true)

  async function init() {
    let auth = await User.auth();
    if (auth !== false) {
      setLogged(true)
    }
    let isGuest = localStorage.getItem('isGuest')
    if (isGuest === true) {
      setGuest(true)
    }
  }

  init()

  if (logged) {
    if (guest) {
      return (
        <Router>
          <Switch>
            <Route exact path="/"><Explore /></Route>
            <Route exact path="/login"><Login /></Route>
          </Switch>
        </Router>
      )
    } else {
      return (
        <Router>
          <Switch>
            <Route exact path="/"><Dashboard /></Route>
            <Route exact path="/login"><Login /></Route>
          </Switch>
        </Router>
      )
    }
  } else {
    return (<Splash />)
  }
}

export default App;
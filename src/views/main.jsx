import React, { Component } from "react";
import { Splash } from './splash.jsx'
import { Dashboard } from './dashboard.jsx'
import { Showcase } from './showcase.jsx'
import { Explore } from './explore.jsx'
import { Login } from './login.jsx'
import { Details } from './details.jsx'
import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";
const ScryptaCore = require('@scrypta/core')
const scrypta = new ScryptaCore(true)

export class Main extends Component {
  constructor() {
    super();
    this.state = {user: false, guest: false}
  }

  async authUser() {
    if(localStorage.getItem('SID') !== null){
        if(localStorage.getItem('SID').indexOf('xpub') !== -1){
            localStorage.setItem('xSID', localStorage.getItem('SID'))
        }
    }
    if(localStorage.getItem('xSID') !== null){
        let SIDS = localStorage.getItem('xSID').split(':')
        let address = await scrypta.deriveKeyfromXPub (SIDS[0], "m/0")
        return {
            address: address.pub,
            walletstore: localStorage.getItem('xSID'),
            xpub: SIDS[0]
        }
    }else{
        return false
    }
  }

  async fetchUser() {
      let auth = await this.authUser();
      if (auth !== false) {
        this.setState(() => { return { user: auth } })
      }
      let isGuest = localStorage.getItem('isGuest')
      if (isGuest === 'true') {
        this.setState(() => { return { guest: true } })
      } else {
        this.setState(() => { return { guest: false } })
      }
  }

  componentDidMount() {
    this.fetchUser();
  }

  render() {
    if (this.state.user || this.state.guest) {
      if (this.state.guest && !this.state.user) {
        return (
          <Router>
            <Switch>
              <Route exact path="/"><Explore /></Route>
              <Route exact path="/how-it-works"><Login /></Route>
            </Switch>
          </Router>
        )
      } else {
        return (
          <Router>
            <Switch>
              <Route exact path="/"><Dashboard user={this.state.user} /></Route>
              <Route exact path="/details/:uuid"><Details user={this.state.user} /></Route>
              <Route expact path="/showcase"><Showcase user={this.state.user} /></Route>
              <Route exact path="/how-it-works"><Login /></Route>
            </Switch>
          </Router>
        )
      }
    } else {
      return (<Splash />)
    }
  }
}
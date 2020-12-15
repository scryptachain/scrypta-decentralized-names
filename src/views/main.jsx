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
const User = require("../libs/user");

export class Main extends Component {
  constructor() {
    super();
    this.state = {user: false, guest: false}
  }

  async fetchUser() {
      let auth = await User.auth();
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
              <Route exact path="/login"><Login /></Route>
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
              <Route exact path="/login"><Login /></Route>
            </Switch>
          </Router>
        )
      }
    } else {
      return (<Splash />)
    }
  }
}
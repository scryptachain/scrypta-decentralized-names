import React, { useState, useEffect } from 'react';
import { NavBar } from '../components/navbar.jsx';
const User = require("../libs/user");

export function Dashboard() {
  let [user, setUser] = useState({})

  useEffect(() => {
    async function fetchUser() {
      let auth = await User.auth()
      setUser(auth)
    }
    fetchUser();
  }, [user]);

  return (
    <div className="App">
      <NavBar />
      Dashboard view
    </div>
  );
}
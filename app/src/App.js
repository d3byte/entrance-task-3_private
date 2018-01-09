import React, { Component } from 'react'
import {
  BrowserRouter as Router,
  Route, Switch, Link
} from 'react-router-dom'

// Pages
import Main from './pages/Main'
import New from './pages/New'
import Edit from './pages/Edit'

class App extends Component {
  render() {
    return (
      <Router>
          <Switch>
            <Route exact path="/" component={Main} />
            <Route exact path="/new" component={New} />
            <Route exact path="/edit" component={Edit} />
          </Switch>
      </Router>
    )
  }
}

export default App

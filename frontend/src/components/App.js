import React, { Component } from 'react';
import {Route, Router, Switch} from 'react-router-dom';
import {history} from '../helpers';
import * as Context from "../context";

import Header from './Header/Header';
import MainBody from './MainBody/MainBody';
import PlayerPage from './PlayerPage/PlayerPage';
import Footer from './Footer/Footer';
import NotFound from './Errors/NotFound';

import './App.css';

class App extends Component {

  constructor(props, context) {
    super(props, context);

    history.listen((location, action) => {
    });
  }

  render() {

    return (
        <React.Fragment>
          <Context.Web3.Provider>
          <Router history={history}>
            <Route path="/" component={Header}/>
            <div className={"content "}>
              <Switch>
                <Switch>
                  <Route exact path="/" component={MainBody}/>
                  <Route exact path="/player" component={PlayerPage}/>
                  <Route component={NotFound}/>
                </Switch>
              </Switch>
            </div>
            <Route path="/" component={Footer}/>
          </Router>
          </Context.Web3.Provider>
        </React.Fragment>

    );
  }
}

export default App;

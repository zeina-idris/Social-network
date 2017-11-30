import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, IndexRoute, hashHistory, browserHistory } from 'react-router';
import { createStore, applyMiddleware} from 'redux';
import reduxPromise from 'redux-promise';
import {Provider} from 'react-redux'
import { composeWithDevTools } from 'redux-devtools-extension';
import reducer from './reducer';
import axios from 'axios';
import Register from './register';
import Welcome from './welcome';
import Login from './login';
import {App} from './app';
import {socket} from './socket'
import Profile from './profile';
import Userprofile from './opp';
import Friends from './friends'
import OnlineUsers from './onlineUsers'
import Chat from './chat'
import Requests from './requests'

export const store = createStore(reducer, composeWithDevTools(applyMiddleware(reduxPromise)));

if(location.pathname != '/welcome'){
  socket();
}


const loggedIn = (
    <Provider store={store}>
        <Router history={browserHistory}>
            <Route path="/" component={App}>
                <IndexRoute component={Profile} />
                <Route path="user/:id" component={Userprofile} />
                <Route path="/friends" component={Friends} />
                <Route path='/requests' component={Requests} />
                <Route path="/online" component={OnlineUsers}/>
                <Route path="/chat" component={Chat}/>
            </Route>
        </Router>
    </Provider>
)

const notLoggedIn = (
        <Router history={hashHistory}>
            <Route path="/" component={Welcome}>
                <Route path="/login" component={Login} />
                <IndexRoute component={Register} />
            </Route>
        </Router>
)

let router = location.pathname === '/welcome' ? notLoggedIn : loggedIn;



ReactDOM.render(
    router,
    document.querySelector('main')
);

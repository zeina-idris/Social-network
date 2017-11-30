import React from 'react';
import Register from './register'
import Login from './login'
import Logo from './logo'

export default class Welcome extends React.Component{
    render() {
        return(
            <div id="welcome-c">
                <div id="welcome-cc">
                    <Logo />
                    <h1>Welcome to MEET'N EAT community</h1>
                    {this.props.children}
                </div>
            </div>
        )
    }
}

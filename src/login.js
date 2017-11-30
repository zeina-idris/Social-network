import React from 'react';
import {Link} from 'react-router';
import axios from 'axios';
import Register from './register';



export default class Login extends React.Component{
    constructor(props){
        super (props)
        this.state = {}
    }
    submit() {
        axios.post('/login', {
            email: this.refs.email.value,
            password: this.refs.password.value
        }).then(resp => {
            if (resp.data.success) {
                location.replace('/')
            } else {
                this.setState({
                    error: true
                })
            }
        });
    }
    render() {
        return(
            <div id='login'>
            {this.state.error && <p style={{color:"red"}}>Something went wrong</p>}
                <h1>Log in</h1>
                <input className='input' type='email' ref='email' placeholder='Email' />
                <input className='input' type='password' ref='password' placeholder='Password' />
                <button className='reg-btn' onClick={() => this.submit()}>LOG IN</button>
                <h3> Not a member? Sign up <Link to="/">here</Link></h3>
            </div>
        )
    }
}

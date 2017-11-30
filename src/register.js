import React from 'react';
import Login from './login';
import {Link} from 'react-router';
import axios from 'axios';

export default class Register extends React.Component {
    constructor(props){
        super (props)
        this.state = {}
    }
    submit() {
        axios.post('/register', {
            first: this.refs.first.value,
            last: this.refs.last.value,
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
        return (
            <div>
            {this.state.error && <p style={{color:"red"}}>Something went wrong</p>}
            <div id="container">
                <h3 className='signup-title'>Become a member</h3>
                <input className='input' type='text' ref='first' placeholder='First name' />
                <input className='input' type='text' ref='last' placeholder='Last name' />
                <input className='input' type='email' ref='email' placeholder='Email' />
                <input className='input' type='password' ref='password' placeholder='Password' />
                <button className='reg-btn' onClick={() => this.submit()}>SIGN UP</button>
                </div>

                <h3>Already a member? Please <Link to="/login">log in</Link></h3>
            </div>
        )
    }
}

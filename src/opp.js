import React from 'react';
import ProfilePic from './profilepic';
import Bio from './bio';
import Logo from './logo';
import axios from 'axios';
import FriendButton from './friendButton';

export default class Userprofile extends React.Component {
    constructor(props){
        super(props)
        this.state={}
    }
    componentDidMount(){
        const {id} = this.props.params
        axios.get(`/user/${id}/info`).then(({data}) => {
            if(data.userIsLoggedIn){
                browserHistory.push('/')
            }
            this.setState({
                first: data.first,
                last: data.last,
                bio: data.bio,
                image: data.image,
                id: data.id,
                paramsId: this.props.params.id,
                friendshipStatus: data.friendshipStatus,
                userIsLoggedIn: this.userIsLoggedIn
            })
        })
    }
    render(){
        if(!this.state.id){
            return null;
        }
        return(
            <div  id='user_c'>
                <img className='user_img' src={this.state.image} alt={`${this.state.first}${this.state.last}`} />
                <h2>{this.state.first} {this.state.last}</h2>
                        <div className='userbio'><h3>{this.state.bio}</h3></div>
                        <FriendButton {...this.state} />
            </div>
        )
    }
}

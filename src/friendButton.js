import React from 'react';
import axios from 'axios'
import {Link} from 'react-router'

export default class FriendButton extends React.Component{
    constructor(props){
        console.log(props);
        super(props)
        this.state = {
            message: this.props.friendshipStatus.message,
            status: this.props.friendshipStatus.status
        }
    }

    updatedStatus(status){
        const id = this.props.paramsId
        axios.post(`/friendshipStatus/user/${id}`, {
            updatedStatus: status
        }).then(({data}) => {
            this.setState({
                status: data.status,
                message: data.message
            })
        })
    }
    render(){
        return(
            <div>

            {this.state.message === "no entry" &&
             <button onClick={()=>{this.updatedStatus(1)}} className='friend_button'>Add friend</button>}

             {this.state.message === "changeToMakeRequest" &&
             <button onClick={() => {this.updatedStatus(1)}} className='friend_button' >Add friend</button>}

            {this.state.status === 1 && this.state.message == "HasToConfirm" &&
            <button onClick={() => {this.updatedStatus(2)}} className='friend_button'>Accept request</button>}

            {this.state.status === 1 && this.state.message == "WaitingForAccept" &&
            <button onClick={() => {this.updatedStatus(3)}} className='friend_button' >Cancel Request</button>}

            {this.state.message === "canTerminate" &&
            <button onClick={() => {this.updatedStatus(4)}} className='friend_button'>Unfriend</button>}

            </div>
        )
    }
}

import React from 'react';
import axios from 'axios';
import {connect} from 'react-redux';
import {receiveFriendRequests, acceptFriendRequest, endFriendship, rejectFriendRequest} from './actions'
import { Link } from 'react-router'

class Requests extends React.Component {
    constructor(props) {
        super(props)

        this.loadPending = this.loadPending.bind(this)
    }

    componentDidMount() {
        if(!this.props.getList){
            return
        }
        this.props.getList()
    }

    loadPending(){
        console.log('about to load pending', this.props.friendsPending);
        return(
            <div id="friends-container">

              {this.props.friendsPending.map(friend =>
              <div className='friends-small'>
                <Link id="userprofile" to={'/user/'+friend.id}><img id="friend-pic"src={friend.image}/></Link>
                <Link id="userprofile" to={'/user/'+friend.id}><p>{friend.first} {friend.last}</p></Link>
                <div className="flex-button">
                  <button onClick={()=>{this.props.acceptFriendRequest(friend.id)}}>Accept Request</button>
                  <button onClick={()=>{this.props.rejectFriendRequest(friend.id)}}>Reject Request</button>
                </div>
              </div>)}
            </div>
        )
    }

    render(){
        const {friendsPending} = this.props;
        if(!friendsPending || friendsPending.length === 0){
          return (
            <div>
                <h2 className='no-friends-requests'>No friend requests</h2>
            </div>
          )
        }
        else{
            return (
                <div>
                <h2 className='f-requests'>Friend Requests</h2>
                {this.loadPending()}
                </div>
            )
        }
    }
}

const mapStateToProps = function(state) {
    return {
        friendsPending: state.friends && state.friends.filter(friends => friends.status == 1)
    }
}

const mapDispatchToProps = function(dispatch) {
    console.log('running map dispatch to props');
    return {
        getList: () => dispatch(receiveFriendRequests()),
        acceptFriendRequest: (id) => dispatch(acceptFriendRequest(id)),
        endFriendship: (id) => dispatch(endFriendship(id)),
        rejectFriendRequest: (id) => dispatch(rejectFriendRequest(id))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Requests);

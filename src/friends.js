import React from 'react';
import axios from 'axios';
import {connect} from 'react-redux';
import {receiveFriendRequests, acceptFriendRequest, endFriendship, rejectFriendRequest} from './actions'
import { Link } from 'react-router'

class Friends extends React.Component {
    constructor(props) {
        super(props)

        this.loadFriends = this.loadFriends.bind(this)
    }

    componentDidMount() {
        if(!this.props.getList){
            return
        }
        this.props.getList()
    }

    loadFriends(){
        return(
            <div id="friends-container">
              {this.props.friendsAccepted.map(friend =>
              <div className='friends-small'>
                <Link id="userprofile" to={'/user/'+friend.id}><img id="friend-pic"src={friend.image}/></Link>
                <Link id="userprofile" to={'/user/'+friend.id}><p>{friend.first} {friend.last}</p></Link>
                <div className="flex-button">
                    <button onClick={()=>{this.props.endFriendship(friend.id)}}>Unfriend</button>
                </div>
              </div>)}
            </div>
        )
    }
    render(){
        console.log('friends props', this.props);
        const {friendsPending, friendsAccepted} = this.props;
        if(!friendsPending && !friendsAccepted ){
          return (<div>LOADING.. </div>);
        }
        else{
            return (
                <div>
                <h2 className='friends'>Friends</h2>
                {this.loadFriends()}

                </div>
            )
        }
    }
}

const mapStateToProps = function(state) {
    return {
        friendsAccepted: state.friends && state.friends.filter(friends => friends.status == 2)
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

export default connect(mapStateToProps, mapDispatchToProps)(Friends);

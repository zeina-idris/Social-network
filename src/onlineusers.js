import React from 'react'
import axios from 'axios'
import {connect} from  'react-redux'
import {Link} from 'react-router'

export class OnlineUsers extends React.Component {
    constructor(props){
        super(props)
    }

    render(){
        const {onlineUsers} = this.props;
        if(!onlineUsers){
            return null
        }
        const onlineUsersList = (
            <div className="friends-container">
              {onlineUsers.map(user =>
                <div className='friends-small'>
                <Link id="userprofile" to={'/user/'+user.id}><img id="friend-pic"src={user.image}/></Link>
                <Link id="userprofile" to={'/user/'+user.id}><p>{user.first} {user.last}</p></Link>

                </div>)}
            </div>
            );
            return(
            <div>
              <h3 className='onlineusers'>Online Friends</h3>
              {onlineUsersList}
            </div>
        )
    }
}

const mapStateToProps = function(state) {
    return {
        onlineUsers: state.onlineUsers
    }
}

export default connect(mapStateToProps)(OnlineUsers);

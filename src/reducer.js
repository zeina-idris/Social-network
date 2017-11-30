export default function(state = {}, action){

    if(action.type == 'RECEIVE_FRIEND_REQUESTS'){
        console.log('friends in reducer', action.friends);
        state = Object.assign({}, state, {
            friends: action.friends
        })
    }

    if(action.type == 'ACCEPT_FRIEND_REQUEST'){
        state = Object.assign({}, state, {
                friends: state.friends.map(function(friend){
                    if(friend.id == action.id){
                        return Object.assign({}, friend, {
                            status: 2
                        })
                    } else{
                        return friend;
                    }
                })
        })
    }


if(action.type == 'REJECT_FRIEND_REQUEST'){
    state = Object.assign({}, state, {
        friends: state.friends.map(function(friend){
            if(friend.id == action.id){
                return Object.assign({}, friend, {
                    status: 5
                })
            }else {
                return friend
            }
        })
    })
}

if(action.type == 'END_FRIENSHIP'){
    state = Object.assign({}, state, {
        friends: state.friends.map(function(friend){
            if(friend.id == action.id){
                return Object.assign({}, friend, {
                    status: 4
                })
            }else {
                return friend
            }
        })
    })
}



if(action.type == "ONLINE_USERS"){
  state = Object.assign({}, state,{
      onlineUsers: action.users,
      chatMessages: action.content
    })
}

if(action.type == "USER_JOINED"){
  if (state.onlineUsers && !state.onlineUsers.find(user => user.id == action.user.id)) {
      state = Object.assign({}, state, {
          onlineUsers: [...state.onlineUsers, action.user]
      });
  }
}

if(action.type == "USER_LEFT"){
    state= Object.assign({}, state, {
      onlineUsers: state.onlineUsers.filter(user => user.id !== action.id.id)
    });
}


if(action.type == "CHAT_MSG"){
  state = Object.assign({}, state, {
    chatMessages: action.content
  })
}


    return state;

}

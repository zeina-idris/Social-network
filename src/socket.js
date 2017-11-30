import * as io from 'socket.io-client';
import { store } from './start';
import { onlineUsers, userJoined, userLeft, chatMessage,receiveFriendRequests } from './actions';
import axios from 'axios';

let socket
let count =0;
export function getSocket(){
  if(!socket){
    socket = io.connect();
    socket.on('connect', function(){
      axios.get(`/connected/${socket.id}`).then().catch(err=>console.log(err))
    });

    socket.on('onlineUsers', function(users){
      store.dispatch(onlineUsers([users.onlineUsers, users.messages]))
    });

    socket.on('userJoined', function(user){
      store.dispatch(userJoined(user))
    });

    socket.on('userLeft', function(id){
      store.dispatch(userLeft(id))
    });

    socket.on('chatMessage', function(msg){
        console.log('message right before emiting message', msg);
      store.dispatch(chatMessage(msg))
    })


  return socket;
  }
}

export function emitSocket(msg){
  getSocket();
  socket.emit('chatMessage', {
    msg : msg
  })
}

export {getSocket as socket}

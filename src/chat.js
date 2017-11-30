import React from 'react';
import axios from 'axios';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import {emitSocket} from './socket';


class Chat extends React.Component {
  constructor(props){
    super(props)
    this.handleKeyPress = this.handleKeyPress.bind(this)
  }

  handleKeyPress(e) {
    if (e.key === 'Enter') {
      this.message = e.target.value
      emitSocket(this.message);
      e.target.value = "";
    }
  }


  render(){
    const {chatMessages} = this.props;
    // console.log('props right before render', this.props);
    console.log('chat messages right before render', chatMessages);
    if(chatMessages){
      var messages = (
        <div className="chat-container" ref={elem => this.elem = elem}>
            {chatMessages.map(msg => {
                const classToPass = msg.authorId === this.props.id ? 'my-special-class' : 'dubees'
                return(
                    <div className='message-container'>
                        <p className="time">{msg.time}</p>
                        <p className={`message ${classToPass}`}>{msg.authorId === this.props.id ? '' : msg.first + ':'} {msg.msg}</p>
                    </div>
                )
            })}
        </div>
      )
    }else{
        messages = null
    }


    return(
    <div id='chitchat'>
        <h3 className='messenger'> Messenger </h3>
        <div id="chat-container">
            {messages}
        </div>
        <textarea id="chat-message" placeholder="Type a message..." onKeyPress={this.handleKeyPress} ></textarea>
    </div>
    )
  }
}

const mapStateToProps = function(state) {
    return {
        chatMessages: state.chatMessages,
        requests: state.requests
    }
}

export default connect(mapStateToProps)(Chat);

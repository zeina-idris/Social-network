import React from 'react';
import {Link} from 'react-router';
import axios from 'axios';
import Logo from './logo'
import {ImageUpload} from './imageUpload'
import ProfilePic from './profilepic'
import Bio from './bio'
import Userprofile from './opp'

export class App extends React.Component {
    constructor(props){
        super (props)
        this.state = {
            imageUploadVisible: false,
            first: '',
            last: ''
        }

    }
    componentDidMount(){
        axios.get('/user').then(({data}) => {
            this.setState({
                first: data.first,
                last: data.last,
                image: data.image,
                bio: data.bio,
                id: data.id
            })
        });
    }


    render() {
        const clonedChildren = React.cloneElement(
            this.props.children, {
                first: this.state.first,
                last: this.state.last,
                image: this.state.image,
                bio: this.state.bio,
                changeBio: bio => {
                    this.setState({ bio })
                },
                id: this.state.id,
            }
        )
        return (
            <div id='home-c'>
                <div id='navtop'>
                    <Logo />
                    <div className='nav'>
                        <Link className='profile-link' to='/'>Profile</Link>
                        <Link className="friend-link" to="/online">Online users</Link>
                        <Link className="chat-link" to="/chat">Chat</Link>
                        <Link className='friendslist' to='/friends'>Friends</Link>
                        <Link className='requests' to='/requests'>Friend Requests</Link>
                        <a href='/logout'><i className='fa fa-sign-out'></i></a>
                        </div>
                        <ProfilePic
                            onClick={() => this.setState({ imageUploadVisible: true})}
                            first= {this.state.first}
                            last= {this.state.last}
                            image= {this.state.image}
                            id= {this.state.id}
                        />
                </div>
                 {this.state.imageUploadVisible &&
                     <ImageUpload
                        setImage={url => this.setState({image:url})}
                        onClick={() => this.setState({ imageUploadVisible: false})}
                        toggleUploadModal={() => {this.setState({ imageUploadVisible: !this.state.imageUploadVisible})}}
                    />}
                    {clonedChildren}
            </div>
        )
    }
}

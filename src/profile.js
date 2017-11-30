import React from 'react';
import ProfilePic from './profilepic';
import Bio from './bio'


export default class Profile extends React.Component {
    render(){
        return(
            <div id='profile'>
            <div id='profileContainer'>
                <ProfilePic
                first= {this.props.first}
                last= {this.props.last}
                image= {this.props.image}
                id= {this.props.id}
                />
                <h2 className="fname">{this.props.first} {this.props.last}</h2>
                <Bio user={this.props} />
            </div>
            </div>
        );
    }
}

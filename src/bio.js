import React from 'react';
import axios from 'axios';

export default class Bio extends React.Component{
    constructor(props){
        console.log(props);
        super(props)
        this.getBio = this.getBio.bind(this)
        this.uploadBio = this.uploadBio.bind(this)
        this.state = {
            biovisibility: false
        }
    }
    getBio(e){
        this.bio= e.target.value
    }
    uploadBio(){
        axios.post('/editbio', {
            bio: this.bio
        }).then((result)=>{
            this.props.user.changeBio(this.bio);
            this.setState({ biovisibility: !this.state.biovisibility })
        })
    }
    render(){
        return(
            <div id='biomain'>
                <h2 className='Editbio' onClick={() => {this.setState({ biovisibility: !this.state.biovisibility})}}>
                <img className='pen' src='public/images/edit.png' />
                Edit profile
                </h2>
                <div  className='bio'>
                    <h3 className='biotext'>{this.props.user.bio}</h3>
                </div>
            {this.state.biovisibility && <div>
            <textarea className='textarea' onChange={this.getBio} />
            <button className='bio-btn' onClick={this.uploadBio}>save</button>
            </div>
            }
            </div>
        )
    }
}

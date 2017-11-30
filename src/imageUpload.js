import React from 'react';
import axios from 'axios';

export class ImageUpload extends React.Component{
    constructor(props){
        super (props);
        this.handleSubmit = this.handleSubmit.bind(this)
    }




    handleSubmit(e){
        var element = document.getElementById('file').files[0]
        console.log(e.target);
        const formData = new FormData();
        formData.append('file', element)
        axios.post('/upload', formData
        ).then((result) => {
            if(result.data.success){
                var data = result.data;
                var url = data.url;
                this.props.setImage(url);
                this.props.toggleUploadModal();
            }
        })
    }

    render(){
        return (
            <div id='upload'>
                <div id="upload-c">
                    <p onClick={this.props.onClick} id='X'>X</p>
                    <h2>Change profile picture</h2>
                    <label className="upload-btn" htmlFor="file">Update profile picture</label>
                    <input type='file' id='file' />
                    <button onClick={this.handleSubmit} className="upload-btn1">Save</button>
                </div>
            </div>
        );
    }
}

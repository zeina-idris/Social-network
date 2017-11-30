import React from 'react';


export default function ProfilePic(props){

        if(!props.id){
            return(
                <h2>LOADING ...</h2>
            )
        }
        return (
            <img id='profilepic' onClick={props.onClick} src={props.image} alt={`${props.first} ${props.last}`} />
        );
}

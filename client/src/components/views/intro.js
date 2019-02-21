import React, { Component } from 'react';
import { Jumbotron } from 'reactstrap';

class Intro extends Component {

    render() {
        return (
            <Jumbotron>
                <h1 className="display-4">advisor App</h1>
                <p className="lead">This is a platform to make student-advisor communications easier and promise a more successful times durring your cualage.</p>
                <hr className="my-2" />
                <p>Here you can do:</p>
                <ul>
                    <li>update your nessacary forms required like demographics and talents</li>
                    <li>get updates with most of educational events</li>
                    <li>connect with your advisor through real-time chate</li>
                    <li>get connected with your classmate within our user friendly and secure messanger</li>
                </ul>
                <p className="lead">
                </p>
            </Jumbotron>
        )
    }
}

export default Intro;
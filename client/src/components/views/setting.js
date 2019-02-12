import React, { Component } from 'react'
import { Jumbotron } from 'reactstrap';
import CropModal from '../modals/CropModal';

import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input } from 'reactstrap';


class Settings extends Component {

    constructor(props) {
        super(props);
        this.state = {
            name: "",
            email: "",
            bio: '',
        };

    }


    onChange = (e) => {
        this.setState({ [e.target.name]: e.target.value });
        console.log(this.state);
    }


    render() {
        return (
            <div>
                
                <CropModal></CropModal>
                <Form>
                    <FormGroup>
                        <Label for="Name">name</Label>
                        <Input type="name" name="name" id="Name" placeholder="puya ars" onChange={this.onChange} />
                    </FormGroup>
                    <FormGroup>
                        <Label for="Email">Email</Label>
                        <Input type="email" name="email" id="Email" placeholder="puya@ars.co" onChange={this.onChange} />
                    </FormGroup>
                    <FormGroup>
                        <Label for="Bio">bio</Label>
                        <Input type="text" name="bio" id="Bio" placeholder="my leggend will happen soon.." onChange={this.onChange} />
                    </FormGroup>
                </Form>
            </div>
        )
    }
}

export default Settings;
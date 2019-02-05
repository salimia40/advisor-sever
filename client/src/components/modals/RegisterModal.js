import React from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input } from 'reactstrap';
import { register } from '../../store/actions';
import { connect } from 'react-redux';

class RegisterModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            modal: false,
            name: "",
            email: "",
            username: "",
            role: "advisor",
            password: ""
        };

        this.toggle = this.toggle.bind(this);
    }

    onChange = (e) => {
        this.setState({ [e.target.name]: e.target.value });
        console.log(this.state);
    }

    doRegister = () => {
        this.toggle();
        var user = {
            name: this.state.name,
            username: this.state.username,
            email: this.state.email,
            password: this.state.password,
            role: this.state.role,
        };

        this.props.register(user);
    }


    toggle() {
        this.setState({
            modal: !this.state.modal
        });
    }

    getForm() {
        return (
            <Form>
                <FormGroup>
                    <Label for="Name">name</Label>
                    <Input type="name" name="name" id="Name" placeholder="puya ars" onChange={this.onChange} />
                </FormGroup>
                <FormGroup>
                    <Label for="Username">username</Label>
                    <Input type="username" name="username" id="Username" placeholder="puyaars" onChange={this.onChange} />
                </FormGroup>
                <FormGroup>
                    <Label for="Email">Email</Label>
                    <Input type="email" name="email" id="Email" placeholder="puya@ars.co" onChange={this.onChange} />
                </FormGroup>
                <FormGroup>
                    <Label for="Select">role</Label>
                    <Input type="select" name="role" id="Select" onChange={this.onChange}>
                        <option>advisor</option>
                        <option>student</option>
                    </Input>
                </FormGroup>
                <FormGroup>
                    <Label for="Password">Password</Label>
                    <Input type="password" name="password" id="Password" placeholder="password placeholder" onChange={this.onChange} />
                </FormGroup>
            </Form>
        );
    }

    render() {
        let form = this.getForm();
        return (
            <div>
                <Button color="primary" onClick={this.toggle}>register</Button>
                <Modal isOpen={this.state.modal} toggle={this.toggle} className={this.props.className}>
                    <ModalHeader toggle={this.toggle}>Register Form</ModalHeader>
                    <ModalBody>
                        {form}
                    </ModalBody>
                    <ModalFooter>
                        <Button color="primary" onClick={this.doRegister}>Register</Button>{' '}
                        <Button color="secondary" onClick={this.toggle}>Cancel</Button>
                    </ModalFooter>
                </Modal>
            </div>
        );
    }   
}

const mapStateToProps = (state) => ({
})

const mapDispatchToProps = dispatch => {
    return {
      register: user => {
        dispatch(register(user))
      }
    }
  }
  

export default connect(mapStateToProps,mapDispatchToProps)(RegisterModal);
import React from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input } from 'reactstrap';

import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { login } from '../../store/actions';

class LoginModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            modal: false,
            username: '',
            password: '',
        };

        this.toggle = this.toggle.bind(this);
    }

    toggle() {
        this.setState({
            modal: !this.state.modal
        });
    }

    onChange = (e) => {
        this.setState({ [e.target.name]: e.target.value });
        console.log(this.state);
    }

    login = () => {
        this.toggle();
        let user = {
            username: this.state.username,
            password: this.state.password
        };
        this.props.login(user);
    }


    render() {
        return (
            <div>
                <Button color="dark" onClick={this.toggle}>Login</Button>
                <Modal isOpen={this.state.modal} toggle={this.toggle} className={this.props.className}>
                    <ModalHeader toggle={this.toggle}>Login</ModalHeader>
                    <ModalBody>
                        <Form>
                            <FormGroup>
                                <Label for="Username">username</Label>
                                <Input type="username" name="username" id="Username" placeholder="puyaars" onChange={this.onChange} />
                            </FormGroup>
                            <FormGroup>
                                <Label for="Password">Password</Label>
                                <Input type="password" name="password" id="Password" placeholder="password placeholder" onChange={this.onChange} />
                            </FormGroup>
                        </Form>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="primary" onClick={this.login}>Login</Button>{' '}
                        <Button color="secondary" onClick={this.toggle}>Cancel</Button>
                    </ModalFooter>
                </Modal>
            </div>
        );
    }
}

LoginModal.propTypes = {
    login: PropTypes.func.isRequired,
} 

const mapStateToProps = (state) => ({
})

const mapDispatchToProps = dispatch => {
    return {
        login: user =>  dispatch(login(user)),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(LoginModal);
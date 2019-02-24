import React from 'react';
import { Button, Form, FormGroup, Label, Input, Card, CardBody, CardFooter, CardHeader } from 'reactstrap';

import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { login } from '../store/actions';

class LoginSide extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            username: '',
            password: '',
        };

    }


    onChange = (e) => {
        this.setState({ [e.target.name]: e.target.value });
        console.log(this.state);
    }

    login = () => {
        let user = {
            username: this.state.username,
            password: this.state.password
        };
        this.props.login(user);
    }


    render() {
        return (
            <div>
                <Card>
                    <CardHeader>Login Here</CardHeader>
                    <CardBody>
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
                    </CardBody>
                    <CardFooter>
                        <Button color="primary" onClick={this.login}>Login</Button>{' '}
                    </CardFooter>
                </Card>
            </div>
        );
    }
}

LoginSide.propTypes = {
    login: PropTypes.func.isRequired,
}

const mapStateToProps = (state) => ({
})

const mapDispatchToProps = dispatch => {
    return {
        login: user => dispatch(login(user)),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(LoginSide);
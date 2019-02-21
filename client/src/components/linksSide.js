import React from 'react';
import { Card, CardBody, Nav, NavItem,NavLink } from 'reactstrap';

import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { login } from '../store/actions';

class LinksSide extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            username: '',
            password: '',
        };

    }

    render() {
        return (
            <div>
                <Card>
                    <CardBody>
                        <Nav vertical>
                            <NavItem>
                                <NavLink >Settings</NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink >Link</NavLink>
                            </NavItem>
                        </Nav>
                    </CardBody>
                </Card>
            </div>
        );
    }
}

LinksSide.propTypes = {
    login: PropTypes.func.isRequired,
}

const mapStateToProps = (state) => ({
})

const mapDispatchToProps = dispatch => {
    return {
        login: user => dispatch(login(user)),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(LinksSide);
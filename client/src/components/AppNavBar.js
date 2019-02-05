import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import {
    Collapse,
    Navbar,
    NavbarToggler,
    NavbarBrand,
    Nav,
    NavItem,
    NavLink,
    Button
} from 'reactstrap';
import RegisterModal from './modals/RegisterModal';
import LoginModal from './modals/LoginModal';

class AppNavBar extends React.Component {
    constructor(props) {
        super(props);

        this.toggle = this.toggle.bind(this);
        this.state = {
            isOpen: false
        };
    }
    toggle() {
        this.setState({
            isOpen: !this.state.isOpen
        });
    }
    render() {
        let loggedin = this.props.userState.loggedIn;
        loggedin = false;
        return (
            <div>
                <Navbar color="light" light expand="md">
                    <NavbarBrand href="/">Advisor</NavbarBrand>
                    <NavbarToggler onClick={this.toggle} />
                    <Collapse isOpen={this.state.isOpen} navbar>
                        <Nav className="ml-auto" navbar>
                            {loggedin &&
                                <NavItem>
                                    <NavLink ><Button color="danger" >Logout</Button></NavLink>
                                </NavItem>}
                            {!loggedin &&
                                <NavItem>
                                    <NavLink ><LoginModal/></NavLink>
                                </NavItem>}
                            {!loggedin &&
                                <NavItem>
                                     <NavLink ><RegisterModal/></NavLink> 
                                    
                                </NavItem>}
                        </Nav>
                    </Collapse>
                </Navbar>
            </div>
        );
    }
}

AppNavBar.propTypes = {
    userState: PropTypes.object.isRequired
}

const mapStateToProps = (state) => ({
    userState: state.userState
})

export default connect(mapStateToProps)(AppNavBar);

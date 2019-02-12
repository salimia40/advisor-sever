import React from 'react';
import { connect } from 'react-redux';
import { logout } from '../store/actions';
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
        this.logout = this.logout.bind(this);
        this.state = {
            isOpen: false
        };
    }
    toggle() {
        this.setState({
            isOpen: !this.state.isOpen
        });
    }

    logout() {
        console.log(this.props)
        this.props.logout();
    }
    

    render() {
        let loggedin = this.props.userState.loggedIn;
        return (
            <div>
                <Navbar expand="md">
                    <NavbarBrand href="/">Advisor</NavbarBrand>
                    <NavbarToggler onClick={this.toggle} />
                    <Collapse isOpen={this.state.isOpen} navbar>
                        <Nav className="ml-auto" navbar>
                            {loggedin &&
                                <NavItem>
                                    <NavLink onClick={this.logout}><Button color="dark" >Logout</Button></NavLink>
                                </NavItem>}
                            {!loggedin &&
                                <NavItem>
                                    <NavLink ><LoginModal/></NavLink>
                                </NavItem>}
                            {!loggedin &&
                                <NavItem>
                                     <NavLink><RegisterModal/></NavLink> 
                                    
                                </NavItem>}
                        </Nav>
                    </Collapse>
                </Navbar>
            </div>
        );
    }
}

AppNavBar.propTypes = {
    userState: PropTypes.object.isRequired,
    logout: PropTypes.func.isRequired,
}

const mapStateToProps = (state) => ({
    userState: state.userState
})

const mapDispatchToProps = (dispatch) => ({
    logout: () => dispatch(logout()),
})


export default connect(mapStateToProps,mapDispatchToProps)(AppNavBar);

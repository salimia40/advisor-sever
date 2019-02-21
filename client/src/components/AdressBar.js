import React, { Component } from 'react'

import { Breadcrumb, BreadcrumbItem } from 'reactstrap';

import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {} from '../store/actions';

class AdressBar extends Component {

  render() {

    let items = this.props.navState.stack.map((page)=> {
      return (<BreadcrumbItem >{page}</BreadcrumbItem>)
    });

    console.log(this.props.navState.stack)

    return (
      <div>
        <Breadcrumb>
        {items}
        </Breadcrumb>
      </div>
    )
  }
}


AdressBar.propTypes = {
  navState: PropTypes
    .shape({
      stack : PropTypes.array.isRequired
    })
    .isRequired,
}

const mapStateToProps = (state) => ({
  navState: state.navState
})

const mapDispatchToProps = dispatch => {
  return {
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(AdressBar);
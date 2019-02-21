import React from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input } from 'reactstrap';

import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import axios from 'axios';
import { login } from '../../store/actions';
import ReactCrop from 'react-image-crop';

class CropModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            modal: false,
            src: ''
        };

        this.toggle = this.toggle.bind(this);
    }

    toggle() {
        this.setState({
            modal: !this.state.modal
        });
    }

    onChange = (e) => {
        e.preventDefault();
        this.setState({ [e.target.name]: e.target.value });
        console.log(`name: ${e.target.name}`);
        if (e.target.name === 'avatar') {

            this.setState({
                src: e.target.value
            })
            var formData = {file:e.target.value};
            axios.post('http://localhost:5000/upload', formData, {
                
            }).then(res => {
                console.log(res.data)
            }).catch(reason => {console.log(reason)})
            // this.toggle()
        }
    }

    onComplete(crop) {
        this.toggle()
    }

    render() {
        return (
            <div>
                <img className='profile circle' src={this.state.src}></img>
                <hr></hr>
                <Form>
                    <Label for='Avatar' >select avatar image</Label>
                    {/* <input type="file" alt="Submit"></input> */}
                    <Input type='file' alt="Submit" name='avatar' id='Avatar' onChange={this.onChange} />
                </Form>
                <Modal isOpen={this.state.modal} toggle={this.toggle} className={this.props.className}>
                    <ReactCrop onComplete={this.onComplete} src={this.state.src} />
                </Modal>
            </div>
        );
    }
}

CropModal.propTypes = {
    login: PropTypes.func.isRequired,
}

const mapStateToProps = (state) => ({
})

const mapDispatchToProps = dispatch => {
    return {
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(CropModal);
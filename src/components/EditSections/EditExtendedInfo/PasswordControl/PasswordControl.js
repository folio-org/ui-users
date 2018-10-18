import React from 'react';
import PropTypes from 'prop-types';
import { Field } from 'redux-form';
import {
  Button,
  TextField,    
  Col,
} from '@folio/stripes/components';

import css from './PasswordControl.css';

class PasswordControl extends React.Component {
  state = {
    showPassword: false,  
  }

  togglePassword = () => {
    this.setState(({ showPassword }) => ({
      showPassword: !showPassword,  
    }));  
  }

  render() {
    const { intl } = this.props;
    
    return (
      <React.Fragment>
        <Col xs={12} md={3}>
          <Field
            component={TextField}
            label={`${intl.formatMessage({ id: 'ui-users.extended.folioPassword' })} `}
            name="creds.password"
            id="pw"
            autoComplete="new-password"
            type={this.state.showPassword ? 'text' : 'password'}
            fullWidth
          />
        </Col>
        <Col xs={12} md={1} className={css.togglePw}>
          <Button onClick={this.togglePassword}>
            {this.state.showPassword 
              ? intl.formatMessage({ id: 'ui-users.hide' }) 
              : intl.formatMessage({ id: 'ui-users.show' })
            }
          </Button>
        </Col>
      </React.Fragment>  
    );  
  }
}

PasswordControl.propTypes = {
  intl: PropTypes.object.isRequired,
};
  
export default PasswordControl;

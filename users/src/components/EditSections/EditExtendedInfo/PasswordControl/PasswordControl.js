import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Field } from 'react-final-form';
import {
  Button,
  TextField,
  Col,
} from '@folio/stripes/components';

import css from './PasswordControl.css';

class PasswordControl extends React.Component {
  static propTypes = {
    isRequired: PropTypes.bool.isRequired,
    toggleRequired: PropTypes.func.isRequired,
  };

  state = {
    showPassword: false,
  }

  togglePassword = () => {
    this.setState(({ showPassword }) => ({
      showPassword: !showPassword,
    }));
  }

  render() {
    const {
      isRequired,
      toggleRequired,
    } = this.props;

    return (
      <>
        <Col xs={12} md={3}>
          <Field
            component={TextField}
            label={<FormattedMessage id="ui-users.extended.folioPassword" />}
            name="creds.password"
            id="pw"
            autoComplete="new-password"
            type={this.state.showPassword ? 'text' : 'password'}
            fullWidth
            required={isRequired}
            onChange={toggleRequired}
          />
        </Col>
        <Col xs={12} md={1} className={css.togglePw}>
          <Button onClick={this.togglePassword} id="clickable-toggle-password">
            {this.state.showPassword
              ? <FormattedMessage id="ui-users.hide" />
              : <FormattedMessage id="ui-users.show" />
            }
          </Button>
        </Col>
      </>
    );
  }
}

export default PasswordControl;

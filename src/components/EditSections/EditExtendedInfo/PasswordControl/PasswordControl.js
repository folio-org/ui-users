import React from 'react';
import { FormattedMessage } from 'react-intl';
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
    return (
      <React.Fragment>
        <Col xs={12} md={3}>
          <Field
            component={TextField}
            label={<FormattedMessage id="ui-users.extended.folioPassword" />}
            name="creds.password"
            id="pw"
            autoComplete="new-password"
            type={this.state.showPassword ? 'text' : 'password'}
            fullWidth
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
      </React.Fragment>
    );
  }
}

export default PasswordControl;

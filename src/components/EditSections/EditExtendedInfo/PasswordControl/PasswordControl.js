import React from 'react';

import { Field } from 'redux-form';
import {
  injectIntl,
  intlShape,
} from 'react-intl';

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
          <Button onClick={this.togglePassword} id="clickable-toggle-password">
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
  intl: intlShape.isRequired,
};

export default injectIntl(PasswordControl);

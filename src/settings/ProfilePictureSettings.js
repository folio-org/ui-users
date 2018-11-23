import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import {
  Row,
  Col,
  Checkbox,
} from '@folio/stripes/components';
import { Field } from 'redux-form';
import { ConfigManager } from '@folio/stripes/smart-components';

class ProfilePictureSettings extends React.Component {
  static propTypes = {
    label: PropTypes.string,
    stripes: PropTypes.shape({
      connect: PropTypes.func.isRequired,
    }).isRequired,
  };

  constructor(props) {
    super(props);
    this.configManager = props.stripes.connect(ConfigManager);
  }

  // eslint-disable-next-line class-methods-use-this
  getInitialValues(settings) {
    const value = settings.length && settings[0].value === 'true';
    return { profile_pictures: value };
  }

  render() {
    const { label } = this.props;
    return (
      <this.configManager
        getInitialValues={this.getInitialValues}
        label={label}
        moduleName="USERS"
        configName="profile_pictures"
      >
        <Row>
          <Col xs={12}>
            <Field
              component={Checkbox}
              type="checkbox"
              id="profile_pictures"
              name="profile_pictures"
              label={<FormattedMessage id="ui-users.information.profile.label" />}
            />
          </Col>
        </Row>
      </this.configManager>
    );
  }
}

export default ProfilePictureSettings;

import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from '@folio/stripes-components/lib/LayoutGrid';
import Pane from '@folio/stripes-components/lib/Pane';
import Checkbox from '@folio/stripes-components/lib/Checkbox';

class ProfilePictureSettings extends React.Component {
  static propTypes = {
    resources: PropTypes.object.isRequired,
    mutator: PropTypes.shape({
      recordId: PropTypes.shape({
        replace: PropTypes.func,
      }),
      settings: PropTypes.shape({
        POST: PropTypes.func,
        PUT: PropTypes.func,
      }),
    }).isRequired,
  };

  static manifest = Object.freeze({
    recordId: {},
    settings: {
      type: 'okapi',
      records: 'configs',
      path: 'configurations/entries?query=(module=USERS and configName=profile_pictures)',
      POST: {
        path: 'configurations/entries',
      },
      PUT: {
        path: 'configurations/entries/%{recordId}',
      },
    },
  });

  constructor(props) {
    super(props);
    this.onChange = this.onChange.bind(this);
  }

  onChange(e) {
    const setting = this.props.resources.settings.records[0];

    if (setting) {
      if (setting.metadata) delete setting.metadata;
      this.props.mutator.recordId.replace(setting.id);
      setting.value = e.target.checked;
      this.props.mutator.settings.PUT(setting);
    } else {
      this.props.mutator.settings.POST(
        {
          module: 'USERS',
          configName: 'profile_pictures',
          value: e.target.checked,
        },
      );
    }
  }

  render() {
    const settings = (this.props.resources.settings || {}).records || [];
    const checked = !(settings.length === 0 || settings[0].value === 'false');

    return (
      <Pane defaultWidth="fill" fluidContentWidth paneTitle="Profile Pictures">
        <Row>
          <Col xs={12}>
            <Checkbox
              id="profilePictures"
              label="Display profile pictures"
              value={checked}
              checked={checked}
              onChange={this.onChange}
            />
          </Col>
        </Row>
      </Pane>
    );
  }

}

export default ProfilePictureSettings;

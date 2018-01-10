import React from 'react';
import PropTypes from 'prop-types';
import Callout from '@folio/stripes-components/lib/Callout';
import ProfilePictureForm from './ProfilePictureForm';

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
    label: PropTypes.string,
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
    this.onSave = this.onSave.bind(this);
  }

  onSave(data) {
    const setting = this.props.resources.settings.records[0];
    const value = data.profilePictures;
    let promise;

    if (setting) {
      if (setting.metadata) delete setting.metadata;
      this.props.mutator.recordId.replace(setting.id);
      setting.value = value;
      promise = this.props.mutator.settings.PUT(setting);
    } else {
      promise = this.props.mutator.settings.POST(
        {
          module: 'USERS',
          configName: 'profile_pictures',
          value,
        },
      );
    }

    promise.then(() => {
      this.callout.sendCallout({ message: 'Setting was successfully updated.' });
    });
  }

  render() {
    const settings = (this.props.resources.settings || {}).records || [];
    const profilePictures = settings.length && settings[0].value === 'true';

    return (
      <div style={{ width: '100%' }}>
        <ProfilePictureForm
          onSubmit={this.onSave}
          initialValues={{ profilePictures }}
          label={this.props.label}
        />
        <Callout ref={ref => (this.callout = ref)} />
      </div>
    );
  }

}

export default ProfilePictureSettings;

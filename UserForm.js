import React from 'react';
import PropTypes from 'prop-types';
import Paneset from '@folio/stripes-components/lib/Paneset';
import Pane from '@folio/stripes-components/lib/Pane';
import PaneMenu from '@folio/stripes-components/lib/PaneMenu';
import Button from '@folio/stripes-components/lib/Button';
import stripesForm from '@folio/stripes-form';

import UserInfo from './lib/EditSections/UserInfo';
import ExtendedInfo from './lib/EditSections/ExtendedInfo';
import ContactInfo from './lib/EditSections/ContactInfo';
import ProxySection from './lib/EditSections/ProxySection';

import css from './UserForm.css';

function validate(values) {
  const errors = {};

  if (!values.personal || !values.personal.lastName) {
    errors.personal = { lastName: 'Please fill this in to continue' };
  }

  if (!values.username) {
    errors.username = 'Please fill this in to continue';
  }

  if (!values.patronGroup) {
    errors.patronGroup = 'Please select a patron group';
  }

  if (!values.personal || !values.personal.preferredContactTypeId) {
    errors.personal = { preferredContactTypeId: 'Please select a preferred form of contact' };
  }
  return errors;
}

function asyncValidate(values, dispatch, props, blurredField) {
  if (blurredField === 'username' && values.username !== props.initialValues.username) {
    return new Promise((resolve, reject) => {
      const uv = props.parentMutator.uniquenessValidator;
      const query = `(username="${values.username}")`;
      uv.reset();
      uv.GET({ params: { query } }).then((users) => {
        if (users.length > 0) {
          reject({ username: 'This username has already been taken' });
        } else {
          resolve();
        }
      });
    });
  }

  return new Promise(resolve => resolve());
}

class UserForm extends React.Component {

  static propTypes = {
    handleSubmit: PropTypes.func.isRequired,
    parentMutator: PropTypes.shape({ // eslint-disable-line react/no-unused-prop-types
      uniquenessValidator: PropTypes.shape({
        reset: PropTypes.func.isRequired,
        GET: PropTypes.func.isRequired,
      }).isRequired,
    }),
    pristine: PropTypes.bool,
    submitting: PropTypes.bool,
    onCancel: PropTypes.func,
    initialValues: PropTypes.object,
  };

  getAddFirstMenu() {
    const { onCancel } = this.props;

    return (
      <PaneMenu>
        <button id="clickable-closenewuserdialog" onClick={onCancel} title="close" aria-label="Close New User Dialog">
          <span style={{ fontSize: '30px', color: '#999', lineHeight: '18px' }} >&times;</span>
        </button>
      </PaneMenu>
    );
  }

  getAddLastMenu() {
    const { pristine, submitting, handleSubmit } = this.props;

    return (
      <PaneMenu>
        <Button
          id="clickable-createnewuser"
          type="submit"
          title="Create New User"
          disabled={pristine || submitting}
          onClick={handleSubmit}>Create User</Button>
      </PaneMenu>
    );
  }

  getEditLastMenu() {
    const { pristine, submitting, handleSubmit } = this.props;

    return (
      <PaneMenu>
        <Button
          id="clickable-updateuser"
          type="submit"
          title="Update User"
          disabled={pristine || submitting}
          onClick={handleSubmit}>Update User</Button>
      </PaneMenu>
    );
  }

  render() {
    const { initialValues } = this.props;
    const firstMenu = this.getAddFirstMenu();
    const lastMenu = initialValues.id ? this.getEditLastMenu() : this.getAddLastMenu();
    const paneTitle = initialValues.id ? 'Edit User' : 'New User';

    return (
      <form className={css.UserFormRoot} id="form-user">
        <Paneset isRoot>
          <Pane defaultWidth="100%" firstMenu={firstMenu} lastMenu={lastMenu} paneTitle={paneTitle}>
            <UserInfo expanded={true} accordionId="userInfo" {...this.props} />
            <ExtendedInfo expanded={true} accordionId="extendedInfo" {...this.props} />
            <ContactInfo expanded={true} accordionId="contactInfo" {...this.props} />
            <ProxySection expanded={true} accordionId="proxyInfo" {...this.props} />
          </Pane>
        </Paneset>
      </form>
    );
  }
}

export default stripesForm({
  form: 'userForm',
  validate,
  asyncValidate,
  asyncBlurFields: ['username'],
  navigationCheck: true,
  enableReinitialize: true,
})(UserForm);

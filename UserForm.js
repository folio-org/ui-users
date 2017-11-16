import React from 'react';
import PropTypes from 'prop-types';
import Paneset from '@folio/stripes-components/lib/Paneset';
import Pane from '@folio/stripes-components/lib/Pane';
import PaneMenu from '@folio/stripes-components/lib/PaneMenu';
import Button from '@folio/stripes-components/lib/Button';
import Icon from '@folio/stripes-components/lib/Icon';
import stripesForm from '@folio/stripes-form';
import { ExpandAllButton } from '@folio/stripes-components/lib/Accordion';
import { Row, Col } from '@folio/stripes-components/lib/LayoutGrid';

import { UserInfoSection, ExtendedInfoSection, ContactInfoSection, ProxySection } from './lib/EditSections';
import { getFullName } from './util';

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

  constructor() {
    super();

    this.state = {
      sections: {
        extendedInfo: true,
        contactInfo: true,
        proxy: true,
      },
    };

    this.handleExpandAll = this.handleExpandAll.bind(this);
  }

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
          onClick={handleSubmit}
        >
          Create User
        </Button>
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
          onClick={handleSubmit}
        >
          Update User
        </Button>
      </PaneMenu>
    );
  }

  handleExpandAll(sections) {
    this.setState({ sections });
  }

  render() {
    const { initialValues } = this.props;
    const { sections } = this.state;

    const firstMenu = this.getAddFirstMenu();
    const lastMenu = initialValues.id ? this.getEditLastMenu() : this.getAddLastMenu();
    const paneTitle = initialValues.id ? <span><Icon icon="edit" iconRootClass={css.UserFormEditIcon} />Edit: <Icon icon="profile" iconRootClass={css.UserFormEditIcon} />{getFullName(initialValues)}</span> : 'Create User';

    return (
      <form className={css.UserFormRoot} id="form-user">
        <Paneset isRoot>
          <Pane defaultWidth="100%" firstMenu={firstMenu} lastMenu={lastMenu} paneTitle={paneTitle}>
            <Row end="xs">
              <Col xs>
                <ExpandAllButton accordionStatus={sections} onToggle={this.handleExpandAll} />
              </Col>
            </Row>
            <UserInfoSection {...this.props} />
            <ExtendedInfoSection expanded={sections.extendedInfo} accordionId="extendedInfo" {...this.props} />
            <ContactInfoSection expanded={sections.contactInfo} accordionId="contactInfo" {...this.props} />
            {initialValues.id && <ProxySection expanded={sections.proxy} accordionId="proxy" {...this.props} /> }
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

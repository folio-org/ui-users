import cloneDeep from 'lodash/cloneDeep';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';
import {
  Paneset,
  Pane,
  PaneMenu,
  IconButton,
  Button,
  ExpandAllButton,
  expandAllFunction,
  Row,
  Col,
  Headline,
  AccordionSet
} from '@folio/stripes/components';
import stripesForm from '@folio/stripes/form';

import {
  EditUserInfo,
  EditExtendedInfo,
  EditContactInfo,
  EditProxy,
  EditUserPerms,
  EditServicePoints,
} from './components/EditSections';

import { HasCommand } from './components/Commander';

import { getFullName } from './util';

import css from './UserForm.css';

function validate(values, props) {
  const errors = {};
  errors.personal = {};

  if (!values.personal || !values.personal.lastName) {
    errors.personal.lastName = <FormattedMessage id="ui-users.errors.missingRequiredField" />;
  }

  if (!values.username && values.creds && values.creds.password) {
    errors.username = <FormattedMessage id="ui-users.errors.missingRequiredUsername" />;
  }

  if (!props.initialValues.id && (!values.creds || !values.creds.password) && values.username) {
    errors.creds = { password: <FormattedMessage id="ui-users.errors.missingRequiredPassword" /> };
  }

  if (!values.patronGroup) {
    errors.patronGroup = <FormattedMessage id="ui-users.errors.missingRequiredPatronGroup" />;
  }

  if (!values.personal || !values.personal.preferredContactTypeId) {
    if (errors.personal) errors.personal.preferredContactTypeId = <FormattedMessage id="ui-users.errors.missingRequiredContactType" />;
    else errors.personal = { preferredContactTypeId: <FormattedMessage id="ui-users.errors.missingRequiredContactType" /> };
  }

  if (values.personal && values.personal.addresses) {
    errors.personal.addresses = [];
    values.personal.addresses.forEach((addr) => {
      const err = (!addr.addressType) ? { addressType: <FormattedMessage id="ui-users.errors.missingRequiredAddressType" /> } : {};
      errors.personal.addresses.push(err);
    });
  }

  if (values.servicePoints && values.preferredServicePoint === undefined) {
    errors.preferredServicePoint = <FormattedMessage id="ui-users.errors.missingRequiredPreferredServicePoint" />;
  }

  return errors;
}

function asyncValidate(values, dispatch, props, blurredField) {
  if (blurredField === 'username' && values.username !== props.initialValues.username) {
    return new Promise((resolve, reject) => {
      const uv = props.parentMutator.uniquenessValidator;
      const query = `(username=="${values.username}")`;
      uv.reset();
      return uv.GET({ params: { query } }).then((users) => {
        if (users.length > 0) {
          const error = { username: <FormattedMessage id="ui-users.errors.usernameUnavailable" /> };
          reject(error);
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
    stripes: PropTypes.shape({
      connect: PropTypes.func,
    }).isRequired,
    handleSubmit: PropTypes.func.isRequired,
    parentMutator: PropTypes.shape({ // eslint-disable-line react/no-unused-prop-types
      uniquenessValidator: PropTypes.shape({
        reset: PropTypes.func.isRequired,
        GET: PropTypes.func.isRequired,
      }).isRequired,
    }),
    parentResources: PropTypes.object,
    pristine: PropTypes.bool,
    submitting: PropTypes.bool,
    onCancel: PropTypes.func,
    initialValues: PropTypes.object,
  };

  constructor(props) {
    super();

    this.state = {
      sections: {
        editUserInfo: true,
        extendedInfo: true,
        contactInfo: true,
        proxy: false,
        permissions: false,
        servicePoints: false,
      },
    };

    this.handleExpandAll = this.handleExpandAll.bind(this);
    this.handleSectionToggle = this.handleSectionToggle.bind(this);
    this.toggleAllSections = this.toggleAllSections.bind(this);
    this.collapseAllSections = this.collapseAllSections.bind(this);
    this.expandAllSections = this.expandAllSections.bind(this);

    this.ignoreEnterKey = this.ignoreEnterKey.bind(this);
    this.executeSave = this.executeSave.bind(this);
    this.closeButton = React.createRef();

    this.keyboardCommands = [
      {
        name: 'save',
        handler: this.handleSaveKeyCommand
      },
      {
        name: 'ignoreEnter',
        handler: this.ignoreEnterKey,
        shortcut: 'enter'
      },
      {
        name: 'cancel',
        handler: props.onCancel,
        shortcut: 'esc'
      },
      {
        name: 'expandAllSections',
        handler: this.expandAllSections,
        shortcut: 'mod+['
      },
      {
        name: 'collapseAllSections',
        handler: this.collapseAllSections,
        shortcut: 'mod+]'
      }
    ];

    if (props.initialValues.id) {
      this.connectedEditUserPerms = props.stripes.connect(EditUserPerms);
    }
  }

  componentDidMount() {
    // focus first interactive thing so that shortcuts will work immediately.
    this.closeButton.current.focus();
  }

  getAddFirstMenu() {
    const label = <FormattedMessage id="ui-users.crud.closeNewUserDialog" />;
    return (
      <PaneMenu>
        <IconButton
          id="clickable-closenewuserdialog"
          onClick={this.props.onCancel}
          ref={this.closeButton}
          title={label}
          ariaLabel={label}
          icon="closeX"
        />
      </PaneMenu>
    );
  }

  getLastMenu(id, label) {
    const { pristine, submitting } = this.props;

    return (
      <PaneMenu>
        <Button
          id={id}
          type="submit"
          title={label}
          disabled={pristine || submitting}
          buttonStyle="primary paneHeaderNewButton"
          marginBottom0
        >
          {label}
        </Button>
      </PaneMenu>
    );
  }

  handleExpandAll(sections) {
    this.setState({ sections });
  }

  // eslint-disable-next-line class-methods-use-this
  ignoreEnterKey = (e) => {
    e.preventDefault();
  }

  handleSectionToggle({ id }) {
    this.setState((curState) => {
      const newState = cloneDeep(curState);
      newState.sections[id] = !newState.sections[id];
      return newState;
    });
  }

  toggleAllSections(expand) {
    this.setState((curState) => {
      const newSections = expandAllFunction(curState.sections, expand);
      return {
        sections: newSections
      };
    });
  }

  expandAllSections(e) {
    e.preventDefault();
    this.toggleAllSections(true);
  }

  collapseAllSections(e) {
    e.preventDefault();
    this.toggleAllSections(false);
  }

  handleSaveKeyCommand = (e) => {
    e.preventDefault();
    this.executeSave();
  }

  executeSave() {
    const { handleSubmit, onSubmit } = this.props;
    const submitter = handleSubmit(onSubmit);
    submitter();
  }

  render() {
    const {
      initialValues,
    } = this.props;
    const { sections } = this.state;
    const firstMenu = this.getAddFirstMenu();
    const paneTitle = initialValues.id
      ? getFullName(initialValues)
      : <FormattedMessage id="ui-users.crud.createUser" />;
    const lastMenu = initialValues.id
      ? this.getLastMenu('clickable-updateuser', <FormattedMessage id="ui-users.crud.updateUser" />)
      : this.getLastMenu('clickable-createnewuser', <FormattedMessage id="ui-users.crud.createUser" />);

    return (
      <HasCommand commands={this.keyboardCommands}>
        <form className={css.UserFormRoot} id="form-user" onSubmit={this.executeSave}>
          <Paneset isRoot>
            <Pane defaultWidth="100%" firstMenu={firstMenu} lastMenu={lastMenu} paneTitle={paneTitle} appIcon={{ app: 'users' }}>
              <div className={css.UserFormContent}>
                <Headline size="xx-large" tag="h2">{getFullName(initialValues)}</Headline>
                <Row end="xs">
                  <Col xs>
                    <ExpandAllButton accordionStatus={sections} onToggle={this.handleExpandAll} />
                  </Col>
                </Row>
                <AccordionSet>
                  <EditUserInfo
                    accordionId="editUserInfo"
                    expanded={sections.editUserInfo}
                    onToggle={this.handleSectionToggle}
                    {...this.props}
                  />
                  <EditExtendedInfo
                    accordionId="extendedInfo"
                    expanded={sections.extendedInfo}
                    onToggle={this.handleSectionToggle}
                    userId={initialValues.id}
                    userFirstName={initialValues.personal.firstName}
                    userEmail={initialValues.personal.email}
                  />
                  <EditContactInfo
                    accordionId="contactInfo"
                    expanded={sections.contactInfo}
                    onToggle={this.handleSectionToggle}
                    {...this.props}
                  />
                  {initialValues.id &&
                    <div>
                      <EditProxy
                        accordionId="proxy"
                        expanded={sections.proxy}
                        onToggle={this.handleSectionToggle}
                        {...this.props}
                      />
                      <this.connectedEditUserPerms
                        accordionId="permissions"
                        expanded={sections.permissions}
                        onToggle={this.handleSectionToggle}
                        {...this.props}
                      />
                      <EditServicePoints
                        accordionId="servicePoints"
                        expanded={sections.servicePoints}
                        onToggle={this.handleSectionToggle}
                        {...this.props}
                      />
                    </div>
                  }
                </AccordionSet>
              </div>
            </Pane>
          </Paneset>
        </form>
      </HasCommand>
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

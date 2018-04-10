import { cloneDeep } from 'lodash';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';
import Pane from '@folio/stripes-components/lib/Pane';
import Textfield from '@folio/stripes-components/lib/TextField';
import TextArea from '@folio/stripes-components/lib/TextArea';
import Button from '@folio/stripes-components/lib/Button';
import Paneset from '@folio/stripes-components/lib/Paneset';
import PaneMenu from '@folio/stripes-components/lib/PaneMenu';
import IfPermission from '@folio/stripes-components/lib/IfPermission';
import IconButton from '@folio/stripes-components/lib/IconButton';

// eslint-disable-next-line import/no-unresolved
import ConfirmationModal from '@folio/stripes-components/lib/structures/ConfirmationModal';
import { Row, Col } from '@folio/stripes-components/lib/LayoutGrid';
import { Accordion, ExpandAllButton } from '@folio/stripes-components/lib/Accordion';

import stripesForm from '@folio/stripes-form';
import { Field } from 'redux-form';

import ContainedPermissions from './ContainedPermissions';
import css from './PermissionSetForm.css';

class PermissionSetForm extends React.Component {
  static propTypes = {
    stripes: PropTypes.shape({
      hasPerm: PropTypes.func.isRequired,
      connect: PropTypes.func.isRequired,
      intl: PropTypes.object.isRequired,
    }).isRequired,
    initialValues: PropTypes.object,
    handleSubmit: PropTypes.func.isRequired,
    onSave: PropTypes.func,
    onCancel: PropTypes.func,
    onRemove: PropTypes.func,
    pristine: PropTypes.bool,
    submitting: PropTypes.bool,
  };

  constructor(props) {
    super(props);

    this.saveSet = this.saveSet.bind(this);
    this.beginDelete = this.beginDelete.bind(this);
    this.confirmDeleteSet = this.confirmDeleteSet.bind(this);
    this.handleExpandAll = this.handleExpandAll.bind(this);
    this.handleSectionToggle = this.handleSectionToggle.bind(this);
    this.containedPermissions = props.stripes.connect(ContainedPermissions);

    this.state = {
      confirmDelete: false,
      sections: {
        generalSection: true,
        permSection: true,
      },
    };
  }

  saveSet(data) {
    const permSet = Object.assign({}, data, {
      mutable: true,
      subPermissions: (data.subPermissions || []).map(p => p.permissionName),
    });

    this.props.onSave(permSet);
  }

  beginDelete() {
    this.setState({
      confirmDelete: true,
    });
  }

  confirmDeleteSet(confirmation) {
    const selectedSet = this.props.initialValues;
    if (confirmation) {
      this.props.onRemove(selectedSet);
    } else {
      this.setState({ confirmDelete: false });
    }
  }

  addFirstMenu() {
    return (
      <PaneMenu>
        <IconButton
          id="clickable-close-permission-set"
          onClick={this.props.onCancel}
          icon="closeX"
          title="close"
          aria-label={this.props.stripes.intl.formatMessage({ id: 'ui-users.permissions.closePermissionSetDialog' })}
        />
      </PaneMenu>
    );
  }

  saveLastMenu() {
    const { pristine, submitting, initialValues, stripes: { intl } } = this.props;
    const { confirmDelete } = this.state;
    const edit = initialValues && initialValues.id;
    const saveLabel = edit ? intl.formatMessage({ id: 'ui-users.saveAndClose' }) : intl.formatMessage({ id: 'ui-users.permissions.createPermissionSet' });

    return (
      <PaneMenu>
        {edit &&
          <IfPermission perm="perms.permissions.item.delete">
            <Button
              id="clickable-delete-set"
              title={intl.formatMessage({ id: 'ui-users.delete' })}
              buttonStyle="warning"
              marginBottom0
              onClick={this.beginDelete}
              disabled={confirmDelete}
            >{intl.formatMessage({ id: 'ui-users.delete' })}
            </Button>
          </IfPermission>
        }
        <Button
          id="clickable-save-permission-set"
          type="submit"
          title={intl.formatMessage({ id: 'ui-users.saveAndClose' })}
          buttonStyle="primary paneHeaderNewButton"
          marginBottom0
          disabled={(pristine || submitting)}
        >{saveLabel}
        </Button>
      </PaneMenu>
    );
  }

  handleSectionToggle({ id }) {
    this.setState((curState) => {
      const newState = cloneDeep(curState);
      newState.sections[id] = !newState.sections[id];
      return newState;
    });
  }

  handleExpandAll(sections) {
    this.setState((curState) => {
      const newState = cloneDeep(curState);
      newState.sections = sections;
      return newState;
    });
  }

  renderPaneTitle() {
    const { initialValues, stripes: { intl } } = this.props;
    const selectedSet = initialValues || {};
    const label = selectedSet.id ? `${intl.formatMessage({ id: 'ui-users.edit' })}: ${selectedSet.displayName}` : intl.formatMessage({ id: 'ui-users.permissions.newPermissionSet' });
    return (
      <div className={css.iconRoot}>
        <IconButton
          icon="edit"
          title={intl.formatMessage({ id: 'ui-users.permissions.editPermission' })}
          size="medium"
        />
        <div className={css.iconLabel}>{label}</div>
      </div>
    );
  }

  render() {
    const { stripes, handleSubmit, initialValues, stripes: { intl } } = this.props;
    const selectedSet = initialValues || {};
    const { confirmDelete, sections } = this.state;
    const disabled = !stripes.hasPerm('perms.permissions.item.put');

    const selectedName = selectedSet.displayName || intl.formatMessage({ id: 'ui-users.permissions.untitledPermissionSet' });
    const confirmationMessage = <FormattedMessage id="ui-users.permissions.deletePermissionSetMessage" values={{ name: <strong>{selectedName}</strong> }} />;

    return (
      <form id="form-permission-set" onSubmit={handleSubmit(this.saveSet)}>
        <Paneset isRoot>
          <Pane defaultWidth="100%" firstMenu={this.addFirstMenu()} lastMenu={this.saveLastMenu()} paneTitle={this.renderPaneTitle()}>
            <Row end="xs">
              <Col xs>
                <ExpandAllButton accordionStatus={sections} onToggle={this.handleExpandAll} />
              </Col>
            </Row>
            <Accordion
              open={sections.generalSection}
              id="generalSection"
              onToggle={this.handleSectionToggle}
              label={intl.formatMessage({ id: 'ui-users.permissions.generalInformation' })}
            >
              <Row>
                <Col xs={8}>
                  <section>
                    <Field label={`${intl.formatMessage({ id: 'ui-users.permissions.permissionSetName' })} *`} name="displayName" id="input-permission-title" component={Textfield} autoFocus required fullWidth rounded disabled={disabled} />
                    <Field label={intl.formatMessage({ id: 'ui-users.description' })} name="description" id="input-permission-description" component={TextArea} fullWidth rounded disabled={disabled} />
                  </section>
                </Col>
              </Row>
            </Accordion>
            <ConfirmationModal
              open={confirmDelete}
              heading={intl.formatMessage({ id: 'ui-users.permissions.deletePermissionSet' })}
              message={confirmationMessage}
              onConfirm={() => { this.confirmDeleteSet(true); }}
              onCancel={() => { this.confirmDeleteSet(false); }}
              confirmLabel={intl.formatMessage({ id: 'ui-users.delete' })}
            />

            <this.containedPermissions
              expanded={sections.permSection}
              onToggle={this.handleSectionToggle}
              accordionId="permSection"
              permToRead="perms.permissions.get"
              permToDelete="perms.permissions.item.put"
              permToModify="perms.permissions.item.put"
              {...this.props}
            />
          </Pane>
        </Paneset>
      </form>
    );
  }
}

export default stripesForm({
  form: 'permissionSetForm',
  navigationCheck: true,
  enableReinitialize: false,
})(PermissionSetForm);

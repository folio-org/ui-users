import { cloneDeep } from 'lodash';
import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import PropTypes from 'prop-types';
import {
  Paneset,
  Pane,
  PaneMenu,
  PaneHeaderIconButton,
  TextField,
  TextArea,
  Button,
  Accordion,
  ExpandAllButton,
  Row,
  Col,
  ConfirmationModal,
  Headline,
  PaneFooter,
} from '@folio/stripes/components';
import { IfPermission } from '@folio/stripes/core';
import { ViewMetaData } from '@folio/stripes/smart-components';

import stripesFinalForm from '@folio/stripes/final-form';
import { Field } from 'react-final-form';

import PermissionsAccordion from '../../components/PermissionsAccordion';
import {
  statusFilterConfig,
  permissionTypeFilterConfig,
} from '../../components/PermissionsAccordion/helpers/filtersConfig';

import styles from './PermissionSetForm.css';

class PermissionSetForm extends React.Component {
  static propTypes = {
    stripes: PropTypes.shape({
      hasPerm: PropTypes.func.isRequired,
      connect: PropTypes.func.isRequired,
    }).isRequired,
    initialValues: PropTypes.object,
    intl: PropTypes.object,
    handleSubmit: PropTypes.func.isRequired,
    onCancel: PropTypes.func,
    onRemove: PropTypes.func,
    pristine: PropTypes.bool,
    submitting: PropTypes.bool,
    form: PropTypes.object,
  };

  constructor(props) {
    super(props);

    this.beginDelete = this.beginDelete.bind(this);
    this.confirmDeleteSet = this.confirmDeleteSet.bind(this);
    this.handleExpandAll = this.handleExpandAll.bind(this);
    this.handleSectionToggle = this.handleSectionToggle.bind(this);
    this.cViewMetaData = props.stripes.connect(ViewMetaData);
    this.state = {
      confirmDelete: false,
      sections: {
        generalSection: true,
        permSection: true,
      },
    };
  }

  addFirstMenu() {
    return (
      <PaneMenu>
        <PaneHeaderIconButton
          id="clickable-close-permission-set"
          onClick={this.props.onCancel}
          icon="times"
          aria-label={this.props.intl.formatMessage({ id: 'ui-users.permissions.closePermissionSetDialog' })}
        />
      </PaneMenu>
    );
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

  handleExpandAll(sections) {
    this.setState((curState) => {
      const newState = cloneDeep(curState);
      newState.sections = sections;
      return newState;
    });
  }

  handleSectionToggle({ id }) {
    this.setState((curState) => {
      const newState = cloneDeep(curState);
      newState.sections[id] = !newState.sections[id];
      return newState;
    });
  }

  getFooter() {
    const {
      pristine,
      submitting,
      onCancel,
    } = this.props;

    const cancelButton = (
      <Button
        buttonStyle="default mega"
        id="clickable-close-permission-set"
        onClick={onCancel}
      >
        <FormattedMessage id="ui-users.cancel" />
      </Button>
    );
    const saveButton = (
      <Button
        id="clickable-save-permission-set"
        type="submit"
        buttonStyle="primary mega"
        marginBottom0
        disabled={(pristine || submitting)}
      >
        <FormattedMessage id="ui-users.saveAndClose" />
      </Button>
    );

    return (
      <PaneFooter
        renderStart={cancelButton}
        renderEnd={saveButton}
      />
    );
  }

  saveLastMenu() {
    const {
      initialValues,
    } = this.props;
    const { confirmDelete } = this.state;

    return initialValues?.id && (
      <PaneMenu>
        <IfPermission perm="perms.permissions.item.delete">
          <Button
            id="clickable-delete-set"
            buttonStyle="danger"
            onClick={this.beginDelete}
            disabled={confirmDelete}
            marginBottom0
          >
            <FormattedMessage id="ui-users.delete" />
          </Button>
        </IfPermission>
      </PaneMenu>
    );
  }

  renderPaneTitle() {
    const { initialValues } = this.props;
    const selectedSet = initialValues || {};

    if (selectedSet.id) {
      return (
        <FormattedMessage id="ui-users.edit">
          {(editLabel) => `${editLabel}: ${selectedSet.displayName}`}
        </FormattedMessage>
      );
    }

    return <FormattedMessage id="ui-users.permissions.newPermissionSet" />;
  }

  render() {
    const {
      stripes,
      initialValues,
      handleSubmit,
      form,
    } = this.props;

    const selectedSet = initialValues || {};
    const { confirmDelete, sections } = this.state;
    const disabled = !stripes.hasPerm('perms.permissions.item.put');
    const selectedName = selectedSet.displayName ||
      <FormattedMessage id="ui-users.permissions.untitledPermissionSet" />;

    const confirmationMessage = <FormattedMessage
      id="ui-users.permissions.deletePermissionSetMessage"
      values={{ name: <strong>{selectedName}</strong> }}
    />;

    const accordionLabel = (
      <Headline
        size="large"
        tag="h3"
      >
        <FormattedMessage id="ui-users.permissions.generalInformation" />
      </Headline>
    );

    return (
      <form
        id="form-permission-set"
        className={styles.permSetForm}
        onSubmit={handleSubmit}
      >
        <Paneset isRoot>
          <Pane
            defaultWidth="100%"
            firstMenu={this.addFirstMenu()}
            lastMenu={this.saveLastMenu()}
            paneTitle={this.renderPaneTitle()}
            footer={this.getFooter()}
          >
            <Row end="xs">
              <Col xs>
                <ExpandAllButton
                  accordionStatus={sections}
                  onToggle={this.handleExpandAll}
                />
              </Col>
            </Row>
            <Accordion
              open={sections.generalSection}
              id="generalSection"
              onToggle={this.handleSectionToggle}
              label={accordionLabel}
            >
              {selectedSet.metadata && selectedSet.metadata.createdDate &&
                <Row>
                  <Col xs={12}>
                    <this.cViewMetaData metadata={selectedSet.metadata} />
                  </Col>
                </Row>
              }
              <Row>
                <Col xs={8}>
                  <section>
                    <Field
                      label={<FormattedMessage id="ui-users.permissions.permissionSetName" />}
                      name="displayName"
                      id="input-permission-title"
                      component={TextField}
                      autoFocus
                      required
                      fullWidth
                      disabled={disabled}
                    />
                    <Field
                      label={<FormattedMessage id="ui-users.description" />}
                      name="description"
                      id="input-permission-description"
                      component={TextArea}
                      fullWidth
                      disabled={disabled}
                    />
                  </section>
                </Col>
              </Row>
            </Accordion>
            <ConfirmationModal
              id="deletepermissionset-confirmation"
              open={confirmDelete}
              heading={<FormattedMessage id="ui-users.permissions.deletePermissionSet" />}
              message={confirmationMessage}
              onConfirm={() => { this.confirmDeleteSet(true); }}
              onCancel={() => { this.confirmDeleteSet(false); }}
              confirmLabel={<FormattedMessage id="ui-users.delete" />}
            />
            <PermissionsAccordion
              filtersConfig={[
                permissionTypeFilterConfig,
                statusFilterConfig,
              ]}
              expanded={sections.permSection}
              visibleColumns={[
                'selected',
                'permissionName',
                'type',
                'status',
              ]}
              headlineContent={<FormattedMessage id="ui-users.permissions.assignedPermissions" />}
              onToggle={this.handleSectionToggle}
              accordionId="permSection"
              permToRead="perms.permissions.get"
              permToDelete="perms.permissions.item.put"
              permToModify="perms.permissions.item.put"
              formName="permissionSetForm"
              permissionsField="subPermissions"
              form={form}
            />
          </Pane>
        </Paneset>
      </form>
    );
  }
}

export default injectIntl(stripesFinalForm({
  navigationCheck: true,
  enableReinitialize: false,
})(PermissionSetForm));

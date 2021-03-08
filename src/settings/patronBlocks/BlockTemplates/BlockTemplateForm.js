import { cloneDeep } from 'lodash';
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, FormattedMessage } from 'react-intl';
import { Field } from 'react-final-form';
import stripesFinalForm from '@folio/stripes/final-form';
import {
  Accordion,
  AccordionSet,
  Button,
  Checkbox,
  Col,
  ConfirmationModal,
  ExpandAllButton,
  Headline,
  Label,
  Pane,
  PaneFooter,
  PaneHeaderIconButton,
  PaneMenu,
  Paneset,
  Row,
  TextArea,
  TextField,
} from '@folio/stripes/components';
import { IfPermission } from '@folio/stripes/core';
import { ViewMetaData } from '@folio/stripes/smart-components';

import css from './BlockTemplateForm.css';

function BlockTemplateForm(props) {
  const [sections, setSections] = useState({
    templateInformation: true,
    blockInformation: true,
  });
  const [confirmDelete, setConfirmDelete] = useState(false);
  const { handleSubmit, initialValues, onCancel, pristine, submitting } = props;

  const addFirstMenu = () => {
    return (
      <PaneMenu>
        <FormattedMessage id="ui-users.manualBlockTemplates.closeManualBlockDialog">
          {(ariaLabel) => (
            <PaneHeaderIconButton
              id="clickable-close-block-template"
              onClick={props.onCancel}
              icon="times"
              aria-label={ariaLabel}
            />
          )}
        </FormattedMessage>
      </PaneMenu>
    );
  };

  const beginDelete = () => {
    setConfirmDelete(true);
  };

  const confirmDeleteTemplate = (confirmation) => {
    const selectedTemplate = props.initialValues;
    if (confirmation) {
      props.onRemove(selectedTemplate);
    } else {
      setConfirmDelete(false);
    }
  };

  const handleExpandAll = (sects) => {
    setSections(sects);
  };

  const handleSectionToggle = ({ id }) => {
    const newSections = cloneDeep(sections);
    newSections[id] = !newSections[id];
    setSections(newSections);
  };

  const getFooter = () => {
    const cancelButton = (
      <Button
        buttonStyle="default mega"
        id="clickable-close-block-template"
        onClick={onCancel}
      >
        <FormattedMessage id="ui-users.cancel" />
      </Button>
    );
    const saveButton = (
      <Button
        id="clickable-save-block-template"
        type="submit"
        buttonStyle="primary mega"
        marginBottom0
        disabled={pristine || submitting}
      >
        <FormattedMessage id="ui-users.saveAndClose" />
      </Button>
    );

    return <PaneFooter renderStart={cancelButton} renderEnd={saveButton} />;
  };

  const saveLastMenu = () => {
    return (
      initialValues?.id && (
        <PaneMenu>
          <IfPermission perm="manual-block-templates.item.delete">
            <Button
              id="clickable-delete-block-template"
              buttonStyle="danger"
              onClick={beginDelete}
              disabled={confirmDelete}
              marginBottom0
            >
              <FormattedMessage id="ui-users.delete" />
            </Button>
          </IfPermission>
        </PaneMenu>
      )
    );
  };

  const renderPaneTitle = () => {
    const currentTemplate = initialValues || {};

    if (currentTemplate.id) {
      return (
        <FormattedMessage id="ui-users.edit">
          {(editLabel) => (
            <span data-test-block-template-edit>
              {`${editLabel}: ${currentTemplate.name}`}
            </span>
          )}
        </FormattedMessage>
      );
    }

    return (
      <FormattedMessage id="ui-users.manualBlockTemplates.newManualBlockTemplate" />
    );
  };

  const renderBlockActionCheckBoxes = () => {
    return (
      <div id="block-template-actions">
        <Row>
          <Col xs={6}>
            <Field
              label={
                <FormattedMessage id="ui-users.blocks.columns.borrowing" />
              }
              name="blockTemplate.borrowing"
              id="input-template-block-action-borrowing"
              component={Checkbox}
              type="checkbox"
              fullWidth
            />
          </Col>
        </Row>
        <Row>
          <Col xs={6}>
            <Field
              label={<FormattedMessage id="ui-users.blocks.columns.renewals" />}
              name="blockTemplate.renewals"
              id="input-template-block-action-renewals"
              component={Checkbox}
              type="checkbox"
              fullWidth
            />
          </Col>
        </Row>
        <Row>
          <Col xs={6}>
            <Field
              label={<FormattedMessage id="ui-users.blocks.columns.requests" />}
              name="blockTemplate.requests"
              id="input-template-block-action-requests"
              component={Checkbox}
              type="checkbox"
              fullWidth
            />
          </Col>
        </Row>
      </div>
    );
  };

  const selectedName = initialValues?.name || (
    <FormattedMessage id="ui-users.manualBlockTemplate.untitledTemplate" />
  );

  const confirmationMessage = (
    <FormattedMessage
      id="ui-users.manualBlockTemplate.deleteTemplateMessage"
      values={{ name: <strong>{selectedName}</strong> }}
    />
  );

  return (
    <form
      id="form-block-templates"
      className={css.BlockTemplateFormRoot}
      onSubmit={handleSubmit}
    >
      <Paneset isRoot>
        <Pane
          defaultWidth="100%"
          firstMenu={addFirstMenu()}
          lastMenu={saveLastMenu()}
          paneTitle={renderPaneTitle()}
          footer={getFooter()}
          centerContent
        >
          <AccordionSet id="block-template-form-accordion-set">
            <Row end="xs">
              <Col xs>
                <ExpandAllButton
                  accordionStatus={sections}
                  onToggle={handleExpandAll}
                />
              </Col>
            </Row>
            <Accordion
              open={sections.templateInformation}
              id="templateInformation"
              onToggle={handleSectionToggle}
              label={
                <Headline size="large" tag="h3">
                  <FormattedMessage id="ui-users.manualBlockTemplates.templateInformation" />
                </Headline>
              }
            >
              {initialValues?.metadata?.createdDate && (
                <Row>
                  <Col xs={12}>
                    <ViewMetaData metadata={initialValues.metadata} />
                  </Col>
                </Row>
              )}
              <Row>
                <Col xs={12} md={3}>
                  <Field
                    label={
                      <FormattedMessage id="ui-users.manualBlockTemplates.templateName" />
                    }
                    name="name"
                    id="input-template-name"
                    component={TextField}
                    autoFocus
                    required
                    fullWidth
                  />
                </Col>
                <Col xs={12} md={3}>
                  <Field
                    label={
                      <FormattedMessage id="ui-users.manualBlockTemplates.blockCode" />
                    }
                    name="code"
                    id="input-template-code"
                    component={TextField}
                    fullWidth
                  />
                </Col>
                <Col xs={12} md={6}>
                  <Field
                    label={<FormattedMessage id="ui-users.description" />}
                    name="desc"
                    id="input-template-desc"
                    component={TextArea}
                    fullWidth
                  />
                </Col>
              </Row>
            </Accordion>
            <Accordion
              open={sections.blockInformation}
              id="blockInformation"
              onToggle={handleSectionToggle}
              label={
                <Headline size="large" tag="h3">
                  <FormattedMessage id="ui-users.manualBlockTemplates.blockInformation" />
                </Headline>
              }
            >
              <Row>
                <Col xs={12}>
                  <Field
                    label={
                      <FormattedMessage id="ui-users.blocks.columns.desc" />
                    }
                    name="blockTemplate.desc"
                    id="input-template-block-desc"
                    component={TextArea}
                    autoFocus
                    fullWidth
                  />
                </Col>
              </Row>
              <Row>
                <Col xs={12}>
                  <Field
                    label={
                      <FormattedMessage id="ui-users.blocks.form.label.staff" />
                    }
                    id="input-template-block-staff-only"
                    name="blockTemplate.staffOnlyInfo"
                    component={TextArea}
                    fullWidth
                    disabled
                    placeholder={props.intl.formatMessage({
                      id: 'ui-users.field.disabled',
                    })}
                  />
                </Col>
              </Row>
              <Row>
                <Col xs={12}>
                  <Field
                    label={
                      <FormattedMessage id="ui-users.blocks.form.label.message" />
                    }
                    name="blockTemplate.patronMessage"
                    id="input-template-block-message-patron"
                    component={TextArea}
                    fullWidth
                  />
                </Col>
              </Row>
              <Row>
                <Col xs={6} md={3}>
                  <Field
                    label={
                      <FormattedMessage id="ui-users.information.expirationDate" />
                    }
                    id="input-template-desc"
                    name="blockTemplate.expirationDate"
                    component={TextField}
                    fullWidth
                    disabled
                    placeholder={props.intl.formatMessage({
                      id: 'ui-users.field.disabled',
                    })}
                  />
                </Col>
              </Row>
              <Row>
                <Col xs={6}>
                  <Label htmlFor="block-template-actions">
                    <FormattedMessage id="ui-users.manualBlockTemplates.blockActions" />
                  </Label>
                  {renderBlockActionCheckBoxes()}
                </Col>
              </Row>
            </Accordion>
          </AccordionSet>
          <ConfirmationModal
            id="delete-block-template-confirmation"
            open={confirmDelete}
            heading={
              <FormattedMessage id="ui-users.manualBlockTemplate.deleteTemplate" />
            }
            message={confirmationMessage}
            onConfirm={() => {
              confirmDeleteTemplate(true);
            }}
            onCancel={() => {
              confirmDeleteTemplate(false);
            }}
            confirmLabel={<FormattedMessage id="ui-users.delete" />}
          />
        </Pane>
      </Paneset>
    </form>
  );
}

BlockTemplateForm.propTypes = {
  initialValues: PropTypes.object,
  intl: PropTypes.object.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func,
  onRemove: PropTypes.func,
  pristine: PropTypes.bool,
  submitting: PropTypes.bool,
};

export default injectIntl(
  stripesFinalForm({
    navigationCheck: true,
    enableReinitialize: false,
  })(BlockTemplateForm)
);

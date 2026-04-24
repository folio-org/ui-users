import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Field, useFormState } from 'react-final-form';
import { FormattedMessage, useIntl } from 'react-intl';
import {
  Button,
  Checkbox,
  Col,
  InfoPopover,
  Label,
  MultiSelection,
  Pane,
  PaneFooter,
  RadioButton,
  RadioButtonGroup,
  Row,
  Select,
  TextField,
  Tooltip,
} from '@folio/stripes/components';
import stripesFinalForm from '@folio/stripes/final-form';
import isEqual from 'lodash/isEqual';

import { RETENTION_MODES, DURATION_UNITS } from './constants';
import { validateForm, renderBold } from './utils';
import css from './VersionHistoryForm.css';

const VersionHistoryForm = ({ handleSubmit, pristine, submitting, fieldOptions }) => {
  const { formatMessage } = useIntl();
  const { values } = useFormState({ subscription: { values: true } });
  const retentionMode = values?.retentionMode;

  const isNever = retentionMode === RETENTION_MODES.NEVER;
  const isDuration = retentionMode === RETENTION_MODES.DURATION;

  const durationUnitsOptions = useMemo(() => DURATION_UNITS.map(({ value, labelId }) => ({
    value,
    label: formatMessage({ id: labelId }),
  })), [formatMessage]);

  const disabledTooltipText = (
    <FormattedMessage
      id="ui-users.settings.versionHistory.disabledTooltip"
      values={{ b: renderBold }}
    />
  );

  const renderFooter = () => (
    <PaneFooter
      renderEnd={(
        <Button
          type="submit"
          buttonStyle="primary paneHeaderNewButton"
          disabled={pristine || submitting}
          marginBottom0
        >
          <FormattedMessage id="stripes-core.button.save" />
        </Button>
      )}
    />
  );

  const renderMaybeDisabledField = (children, disabled) => {
    if (!disabled) return children;

    return (
      <Tooltip id="version-history-disabled-tooltip" text={disabledTooltipText}>
        {({ ref, ariaIds }) => (
          <div ref={ref} aria-describedby={ariaIds.text}>
            {children}
          </div>
        )}
      </Tooltip>
    );
  };

  const fieldOptionsMap = useMemo(
    () => Object.fromEntries(fieldOptions.map(opt => [opt.value, opt])),
    [fieldOptions],
  );

  const anonymizeCheckbox = (
    <Field
      name="anonymizeSource"
      component={Checkbox}
      type="checkbox"
      label={<FormattedMessage id="ui-users.settings.versionHistory.anonymizeSource" />}
      disabled={isNever}
    />
  );

  const excludedFieldsSelect = (
    <Field
      name="excludedFields"
      component={MultiSelection}
      label={<FormattedMessage id="ui-users.settings.versionHistory.excludedFields" />}
      dataOptions={fieldOptions}
      disabled={isNever}
      placeholder={formatMessage({ id: 'ui-users.settings.versionHistory.excludedFields.placeholder' })}
      itemToString={(option) => option?.label ?? option ?? ''}
      format={(value) => (value || []).map(v => fieldOptionsMap[v] || { value: v, label: v })}
      parse={(items) => (items || []).map(item => item?.value ?? item)}
      isEqual={isEqual}
    />
  );

  return (
    <form onSubmit={handleSubmit} className={css.formWrapper}>
      <Pane
        defaultWidth="fill"
        paneTitle={<FormattedMessage id="ui-users.settings.versionHistory" />}
        footer={renderFooter()}
      >
        <Label>
          <FormattedMessage id="ui-users.settings.versionHistory.createVersionHistory" />
        </Label>

        <RadioButtonGroup>
          <Field
            name="retentionMode"
            component={RadioButton}
            type="radio"
            value={RETENTION_MODES.NEVER}
            label={<FormattedMessage id="ui-users.settings.versionHistory.never" />}
            id="retention-mode-never"
          />
          <Field
            name="retentionMode"
            component={RadioButton}
            type="radio"
            value={RETENTION_MODES.INDEFINITELY}
            label={<FormattedMessage id="ui-users.settings.versionHistory.retainIndefinitely" />}
            id="retention-mode-indefinitely"
          />
          <Field
            name="retentionMode"
            component={RadioButton}
            type="radio"
            value={RETENTION_MODES.DURATION}
            label={(
              <>
                <FormattedMessage id="ui-users.settings.versionHistory.retainForDuration" />
                <InfoPopover
                  iconSize="medium"
                  content={(
                    <FormattedMessage
                      id="ui-users.settings.versionHistory.retainForDuration.info"
                      values={{ b: renderBold }}
                    />
                  )}
                />
              </>
            )}
            id="retention-mode-duration"
          />
        </RadioButtonGroup>

        <div className={css.indentedSection}>
          <Row>
            <Col xs={2} md={1}>
              <Field
                name="durationLength"
                component={TextField}
                type="number"
                label={<FormattedMessage id="ui-users.settings.versionHistory.duration.length" />}
                disabled={!isDuration}
                required={isDuration}
              />
            </Col>
            <Col xs={4} md={2}>
              <Field
                name="durationUnit"
                component={Select}
                dataOptions={durationUnitsOptions}
                label={<FormattedMessage id="ui-users.settings.versionHistory.duration.unit" />}
                disabled={!isDuration}
                required={isDuration}
                placeholder={formatMessage({ id: 'ui-users.settings.versionHistory.duration.unit.placeholder' })}
              />
            </Col>
          </Row>
        </div>

        <div className={css.anonymizeWrapper}>
          {renderMaybeDisabledField(anonymizeCheckbox, isNever)}
        </div>

        {renderMaybeDisabledField(excludedFieldsSelect, isNever)}
      </Pane>
    </form>
  );
};

VersionHistoryForm.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  pristine: PropTypes.bool.isRequired,
  submitting: PropTypes.bool.isRequired,
  fieldOptions: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.string,
    label: PropTypes.string,
  })).isRequired,
};

export default stripesFinalForm({
  navigationCheck: true,
  validate: validateForm,
  enableReinitialize: true,
  initialValuesEqual: isEqual,
})(VersionHistoryForm);

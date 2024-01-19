import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  FormattedMessage,
} from 'react-intl';
import { get } from 'lodash';

import {
  Button,
  Col,
  KeyValue,
  Modal,
  ModalFooter,
  Row,
  TextArea,
  TextField,
} from '@folio/stripes/components';

import {
  getPatronName,
} from '../../util';

import {
  ACTUAL_COST_TYPES,
  ACTUAL_COST_RECORD_FIELD_NAME,
  ACTUAL_COST_RECORD_FIELD_PATH,
  DEFAULT_VALUE,
  ACTUAL_COST_MODAL_DEFAULT,
  ACTUAL_COST_DEFAULT,
  ACTUAL_COST_PROP_TYPES,
} from '../../../../../constants';
import { formatCurrencyAmount } from "../../../../../../../components/util";

const actualCostToBillField = 'actualCostToBill';
const BILLED_AMOUNT_MAX = 9999.99;
const BILLED_AMOUNT_MIN = 0.01;

const ActualCostModal = ({
  actualCostModal,
  setActualCostModal,
  setActualCostConfirmModal,
  actualCost,
  setActualCost,
}) => {
  const {
    isOpen,
  } = actualCostModal;
  const {
    type,
    actualCostRecord,
    additionalInfo: {
      actualCostToBill,
      additionalInformationForStaff,
      additionalInformationForPatron,
    },
  } = actualCost;
  const patronName = getPatronName(actualCostRecord);
  const feeFineOwner = get(actualCostRecord, ACTUAL_COST_RECORD_FIELD_PATH[ACTUAL_COST_RECORD_FIELD_NAME.FEE_FINE_OWNER], DEFAULT_VALUE);
  const feeFineType = get(actualCostRecord, ACTUAL_COST_RECORD_FIELD_PATH[ACTUAL_COST_RECORD_FIELD_NAME.FEE_FINE_TYPE], DEFAULT_VALUE);
  const [isBillAmountTouched, setBillAmountTouched] = useState(false);
  const isAmountInvalid = !Number(actualCostToBill) || Number(actualCostToBill) < BILLED_AMOUNT_MIN || Number(actualCostToBill) > BILLED_AMOUNT_MAX;
  const isBillType = type === ACTUAL_COST_TYPES.BILL;
  const billAmountError = isBillAmountTouched && isAmountInvalid
    ? <FormattedMessage id="ui-users.lostItems.feeFineAmount.error" />
    : null;
  const setTouched = () => {
    if (!isBillAmountTouched) {
      setBillAmountTouched(true);
    }
  };
  const onClose = () => {
    setActualCostModal(ACTUAL_COST_MODAL_DEFAULT);
    setActualCost(ACTUAL_COST_DEFAULT);
    setBillAmountTouched(false);
  };
  const onContinue = () => {
    setActualCostModal(ACTUAL_COST_MODAL_DEFAULT);
    setActualCostConfirmModal({
      isOpen: true,
    });
    setBillAmountTouched(false);
  };
  const isContinueButtonDisabled = isAmountInvalid && isBillType;
  const renderFooter = (
    <ModalFooter>
      <Button
        id="continueActualCost"
        data-testid="continueActualCost"
        buttonStyle="primary"
        disabled={isContinueButtonDisabled}
        onClick={onContinue}
      >
        <FormattedMessage id="ui-users.lostItems.modal.button.continue" />
      </Button>
      <Button
        id="cancelActualCost"
        data-testid="cancelActualCost"
        onClick={onClose}
      >
        <FormattedMessage id="ui-users.lostItems.modal.button.cancel" />
      </Button>
    </ModalFooter>
  );
  const onSetAdditionalInfo = (field, value) => {
    if (field === actualCostToBillField) {
      setTouched();
    }
    setActualCost({
      ...actualCost,
      additionalInfo: {
        ...actualCost.additionalInfo,
        [field]: value,
      },
    });
  };
  const onBlurAmount = () => {
    setTouched();
    setActualCost({
      ...actualCost,
      additionalInfo: {
        ...actualCost.additionalInfo,
        actualCostToBill: formatCurrencyAmount(actualCost.additionalInfo.actualCostToBill),
      },
    });
  };
  const getTitle = () => (
    isBillType ?
      <FormattedMessage
        id="ui-users.lostItems.modal.bill.title"
        values={{ patronName }}
      /> :
      <FormattedMessage
        id="ui-users.lostItems.modal.doNotBill.title"
        values={{ patronName }}
      />
  );

  return (
    <Modal
      id="actualCost"
      data-testid="actualCost"
      label={getTitle()}
      dismissible
      open={isOpen}
      onClose={onClose}
      footer={renderFooter}
    >
      <Row>
        <Col xs={4}>
          <KeyValue
            label={<FormattedMessage id="ui-users.lostItems.modal.feeFineOwner" />}
            value={feeFineOwner}
          />
        </Col>
        <Col xs={4}>
          <KeyValue
            label={<FormattedMessage id="ui-users.lostItems.modal.feeFineType" />}
            value={feeFineType}
          />
        </Col>
        <Col xs={4}>
          { isBillType &&
            <TextField
              label={<FormattedMessage id="ui-users.lostItems.modal.actualCostToBill" />}
              required
              value={actualCostToBill}
              onChange={(e) => onSetAdditionalInfo(actualCostToBillField, e.target.value)}
              onBlur={onBlurAmount}
              error={billAmountError}
            />
          }
          { type === ACTUAL_COST_TYPES.DO_NOT_BILL &&
            <KeyValue
              label={<FormattedMessage id="ui-users.lostItems.modal.actualCostToBill" />}
              value="0.00"
            />
          }
        </Col>
      </Row>
      <Row>
        <Col xs={12}>
          <TextArea
            label={<FormattedMessage id="ui-users.lostItems.modal.additionalInformationForStaff" />}
            value={additionalInformationForStaff}
            onChange={(e) => onSetAdditionalInfo('additionalInformationForStaff', e.target.value)}
          />
        </Col>
      </Row>
      { isBillType &&
        <Row>
          <Col xs={12}>
            <TextArea
              label={<FormattedMessage id="ui-users.lostItems.modal.additionalInformationForPatron" />}
              value={additionalInformationForPatron}
              onChange={(e) => onSetAdditionalInfo('additionalInformationForPatron', e.target.value)}
            />
          </Col>
        </Row>
      }
    </Modal>
  );
};

ActualCostModal.propTypes = {
  actualCostModal: PropTypes.shape({
    isOpen: PropTypes.bool.isRequired,
  }),
  setActualCostModal: PropTypes.func.isRequired,
  setActualCostConfirmModal: PropTypes.func.isRequired,
  actualCost: ACTUAL_COST_PROP_TYPES,
  setActualCost: PropTypes.func.isRequired,
};

export default ActualCostModal;

import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { get } from 'lodash';

import {
  Button,
  Col,
  KeyValue,
  Modal,
  ModalFooter,
  Row,
} from '@folio/stripes/components';

import { getPatronName } from '../../util';

import {
  ACTUAL_COST_CONFIRM_MODAL_DEFAULT,
  ACTUAL_COST_DEFAULT,
  ACTUAL_COST_RECORD_FIELD_NAME,
  ACTUAL_COST_RECORD_FIELD_PATH,
  ACTUAL_COST_TYPES,
  ACTUAL_COST_PROP_TYPES,
  DEFAULT_VALUE,
} from '../../../../../constants';

import css from './ActualCostConfirmModal.css';

const ActualCostConfirmModal = ({
  setActualCostModal,
  actualCostConfirmModal,
  setActualCostConfirmModal,
  actualCost,
  setActualCost,
}) => {
  const {
    isOpen,
  } = actualCostConfirmModal;
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
  const instanceTitle = get(actualCostRecord, ACTUAL_COST_RECORD_FIELD_PATH[ACTUAL_COST_RECORD_FIELD_NAME.INSTANCE_TITLE], DEFAULT_VALUE);
  const materialType = get(actualCostRecord, ACTUAL_COST_RECORD_FIELD_PATH[ACTUAL_COST_RECORD_FIELD_NAME.MATERIAL_TYPE], DEFAULT_VALUE);
  const onKeepEditing = () => {
    setActualCostConfirmModal(ACTUAL_COST_CONFIRM_MODAL_DEFAULT);
    setActualCostModal({
      isOpen: true,
    });
  };
  const onConfirm = () => {
    setActualCostConfirmModal(ACTUAL_COST_CONFIRM_MODAL_DEFAULT);
    setActualCost(ACTUAL_COST_DEFAULT);
  };
  const renderFooter = (
    <ModalFooter>
      <Button
        id="continueActualCost"
        data-testid="continueActualCost"
        buttonStyle="primary"
        onClick={onConfirm}
      >
        <FormattedMessage id="ui-users.lostItems.modal.button.confirm" />
      </Button>
      <Button
        id="cancelActualCost"
        data-testid="cancelActualCost"
        onClick={onKeepEditing}
      >
        <FormattedMessage id="ui-users.lostItems.modal.button.keepEditing" />
      </Button>
    </ModalFooter>
  );
  const getTitle = () => (
    type === ACTUAL_COST_TYPES.BILL ?
      <FormattedMessage
        id="ui-users.lostItems.modal.bill.confirm.title"
        values={{ patronName }}
      /> :
      <FormattedMessage
        id="ui-users.lostItems.modal.doNotBill.confirm.title"
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
      onClose={onKeepEditing}
      footer={renderFooter}
    >
      <Row>
        <Col xs={12}>
          <Row>
            <Col xs={12}>
              <p className={css.breakLongText}>
                { type === ACTUAL_COST_TYPES.BILL &&
                  <FormattedMessage
                    id="ui-users.lostItems.modal.bill.confirm.text"
                    values={{
                      actualCostToBill,
                      patronName,
                      instanceTitle,
                      materialType,
                    }}
                  />
                }
                { type === ACTUAL_COST_TYPES.DO_NOT_BILL &&
                  <FormattedMessage
                    id="ui-users.lostItems.modal.doNotBill.confirm.text"
                    values={{
                      patronName,
                      instanceTitle,
                      materialType,
                    }}
                  />
                }
              </p>
            </Col>
          </Row>
        </Col>
      </Row>
      <Row>
        <Col xs={12}>
          <br />
          <KeyValue
            label={<FormattedMessage id="ui-users.lostItems.modal.additionalInformationForStaff" />}
            value={additionalInformationForStaff}
          />
        </Col>
      </Row>
      { type === ACTUAL_COST_TYPES.BILL &&
        <Row>
          <Col xs={12}>
            <br />
            <KeyValue
              label={<FormattedMessage id="ui-users.lostItems.modal.additionalInformationForPatron" />}
              value={additionalInformationForPatron}
            />
          </Col>
        </Row>
      }
    </Modal>
  );
};

ActualCostConfirmModal.propTypes = {
  setActualCostModal: PropTypes.func.isRequired,
  actualCostConfirmModal: PropTypes.shape({
    isOpen: PropTypes.bool.isRequired,
  }),
  setActualCostConfirmModal: PropTypes.func.isRequired,
  actualCost: ACTUAL_COST_PROP_TYPES,
  setActualCost: PropTypes.func.isRequired,
};

export default ActualCostConfirmModal;

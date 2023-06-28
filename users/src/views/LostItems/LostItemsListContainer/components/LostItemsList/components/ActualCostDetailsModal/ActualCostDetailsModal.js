import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { get } from 'lodash';

import {
  Button,
  Col,
  Row,
  KeyValue,
  Modal,
  ModalFooter,
} from '@folio/stripes/components';

import { getPatronName } from '../../util';
import {
  ACTUAL_COST_DEFAULT,
  ACTUAL_COST_RECORD_FIELD_NAME,
  ACTUAL_COST_RECORD_FIELD_PATH,
  ACTUAL_COST_PROP_TYPES,
  DEFAULT_VALUE,
  ACTUAL_COST_DETAILS_MODAL_DEFAULT,
  LOST_ITEM_STATUSES,
} from '../../../../../constants';

export const getActualCostToBillViewValue = (value = 0) => (
  value.toFixed(2)
);

const ActualCostDetailsModal = ({
  actualCostDetailsModal: {
    isOpen,
  },
  actualCost: {
    actualCostRecord,
    additionalInfo: {
      actualCostToBill,
      additionalInformationForStaff,
      additionalInformationForPatron,
    },
  },
  setActualCost,
  setActualCostDetailsModal,
}) => {
  const patronName = getPatronName(actualCostRecord);
  const instanceTitle = get(actualCostRecord, ACTUAL_COST_RECORD_FIELD_PATH[ACTUAL_COST_RECORD_FIELD_NAME.INSTANCE_TITLE], DEFAULT_VALUE);
  const materialType = get(actualCostRecord, ACTUAL_COST_RECORD_FIELD_PATH[ACTUAL_COST_RECORD_FIELD_NAME.MATERIAL_TYPE], DEFAULT_VALUE);
  const onClose = () => {
    setActualCostDetailsModal(ACTUAL_COST_DETAILS_MODAL_DEFAULT);
    setActualCost(ACTUAL_COST_DEFAULT);
  };
  const footer = (
    <ModalFooter>
      <Button
        id="closeActualCostDetails"
        data-testid="closeActualCostDetails"
        buttonStyle="primary"
        onClick={onClose}
      >
        <FormattedMessage id="ui-users.lostItems.modal.button.close" />
      </Button>
    </ModalFooter>
  );

  return (
    <Modal
      id="actualCostDetails"
      data-testid="actualCostDetails"
      label={<FormattedMessage id="ui-users.lostItems.list.columnName.action.actualCostDetails" />}
      dismissible
      open={isOpen}
      onClose={onClose}
      footer={footer}
    >
      <Row>
        <Col xs={12}>
          {
            actualCostRecord.status === LOST_ITEM_STATUSES.BILLED
              ? <FormattedMessage
                  id="ui-users.lostItems.modal.summaryMessageCharged"
                  values={{
                    actualCostToBill: getActualCostToBillViewValue(actualCostToBill),
                    patronName,
                    instanceTitle,
                    materialType,
                  }}
              />
              : <FormattedMessage
                  id="ui-users.lostItems.modal.summaryMessageNotCharged"
                  values={{
                    patronName,
                    instanceTitle,
                    materialType,
                  }}
              />
          }
        </Col>
      </Row>
      <br />
      <Row>
        <Col xs={12}>
          <KeyValue
            label={<FormattedMessage id="ui-users.lostItems.modal.additionalInformationForStaff" />}
            value={additionalInformationForStaff}
          />
        </Col>
      </Row>
      <Row>
        <Col xs={12}>
          <KeyValue
            label={<FormattedMessage id="ui-users.lostItems.modal.additionalInformationForPatron" />}
            value={additionalInformationForPatron}
          />
        </Col>
      </Row>
    </Modal>
  );
};

ActualCostDetailsModal.propTypes = {
  setActualCostDetailsModal: PropTypes.func.isRequired,
  actualCostDetailsModal: PropTypes.shape({
    isOpen: PropTypes.bool.isRequired,
  }),
  actualCost: ACTUAL_COST_PROP_TYPES,
  setActualCost: PropTypes.func.isRequired,
};

export default ActualCostDetailsModal;

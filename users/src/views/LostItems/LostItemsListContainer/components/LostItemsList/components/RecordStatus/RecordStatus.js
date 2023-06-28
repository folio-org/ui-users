import {
  FormattedMessage,
} from 'react-intl';
import PropTypes from 'prop-types';
import { get } from 'lodash';

import {
  ACTUAL_COST_RECORD_FIELD_NAME,
  ACTUAL_COST_RECORD_FIELD_PATH,
  LOST_ITEM_STATUS_TRANSLATIONS_KEYS,
  LOST_ITEM_STATUSES,
} from '../../../../../constants';
import { getRecordStatus } from '../../util';
import DateTimeFormatter from '../DateTimeFormatter';

export const getBilledAmount = (recordId, billedRecords) => billedRecords.find(record => record.id === recordId)?.billedAmount;

const RecordStatus = ({
  actualCostRecord,
  billedRecords,
  cancelledRecords,
}) => {
  const status = get(actualCostRecord, ACTUAL_COST_RECORD_FIELD_PATH[ACTUAL_COST_RECORD_FIELD_NAME.STATUS]);
  const {
    isBilled,
    isCancelled,
  } = getRecordStatus(actualCostRecord.id, billedRecords, cancelledRecords);

  if (status === LOST_ITEM_STATUSES.BILLED || isBilled) {
    const amount = isBilled ?
      getBilledAmount(actualCostRecord.id, billedRecords) :
      get(actualCostRecord, ACTUAL_COST_RECORD_FIELD_PATH[ACTUAL_COST_RECORD_FIELD_NAME.BILLED_AMOUNT]).toFixed(2);

    return (
      <FormattedMessage
        id={LOST_ITEM_STATUS_TRANSLATIONS_KEYS[LOST_ITEM_STATUSES.BILLED]}
        values={{ amount }}
      />
    );
  }

  if (status === LOST_ITEM_STATUSES.CANCELLED || isCancelled) {
    return (
      <FormattedMessage id={LOST_ITEM_STATUS_TRANSLATIONS_KEYS[LOST_ITEM_STATUSES.CANCELLED]} />
    );
  }

  if (status === LOST_ITEM_STATUSES.EXPIRED) {
    return (
      <>
        <FormattedMessage id={LOST_ITEM_STATUS_TRANSLATIONS_KEYS[LOST_ITEM_STATUSES.EXPIRED]} />
        {actualCostRecord?.expirationDate && (
          <>
            <br /><DateTimeFormatter value={actualCostRecord.expirationDate} />
          </>
        )}
      </>
    );
  }

  return <FormattedMessage id={LOST_ITEM_STATUS_TRANSLATIONS_KEYS[LOST_ITEM_STATUSES.OPEN]} />;
};

RecordStatus.propTypes = {
  billedRecords: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string,
    billedAmount: PropTypes.string,
  })).isRequired,
  cancelledRecords: PropTypes.arrayOf(PropTypes.string).isRequired,
  actualCostRecord: PropTypes.shape({
    id: PropTypes.string,
    expirationDate: PropTypes.string,
    status: PropTypes.string,
  }).isRequired,
};

export default RecordStatus;

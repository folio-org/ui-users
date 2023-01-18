import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';

import styles from './RecordStatus.css';

export const getBilledAmount = (recordId, billedRecords) => billedRecords.find(record => record.id === recordId)?.billedAmount;

const RecordStatus = ({
  recordId,
  billedRecords,
  isBilled,
  isCancelled,
}) => {
  return (
    <>
      {
        isBilled &&
        <div className={styles.recordStatusWrapper}>
          <FormattedMessage
            id="ui-users.lostItems.recordStatus.billed"
            values={{ amount: getBilledAmount(recordId, billedRecords) }}
          />
        </div>
      }
      {
        isCancelled &&
        <div className={styles.recordStatusWrapper}>
          <FormattedMessage id="ui-users.lostItems.recordStatus.notBilled" />
        </div>
      }
    </>
  );
};

RecordStatus.propType = {
  recordId: PropTypes.string.isRequired,
  billedRecords: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string,
  })).isRequired,
  isBilled: PropTypes.bool.isRequired,
  isCancelled: PropTypes.bool.isRequired,
};

export default RecordStatus;

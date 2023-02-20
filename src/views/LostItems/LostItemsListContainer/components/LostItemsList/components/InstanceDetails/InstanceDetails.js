import React from 'react';
import PropTypes from 'prop-types';
import {
  FormattedMessage,
} from 'react-intl';
import {
  get,
} from 'lodash';

import { effectiveCallNumber } from '@folio/stripes/util';

import ShowLongContentInPopover from './components';

import {
  ACTUAL_COST_RECORD_FIELD_NAME,
  ACTUAL_COST_RECORD_FIELD_PATH,
  ISBN_ID,
} from '../../../../../constants';

import css from './InstanceDetails.css';

export const getISBN = (actualCostRecord) => (
  get(actualCostRecord, ACTUAL_COST_RECORD_FIELD_PATH[ACTUAL_COST_RECORD_FIELD_NAME.INSTANCE_IDENTIFIERS], [])
    .filter(({ identifierTypeId }) => identifierTypeId === ISBN_ID)
);

export const renderISBN = (actualCostRecord) => (
  getISBN(actualCostRecord)
    .map(({ value }, index) => {
      return (
        <div key={index}>
          <FormattedMessage id="ui-users.lostItems.list.columnName.instance.subString.ISBN" />
          { value }
        </div>
      );
    })
);

export const getEffectiveCallNumber = (actualCostRecord) => {
  const item = get(actualCostRecord, ACTUAL_COST_RECORD_FIELD_PATH[ACTUAL_COST_RECORD_FIELD_NAME.ITEM], {});

  return effectiveCallNumber(item);
};

const InstanceDetails = ({ actualCostRecord }) => {
  return (
    <div>
      <div className={css.instanceElement}>
        <ShowLongContentInPopover
          text={get(actualCostRecord, ACTUAL_COST_RECORD_FIELD_PATH[ACTUAL_COST_RECORD_FIELD_NAME.INSTANCE_TITLE], '')}
          additionalText={get(actualCostRecord, ACTUAL_COST_RECORD_FIELD_PATH[ACTUAL_COST_RECORD_FIELD_NAME.MATERIAL_TYPE], '')}
        />
      </div>
      <div className={css.instanceElement}>
        { renderISBN(actualCostRecord) }
      </div>
      <div className={css.instanceElement}>
        <FormattedMessage id="ui-users.lostItems.list.columnName.instance.subString.loanType" />
        {get(actualCostRecord, ACTUAL_COST_RECORD_FIELD_PATH[ACTUAL_COST_RECORD_FIELD_NAME.LOAN_TYPE], '')}
      </div>
      {
        getEffectiveCallNumber(actualCostRecord) && (
          <div className={css.instanceElement}>
            <FormattedMessage id="ui-users.lostItems.list.columnName.instance.subString.effectiveCallNumber" />
            { getEffectiveCallNumber(actualCostRecord) }
          </div>
        )
      }
    </div>
  );
};

InstanceDetails.propTypes = {
  actualCostRecord: PropTypes.shape({
    item: PropTypes.shape({
      materialType: PropTypes.string.isRequired,
      loanType: PropTypes.string.isRequired,
    }).isRequired,
    instance: PropTypes.shape({
      identifiers: PropTypes.arrayOf(PropTypes.shape({
        identifierTypeId: PropTypes.string,
        identifierType: PropTypes.string,
        value: PropTypes.string,
      })),
      title: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

export default InstanceDetails;

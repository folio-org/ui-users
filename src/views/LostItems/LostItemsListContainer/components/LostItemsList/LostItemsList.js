import React, {
  useState,
} from 'react';
import PropTypes from 'prop-types';
import {
  FormattedDate,
  FormattedTime,
  FormattedMessage,
} from 'react-intl';
import {
  get,
  noop,
} from 'lodash';

import {
  MultiColumnList,
} from '@folio/stripes/components';

import {
  ActualCostModal,
  ActualCostConfirmModal,
  InstanceDetails,
  RenderActions,
} from './components';

import {
  itemStatuses,
} from '../../../../../constants';
import {
  ACTUAL_COST_RECORD_FIELD_NAME,
  ACTUAL_COST_RECORD_FIELD_PATH,
  DEFAULT_VALUE,
  ITEM_STATUSES_TRANSLATIONS_KEYS,
  PAGE_AMOUNT,
  ACTUAL_COST_MODAL_DEFAULT,
  ACTUAL_COST_CONFIRM_MODAL_DEFAULT,
  ACTUAL_COST_DEFAULT,
} from '../../../constants';
import {
  getPatronName,
} from './util';

const COLUMNS_NAME = {
  PATRON: ACTUAL_COST_RECORD_FIELD_NAME.USER,
  LOSS_TYPE: ACTUAL_COST_RECORD_FIELD_PATH[ACTUAL_COST_RECORD_FIELD_NAME.LOSS_TYPE],
  LOSS_DATE: ACTUAL_COST_RECORD_FIELD_PATH[ACTUAL_COST_RECORD_FIELD_NAME.LOSS_DATE],
  INSTANCE: ACTUAL_COST_RECORD_FIELD_PATH[ACTUAL_COST_RECORD_FIELD_NAME.INSTANCE_TITLE],
  PERMANENT_ITEM_LOCATION: ACTUAL_COST_RECORD_FIELD_PATH[ACTUAL_COST_RECORD_FIELD_NAME.PERMANENT_ITEM_LOCATION],
  FEE_FINE_OWNER: ACTUAL_COST_RECORD_FIELD_PATH[ACTUAL_COST_RECORD_FIELD_NAME.FEE_FINE_OWNER],
  FEE_FINE_TYPE: ACTUAL_COST_RECORD_FIELD_PATH[ACTUAL_COST_RECORD_FIELD_NAME.FEE_FINE_TYPE],
  ACTION: 'ACTION',
};
const visibleColumns = [
  COLUMNS_NAME.PATRON,
  COLUMNS_NAME.LOSS_TYPE,
  COLUMNS_NAME.LOSS_DATE,
  COLUMNS_NAME.INSTANCE,
  COLUMNS_NAME.PERMANENT_ITEM_LOCATION,
  COLUMNS_NAME.FEE_FINE_OWNER,
  COLUMNS_NAME.FEE_FINE_TYPE,
  COLUMNS_NAME.ACTION,
];
const columnWidths = {
  [COLUMNS_NAME.PATRON]: { max: 150 },
  [COLUMNS_NAME.LOSS_TYPE]: { max: 150 },
  [COLUMNS_NAME.LOSS_DATE]: { max: 100 },
  [COLUMNS_NAME.INSTANCE]: { max: 300 },
  [COLUMNS_NAME.PERMANENT_ITEM_LOCATION]: { max: 150 },
  [COLUMNS_NAME.FEE_FINE_OWNER]: { max: 150 },
  [COLUMNS_NAME.FEE_FINE_TYPE]: { max: 150 },
  [COLUMNS_NAME.ACTION]: { max: 50 },
};
const columnMapping = {
  [COLUMNS_NAME.PATRON]: <FormattedMessage id="ui-users.lostItems.list.columnName.patron" />,
  [COLUMNS_NAME.LOSS_TYPE]: <FormattedMessage id="ui-users.lostItems.list.columnName.lossType" />,
  [COLUMNS_NAME.LOSS_DATE]: <FormattedMessage id="ui-users.lostItems.list.columnName.dateOfLoss" />,
  [COLUMNS_NAME.INSTANCE]: <FormattedMessage id="ui-users.lostItems.list.columnName.instance" />,
  [COLUMNS_NAME.PERMANENT_ITEM_LOCATION]: <FormattedMessage id="ui-users.lostItems.list.columnName.permanentItemLocation" />,
  [COLUMNS_NAME.FEE_FINE_OWNER]: <FormattedMessage id="ui-users.lostItems.list.columnName.feeFineOwner" />,
  [COLUMNS_NAME.FEE_FINE_TYPE]: <FormattedMessage id="ui-users.lostItems.list.columnName.feeFineType" />,
  [COLUMNS_NAME.ACTION]: <FormattedMessage id="ui-users.lostItems.list.columnName.actions" />,
};
export const triggerOnSort = (e, meta, onSort) => {
  if (meta.name === COLUMNS_NAME.ACTION) {
    return noop;
  }

  return onSort(e, meta);
};

const LostItemsList = ({
  contentData,
  totalCount,
  onNeedMoreData,
  emptyMessage,
  onSort,
  sortOrder,
}) => {
  const [actualCostModal, setActualCostModal] = useState(ACTUAL_COST_MODAL_DEFAULT);
  const [actualCostConfirmModal, setActualCostConfirmModal] = useState(ACTUAL_COST_CONFIRM_MODAL_DEFAULT);
  const [actualCost, setActualCost] = useState(ACTUAL_COST_DEFAULT);

  const lostItemsListFormatter = {
    [COLUMNS_NAME.PATRON]: (actualCostRecord) => {
      const patronGroup = get(actualCostRecord, ACTUAL_COST_RECORD_FIELD_PATH[ACTUAL_COST_RECORD_FIELD_NAME.USER_PATRON_GROUP], DEFAULT_VALUE);
      const patronName = getPatronName(actualCostRecord);

      return (
        <div>
          <div>{patronName}</div>
          <div>({patronGroup})</div>
        </div>
      );
    },
    [COLUMNS_NAME.LOSS_TYPE]: (actualCostRecord) => {
      const lossType = get(actualCostRecord, ACTUAL_COST_RECORD_FIELD_PATH[ACTUAL_COST_RECORD_FIELD_NAME.LOSS_TYPE], DEFAULT_VALUE);

      return <FormattedMessage id={ITEM_STATUSES_TRANSLATIONS_KEYS[lossType]} />;
    },
    [COLUMNS_NAME.LOSS_DATE]: (actualCostRecord) => {
      const lossDate = get(actualCostRecord, ACTUAL_COST_RECORD_FIELD_PATH[ACTUAL_COST_RECORD_FIELD_NAME.LOSS_DATE], DEFAULT_VALUE);

      return (
        <>
          <FormattedDate value={lossDate} />, <FormattedTime value={lossDate} />
        </>
      );
    },
    [COLUMNS_NAME.INSTANCE]: (actualCostRecord) => (<InstanceDetails actualCostRecord={actualCostRecord} />),
    [COLUMNS_NAME.PERMANENT_ITEM_LOCATION]: (actualCostRecord) => (get(actualCostRecord, ACTUAL_COST_RECORD_FIELD_PATH[ACTUAL_COST_RECORD_FIELD_NAME.PERMANENT_ITEM_LOCATION], DEFAULT_VALUE)),
    [COLUMNS_NAME.FEE_FINE_OWNER]: (actualCostRecord) => (get(actualCostRecord, ACTUAL_COST_RECORD_FIELD_PATH[ACTUAL_COST_RECORD_FIELD_NAME.FEE_FINE_OWNER], DEFAULT_VALUE)),
    [COLUMNS_NAME.FEE_FINE_TYPE]: (actualCostRecord) => (get(actualCostRecord, ACTUAL_COST_RECORD_FIELD_PATH[ACTUAL_COST_RECORD_FIELD_NAME.FEE_FINE_TYPE], DEFAULT_VALUE)),
    [COLUMNS_NAME.ACTION]: (actualCostRecord) => (<RenderActions
      actualCostRecord={actualCostRecord}
      setActualCostModal={setActualCostModal}
      actualCost={actualCost}
      setActualCost={setActualCost}
    />),
  };

  return (
    <>
      <MultiColumnList
        id="lostItemsList"
        data-testid="lostItemsList"
        fullWidth
        visibleColumns={visibleColumns}
        columnMapping={columnMapping}
        columnWidths={columnWidths}
        rowMetadata={['id']}
        interactive={false}
        contentData={contentData}
        totalCount={totalCount}
        onNeedMoreData={onNeedMoreData}
        formatter={lostItemsListFormatter}
        isEmptyMessage={emptyMessage}
        onHeaderClick={(e, meta) => triggerOnSort(e, meta, onSort)}
        sortOrder={sortOrder.replace(/^-/, '').replace(/,.*/, '')}
        sortDirection={sortOrder.startsWith('-') ? 'descending' : 'ascending'}
        pageAmount={PAGE_AMOUNT}
        pagingType="click"
        autosize
        hasMargin
      />
      <ActualCostModal
        actualCostModal={actualCostModal}
        setActualCostModal={setActualCostModal}
        setActualCostConfirmModal={setActualCostConfirmModal}
        actualCost={actualCost}
        setActualCost={setActualCost}
      />
      <ActualCostConfirmModal
        setActualCostModal={setActualCostModal}
        actualCostConfirmModal={actualCostConfirmModal}
        setActualCostConfirmModal={setActualCostConfirmModal}
        actualCost={actualCost}
        setActualCost={setActualCost}
      />
    </>
  );
};

LostItemsList.propTypes = {
  contentData: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    lossType: PropTypes.oneOf([itemStatuses.AGED_TO_LOST, itemStatuses.DECLARED_LOST]),
    dateOfLoss: PropTypes.string.isRequired,
    user: PropTypes.shape({
      id: PropTypes.string.isRequired,
      firstName: PropTypes.string.isRequired,
      lastName: PropTypes.string,
      middleName: PropTypes.string,
    }).isRequired,
    loan: PropTypes.shape({
      id: PropTypes.string.isRequired,
    }).isRequired,
    item: PropTypes.shape({
      id: PropTypes.string.isRequired,
      materialType: PropTypes.string.isRequired,
      loanType: PropTypes.string.isRequired,
      holdingsRecordId: PropTypes.string.isRequired,
      permanentLocation: PropTypes.string.isRequired,
    }).isRequired,
    feeFine: PropTypes.shape({
      ownerId: PropTypes.string.isRequired,
      owner: PropTypes.string.isRequired,
      typeId: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired,
    }).isRequired,
    instance: PropTypes.shape({
      id: PropTypes.string.isRequired,
      identifiers: PropTypes.arrayOf(PropTypes.shape({
        identifierTypeId: PropTypes.string,
        identifierType: PropTypes.string,
        value: PropTypes.string,
      })),
      title: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired),
  totalCount: PropTypes.number.isRequired,
  onNeedMoreData: PropTypes.func.isRequired,
  emptyMessage: PropTypes.node,
  onSort: PropTypes.func.isRequired,
  sortOrder: PropTypes.string.isRequired,
};

export default LostItemsList;

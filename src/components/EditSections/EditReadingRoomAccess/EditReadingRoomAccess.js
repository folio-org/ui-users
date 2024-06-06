import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { cloneDeep, noop, orderBy } from 'lodash';

import {
  Accordion,
  Badge,
  Headline,
  Loading,
  MultiColumnList,
} from '@folio/stripes/components';

import { rraColumns, DEFAULT_SORT_ORDER } from './constants';
import { getFormatter } from './getFormatter';
import { sortTypes } from '../../../constants';
import { getReadingRoomSortedData } from '../../util/util';

const EditReadingRoomAccess = ({
  expanded,
  onToggle,
  accordionId,
  form,
  formData,
}) => {
  const columnMapping = {
    [rraColumns.ACCESS]: <FormattedMessage id="ui-users.readingRoom.access" />,
    [rraColumns.READING_ROOM_NAME]: <FormattedMessage id="ui-users.readingRoom.name" />,
    [rraColumns.NOTES]: <FormattedMessage id="ui-users.readingRoom.note" />,
  };
  const visibleColumns = Object.keys(columnMapping);
  const columnWidths = {
    [rraColumns.ACCESS]: '15%',
    [rraColumns.READING_ROOM_NAME]: '25%',
  };
  const sortInitialState = {
    data: [],
    order: DEFAULT_SORT_ORDER,
    direction: sortTypes.ASC,
  };
  const [sortedRecordsDetails, setSortedRecordsDetails] = useState(sortInitialState);
  const [sortedRecordsIsLoading, setSortedRecordsIsLoading] = useState(false);

  useEffect(() => {
    const unregisterReadingRoomAccessList = form.registerField('readingRoomsAccessList', noop, { initialValue: [] });
    return () => {
      unregisterReadingRoomAccessList();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setSortedRecordsDetails(prev => ({
      ...prev,
      data: orderBy(formData, [data => data[prev.order]?.toLowerCase()], prev.direction)
    }));
  }, [formData, form]);

  const onSort = (e, meta) => {
    setSortedRecordsIsLoading(true);
    const recordDetails = cloneDeep(sortedRecordsDetails);
    const updatedRecords = form.getFieldState('readingRoomsAccessList').value;

    updatedRecords?.forEach(updatedRecord => {
      const index = recordDetails?.data?.findIndex(record => record.readingRoomId === updatedRecord.readingRoomId);
      if (index !== -1) {
        recordDetails.data[index] = updatedRecord;
      }
    });

    setSortedRecordsDetails(
      getReadingRoomSortedData(e, meta, recordDetails)
    );
  // setState callback, use Transition
  };

  useEffect(() => {
    setSortedRecordsIsLoading(false);
  }, [sortedRecordsDetails]);

  return (
    <Accordion
      open={expanded}
      id={accordionId}
      onToggle={onToggle}
      label={<Headline size="large" tag="h3"><FormattedMessage id="ui-users.readingRoom.readingRoomAccess" /></Headline>}
      displayWhenClosed={<Badge>{formData.length}</Badge>}
    >
      { sortedRecordsIsLoading ? <Loading /> :
      <MultiColumnList
        striped
        contentData={sortedRecordsDetails?.data}
        columnMapping={columnMapping}
        visibleColumns={visibleColumns}
        formatter={getFormatter(form)}
        columnWidths={columnWidths}
        sortOrder={sortedRecordsDetails.order}
        sortDirection={`${sortedRecordsDetails.direction}ending`}
        onHeaderClick={onSort}
        sortedColumn={sortedRecordsDetails.order}
      /> }
    </Accordion>
  );
};

EditReadingRoomAccess.propTypes = {
  expanded: PropTypes.bool,
  onToggle: PropTypes.func,
  accordionId: PropTypes.string.isRequired,
  formData: PropTypes.object,
  form: PropTypes.object,
};

export default EditReadingRoomAccess;

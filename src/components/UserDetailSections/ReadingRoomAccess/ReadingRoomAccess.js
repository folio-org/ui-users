import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, useIntl } from 'react-intl';
import { Link } from 'react-router-dom';
import { get, orderBy } from 'lodash';

import {
  Accordion,
  Badge,
  FormattedUTCDate,
  Headline,
  MultiColumnList,
  SearchField,
  Icon,
} from '@folio/stripes/components';

import { rraColumns, DEFAULT_SORT_ORDER, SORT_DIRECTION } from './constant';
import { getFormatter } from './getFormatter';
import css from './ReadingRoomAccess.css';

const ReadingRoomAccess = (props) => {
  const {
    accordionId,
    expanded,
    onToggle,
    readingRoomPermissions,
  } = props;
  const intl = useIntl();
  const userRRAPermissions = useMemo(() => readingRoomPermissions?.records, [readingRoomPermissions]);
  const { isPending } = readingRoomPermissions;
  const visibleColumns = [
    rraColumns.ACCESS,
    rraColumns.READING_ROOM_NAME,
    rraColumns.NOTES,
    rraColumns.ID
  ];
  const columnMapping = {
    [rraColumns.ACCESS]: <FormattedMessage id="ui-users.readingRoom.access" />,
    [rraColumns.READING_ROOM_NAME]: <FormattedMessage id="ui-users.readingRoom.name" />,
    [rraColumns.NOTES]: <FormattedMessage id="ui-users.readingRoom.note" />,
    [rraColumns.ID]: <FormattedMessage id="ui-users.readingRoom.lastUpdated" />,
  };
  const sortInitialState = {
    data: [],
    order: DEFAULT_SORT_ORDER,
    direction: SORT_DIRECTION.ASCENDING,
  };
  const [sortedRecordsDetails, setSortedRecordsDetails] = useState(sortInitialState);

  useEffect(() => {
    if (!isPending) {
      setSortedRecordsDetails(prev => ({
        ...prev.sortedRecordsDetails,
        data: orderBy(userRRAPermissions, [rraColumns.ACCESS])
      }));
    }
  }, [userRRAPermissions, isPending]);

  const filterReadingRoomsByName = (e) => {
    const name = e.target.value;
    const filteredRRs = userRRAPermissions.filter(r => r.readingRoomName.includes(name));
    setSortedRecordsDetails(prev => ({
      ...prev.sortedRecordsDetails,
      data: orderBy(filteredRRs, [rraColumns.ACCESS])
    }));
  };

  const renderName = (usr) => {
    const lastName = get(usr, ['personal', 'lastName'], '');
    const firstName = get(usr, ['personal', 'firstName'], '');
    const middleName = get(usr, ['personal', 'middleName'], '');

    return `${lastName}${firstName ? ', ' : ' '}${firstName} ${middleName}`;
  };

  const renderUser = (usr) => {
    const name = renderName(usr);

    return <Link to={`/users/view/${usr?.id}`} data-test-user-link>{name}</Link>;
  };

  const lastUpdatedDetails = (updater, date) => {
    const lastUpdatedUser = renderUser(updater);
    return (
      <div className={css.lastUpdatedBy}>
        <FormattedMessage
          id="ui-users.readingRoom.metaSection.lastUpdatedDetails"
          values={{
            date: <FormattedUTCDate value={date} />,
            name: lastUpdatedUser,
          }}
        />
      </div>
    );
  };

  const onSort = (e, meta) => {
    let newSortDirection = SORT_DIRECTION.ASCENDING;
    if (sortedRecordsDetails.order === meta.name) {
      newSortDirection = sortedRecordsDetails.direction === SORT_DIRECTION.ASCENDING ? SORT_DIRECTION.DESCENDING : SORT_DIRECTION.ASCENDING;
    }
    const sortedData = orderBy(sortedRecordsDetails.data, [meta.name], newSortDirection);

    setSortedRecordsDetails({
      data: sortedData,
      order: meta.name,
      direction: newSortDirection
    });
  };

  return (
    <Accordion
      id={accordionId}
      label={<Headline size="large" tag="h3"><FormattedMessage id="ui-users.readingRoom.readingRoomAccess" /></Headline>}
      onToggle={onToggle}
      open={expanded}
      displayWhenClosed={
        isPending ? <Icon icon="spinner-ellipsis" width="10px" /> : <Badge>{userRRAPermissions.length}</Badge>
      }
      displayWhenOpen={
        <div
          className={css.rraSearchFieldContainer}
        >
          <SearchField
            onChange={filterReadingRoomsByName}
            onClear={() => setSortedRecordsDetails(prev => ({
              ...prev.sortedRecordsDetails,
              data: orderBy(userRRAPermissions, [rraColumns.ACCESS])
            }))}
            placeholder={intl.formatMessage({ id:'ui-users.readingRoom.filter' })}
          />
        </div>
      }
    >
      <MultiColumnList
        striped
        data-testid="reading-room-access-mcl"
        contentData={sortedRecordsDetails.data}
        columnMapping={columnMapping}
        visibleColumns={visibleColumns}
        formatter={getFormatter(lastUpdatedDetails)}
        sortOrder={sortedRecordsDetails.order}
        sortDirection={`${sortedRecordsDetails.direction}ending`}
        onHeaderClick={onSort}
      />
    </Accordion>
  );
};

ReadingRoomAccess.propTypes = {
  expanded: PropTypes.bool,
  onToggle: PropTypes.func,
  accordionId: PropTypes.string.isRequired,
  readingRoomPermissions: PropTypes.shape({
    isPending: PropTypes.bool,
    records: PropTypes.arrayOf(PropTypes.object),
  })
};

export default ReadingRoomAccess;

import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, useIntl } from 'react-intl';
import { Link } from 'react-router-dom';
import { get, orderBy, noop } from 'lodash';

import {
  Accordion,
  Badge,
  FormattedUTCDate,
  Headline,
  MultiColumnList,
  SearchField,
  Icon,
} from '@folio/stripes/components';

import { rraColumns, DEFAULT_SORT_ORDER } from './constant';
import { sortTypes } from '../../../constants';
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
  const columnMapping = {
    [rraColumns.ACCESS]: <FormattedMessage id="ui-users.readingRoom.access" />,
    [rraColumns.READING_ROOM_NAME]: <FormattedMessage id="ui-users.readingRoom.name" />,
    [rraColumns.NOTES]: <FormattedMessage id="ui-users.readingRoom.note" />,
    [rraColumns.ID]: <FormattedMessage id="ui-users.readingRoom.lastUpdated" />,
  };
  const visibleColumns = Object.keys(columnMapping);
  const sortInitialState = {
    data: [],
    order: DEFAULT_SORT_ORDER,
    direction: sortTypes.ASC,
  };
  const [sortedRecordsDetails, setSortedRecordsDetails] = useState(sortInitialState);

  useEffect(() => {
    if (!isPending) {
      setSortedRecordsDetails(prev => ({
        ...prev,
        data: orderBy(userRRAPermissions, prev.order, prev.direction)
      }));
    }
  }, [userRRAPermissions, isPending]);

  const filterReadingRoomsByName = (e) => {
    const name = e.target.value;
    const filteredRRs = userRRAPermissions.filter(r => r.readingRoomName.includes(name));
    setSortedRecordsDetails(prev => ({
      ...prev,
      data: orderBy(filteredRRs, prev.order, prev.direction)
    }));
  };

  const onSort = (e, meta) => {
    let newSortDirection = sortTypes.ASC;
    if (sortedRecordsDetails.order === meta.name) {
      newSortDirection = sortedRecordsDetails.direction === sortTypes.ASC ? sortTypes.DESC : sortTypes.ASC;
    }
    const sortedData = orderBy(sortedRecordsDetails.data, [meta.name], newSortDirection);

    setSortedRecordsDetails({
      data: sortedData,
      order: meta.name,
      direction: newSortDirection
    });
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

  return (
    <Accordion
      id={accordionId}
      label={<Headline size="large" tag="h3"><FormattedMessage id="ui-users.readingRoom.readingRoomAccess" /></Headline>}
      onToggle={onToggle}
      open={expanded}
      displayWhenClosed={
        isPending ? <Icon icon="spinner-ellipsis" /> : <Badge>{userRRAPermissions.length}</Badge>
      }
      displayWhenOpen={
        <div
          className={css.rraSearchFieldContainer}
        >
          <SearchField
            onChange={filterReadingRoomsByName}
            onClear={noop}
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
        sortedColumn={sortedRecordsDetails.order}
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

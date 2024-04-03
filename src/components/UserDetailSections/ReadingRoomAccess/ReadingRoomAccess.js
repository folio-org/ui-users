import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, useIntl } from 'react-intl';
// import { Link } from 'react-router-dom';
import { get, orderBy } from 'lodash';

import {
  Accordion,
  Badge,
  FormattedUTCDate,
  Headline,
  MultiColumnList,
  SearchField,
} from '@folio/stripes/components';
// import { ViewMetaData } from '@folio/stripes/smart-components';
import { READING_ROOM_ACCESS, SORT_DIRECTIONS } from '../../../constants';
// import css from './ReadingRoom.css';

const mockedRRAData = [
  {
    'id': 'id1',
    'userId': 'userId1',
    'readingRoomId': 'rrId1',
    'readingRoomName': 'reading room 1',
    'access': 'NOT_ALLOWED',
    'notes': 'string',
    'metadata': {
      'createdDate': 'string',
      'createdByUserId': 'c569031b-2399-563c-a8ab-20a2d2a47ba2',
      'updatedDate': '2024-04-03T02:06:36.761+00:00',
      'updatedByUserId': 'b17096d8-5b8c-587f-8e78-8f808994b09b',
    }
  },
  {
    'id': 'id2',
    'userId': 'userId2',
    'readingRoomId': 'rrId2',
    'readingRoomName': 'reading room 2',
    'access': 'ALLOWED',
    'notes': 'string',
    'metadata': {
      'createdDate': 'string',
      'createdByUserId': 'c569031b-2399-563c-a8ab-20a2d2a47ba2',
      'updatedDate': '2024-04-03T02:06:36.761+00:00',
      'updatedByUserId': 'b17096d8-5b8c-587f-8e78-8f808994b09b',
    }
  }
];

const ReadingRoomAccess = (props) => {
  const intl = useIntl();
  const [filteredRRA, setFilteredRRA] = useState(mockedRRAData);
  const [sortedColumn, setSortedColumn] = useState('access');
  const [sortOrder, setSortOrder] = useState(SORT_DIRECTIONS.asc.name);

  const {
    accordionId,
    expanded,
    onToggle,
    // userId,
  } = props;

  const filterReadingRoomsByName = (e) => {
    const name = e.target.value;
    const filteredRRs = mockedRRAData.filter(r => r.readingRoomName.includes(name));
    setFilteredRRA(filteredRRs);
  };

  // const renderName = (usr) => {
  //   const lastName = get(usr, ['personal', 'lastName'], '');
  //   const firstName = get(usr, ['personal', 'firstName'], '');
  //   const middleName = get(usr, ['personal', 'middleName'], '');

  //   return `${lastName}${firstName ? ', ' : ' '}${firstName} ${middleName}`;
  // };

  // const renderUser = (usr) => {
  //   if (typeof usr === 'string' || isValidElement(usr)) return usr;

  //   const name = renderName(usr);

  //   if (usr?.id) {
  //     return <Link to={`/users/view/${usr.id}`} data-test-user-link>{name}</Link>;
  //   } else {
  //     return name;
  //   }
  // };

  // const lastUpdatedDetails = (updater, date) => {
  //   return (
  //     <div className={css.lastUpdatedBy}>
  //       <FormattedUTCDate value={date} />
  //       {renderUser(updater, date) }
  //     </div>
  //   );
  // };

  const visibleColumns = ['access', 'readingRoomName', 'notes', 'id'];
  const columnMapping = {
    access: <FormattedMessage id="ui-users.readingRoom.access" />,
    readingRoomName: <FormattedMessage id="ui-users.readingRoom.name" />,
    notes: <FormattedMessage id="ui-users.readingRoom.note" />,
    id: <FormattedMessage id="ui-users.readingRoom.lastUpdated" />,
  };
  const formatter = {
    access: (rra) => <FormattedMessage id={READING_ROOM_ACCESS[rra.access]} />,
    readingRoomName: (rra) => rra.readingRoomName,
    notes: rra => rra.notes,
    // id: rra => (
    //   <ViewMetaData
    //     metadata={rra.metadata}
    //   >
    //     {
    //       (updater) => {
    //         return lastUpdatedDetails(updater?.lastUpdatedBy, rra.metadata.updatedDate);
    //       }}
    //   </ViewMetaData>
    // )
    id: rra => <FormattedUTCDate value={rra.updatedDate} />
  };
  const onHeaderClick = (e, { name: columnName }) => {
    if (sortedColumn !== columnName) {
      setSortedColumn(columnName);
      setSortOrder(SORT_DIRECTIONS.desc.name);
    } else {
      const newSortOrder = (sortOrder === SORT_DIRECTIONS.desc.name)
        ? SORT_DIRECTIONS.asc.name
        : SORT_DIRECTIONS.desc.name;
      setSortOrder(newSortOrder);
    }
  };

  return (
    <Accordion
      id={accordionId}
      label={<Headline size="large" tag="h3"><FormattedMessage id="ui-users.readingRoom.readingRoomAccess" /></Headline>}
      onToggle={onToggle}
      open={expanded}
      displayWhenClosed={
        <Badge>{filteredRRA.length}</Badge>
      }
      displayWhenOpen={
        <SearchField
          onChange={filterReadingRoomsByName}
          onClear={() => setFilteredRRA(mockedRRAData)}
          placeholder={intl.formatMessage({ id:'ui-users.readingRoom.filter' })}
        />
      }
    >
      <MultiColumnList
        striped
        data-testid="reading-room-access-mcl"
        contentData={filteredRRA}
        columnMapping={columnMapping}
        visibleColumns={visibleColumns}
        formatter={formatter}
        sortedColumn={sortedColumn}
        onHeaderClick={onHeaderClick}
        sortDirection={SORT_DIRECTIONS[sortOrder].fullName}
      />
    </Accordion>
  );
};

ReadingRoomAccess.propTypes = {
  expanded: PropTypes.bool,
  onToggle: PropTypes.func,
  accordionId: PropTypes.string.isRequired,
  // userId: PropTypes.string,
};
// ReadingRoomAccess.manifest = Object.freeze({
//   readingRoomAccess: {
//     type: 'okapi',
//     path: '/reading-room-patron-permission/{props.userId}'
//   }
// });
export default ReadingRoomAccess;

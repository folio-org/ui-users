import React, { useState, isValidElement, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, useIntl } from 'react-intl';
import { Link } from 'react-router-dom';
import { get } from 'lodash';

import {
  Accordion,
  Badge,
  FormattedUTCDate,
  Headline,
  MultiColumnList,
  SearchField,
} from '@folio/stripes/components';

import { rraColumns } from './constant';
import { getFormatter } from './getFormatter';
import css from './ReadingRoomAccess.css';

const ReadingRoomAccess = (props) => {
  const {
    accordionId,
    expanded,
    onToggle,
    userRRAPermissions,
  } = props;
  const intl = useIntl();
  const [filteredRRA, setFilteredRRA] = useState([]);

  useEffect(() => {
    setFilteredRRA(userRRAPermissions);
  }, [userRRAPermissions]);

  const filterReadingRoomsByName = (e) => {
    const name = e.target.value;
    const filteredRRs = userRRAPermissions.filter(r => r.readingRoomName.includes(name));
    setFilteredRRA(filteredRRs);
  };

  const renderName = (usr) => {
    const lastName = get(usr, ['personal', 'lastName'], '');
    const firstName = get(usr, ['personal', 'firstName'], '');
    const middleName = get(usr, ['personal', 'middleName'], '');

    return `${lastName}${firstName ? ', ' : ' '}${firstName} ${middleName}`;
  };

  const renderUser = (usr) => {
    if (typeof usr === 'string' || isValidElement(usr)) return usr;

    const name = renderName(usr);

    if (usr?.id) {
      return <Link to={`/users/view/${usr.id}`} data-test-user-link>{name}</Link>;
    } else {
      return name;
    }
  };

  const lastUpdatedDetails = (updater, date) => {
    const lastUpdatedUser = renderUser(updater);
    return (
      <div className={css.lastUpdatedBy}>
        <FormattedMessage
          id="ui-users.reading-room-access.metaSection.lastUpdatedDetails"
          values={{
            date: <FormattedUTCDate value={date} />,
            name: lastUpdatedUser,
          }}
        />
      </div>
    );
  };

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
        <div
          className={css.rraSearchFieldContainer}
        >
          <SearchField
            onChange={filterReadingRoomsByName}
            onClear={() => setFilteredRRA(userRRAPermissions)}
            placeholder={intl.formatMessage({ id:'ui-users.readingRoom.filter' })}
          />
        </div>
        // <p>Add item</p>
      }
    >
      <MultiColumnList
        striped
        data-testid="reading-room-access-mcl"
        contentData={filteredRRA}
        columnMapping={columnMapping}
        visibleColumns={visibleColumns}
        formatter={getFormatter(lastUpdatedDetails)}
      />
    </Accordion>
  );
};

ReadingRoomAccess.propTypes = {
  expanded: PropTypes.bool,
  onToggle: PropTypes.func,
  accordionId: PropTypes.string.isRequired,
  userRRAPermissions: PropTypes.arrayOf(PropTypes.object),
};

export default ReadingRoomAccess;

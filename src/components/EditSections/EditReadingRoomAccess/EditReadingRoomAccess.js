import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { noop } from 'lodash';

import {
  Accordion,
  Badge,
  Headline,
  MultiColumnList,
} from '@folio/stripes/components';

import { rraColumns } from './constants';
import { getFormatter } from './getFormatter';

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

  useEffect(() => {
    const unregisterReadingRoomAccessList = form.registerField('readingRoomsAccessList', noop, { initialValue: [] });
    return () => {
      unregisterReadingRoomAccessList();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Accordion
      open={expanded}
      id={accordionId}
      onToggle={onToggle}
      label={<Headline size="large" tag="h3"><FormattedMessage id="ui-users.readingRoom.readingRoomAccess" /></Headline>}
      displayWhenClosed={<Badge>{formData.length}</Badge>}
    >
      <MultiColumnList
        striped
        contentData={formData}
        columnMapping={columnMapping}
        visibleColumns={visibleColumns}
        formatter={getFormatter(form)}
        columnWidths={columnWidths}
      />
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

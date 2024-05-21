/* eslint-disable import/prefer-default-export */
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import { ViewMetaData } from '@folio/stripes/smart-components';
import { NoValue } from '@folio/stripes/components';

import { READING_ROOM_ACCESS } from '../../../constants';
import { rraColumns } from './constant';

export const getFormatter = (lastUpdatedDetails) => ({
  [rraColumns.ACCESS]: Object.assign(
    ({ access }) => <FormattedMessage id={READING_ROOM_ACCESS[access]} />,
    { access: PropTypes.string }
  ),
  [rraColumns.READING_ROOM_NAME]: ({ readingRoomName }) => readingRoomName,
  [rraColumns.NOTES]: ({ notes }) => notes,
  [rraColumns.ID]: rra => (
    rra?.metadata?.updatedDate ? (
      <ViewMetaData
        metadata={rra.metadata}
      >
        {
            (updater) => lastUpdatedDetails(updater?.lastUpdatedBy, rra.metadata.updatedDate)
          }
      </ViewMetaData>
    ) :
      <NoValue />
  )
});

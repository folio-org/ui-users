import PropTypes from 'prop-types';
import {
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { FormattedMessage } from 'react-intl';

import {
  MessageBanner,
  Pane,
  PaneHeader,
  Paneset,
} from '@folio/stripes/components';

import { useUsersQuery } from '../../hooks';
import { getPatronDuplicatesQuery } from '../../utils';
import PreRegistrationRecordsDuplicatesList from './PreRegistrationRecordsDuplicatesList';

const PatronPreRegistrationRecordsDuplicates = ({
  email,
  onClose,
}) => {
  const [wrapperHeight, setWrapperHeight] = useState();
  const listWrapperRef = useRef(null);

  /*
    * Adjust the height of the list wrapper to fill the available space
    * between the list wrapper and the bottom of the screen.
  */
  useLayoutEffect(() => {
    const observedElement = listWrapperRef.current;

    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries.length) return;

      const { target } = entries[0];

      if (listWrapperRef.current?.parentElement) {
        const paddingBottom = parseFloat(window.getComputedStyle(listWrapperRef.current.parentElement).paddingBottom);

        setWrapperHeight(listWrapperRef.current.parentElement.clientHeight - target.offsetTop - paddingBottom);
      }
    });

    if (observedElement) {
      resizeObserver.observe(observedElement);
    }

    return () => {
      if (observedElement) {
        resizeObserver.unobserve(observedElement);
      }
    };
  }, []);

  const {
    isFetched,
    isLoading,
    users,
    totalRecords,
  } = useUsersQuery(
    { query: getPatronDuplicatesQuery({ email }) },
    { enabled: Boolean(email) },
  );

  const paneSub = isFetched
    ? (
      <FormattedMessage
        id="stripes-smart-components.searchResultsCountHeader"
        values={{ count: totalRecords }}
      />
    )
    : <FormattedMessage id="stripes-smart-components.searchCriteria" />;

  return (
    <Paneset isRoot>
      <Pane
        id="pane-user-duplicates"
        defaultWidth="100%"
        renderHeader={() => (
          <PaneHeader
            dismissible
            onClose={onClose}
            paneTitle={<FormattedMessage id="ui-users.stagingRecords.duplicates.results.paneTitle" />}
            paneSub={paneSub}
          />
        )}
      >
        <MessageBanner type="warning">
          <FormattedMessage id="ui-users.stagingRecords.duplicates.results.warning" />
        </MessageBanner>

        <div
          ref={listWrapperRef}
          style={{ height: wrapperHeight }}
        >
          <PreRegistrationRecordsDuplicatesList
            isLoading={isLoading}
            email={email}
            users={users}
            totalRecords={totalRecords}
          />
        </div>
      </Pane>
    </Paneset>
  );
};

PatronPreRegistrationRecordsDuplicates.propTypes = {
  email: PropTypes.string,
  onClose: PropTypes.func.isRequired,
};

export default PatronPreRegistrationRecordsDuplicates;

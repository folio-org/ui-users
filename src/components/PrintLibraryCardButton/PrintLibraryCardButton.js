import { useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, useIntl } from 'react-intl';
import { cloneDeep } from 'lodash';
import moment from 'moment';

import {
  Button,
  Icon,
  exportToCsv,
} from '@folio/stripes/components';

const PrintLibraryCardButton = ({ user, patronGroup }) => {
  const intl = useIntl();
  const onlyFields = useMemo(() => [
    {
      label: intl.formatMessage({ id: 'ui-users.information.barcode' }),
      value: 'barcode'
    },
    {
      label: intl.formatMessage({ id: 'ui-users.information.firstName' }),
      value: 'personal.firstName'
    },
    {
      label: intl.formatMessage({ id: 'ui-users.information.middleName' }),
      value: 'personal.middleName'
    },
    {
      label: intl.formatMessage({ id: 'ui-users.information.lastName' }),
      value: 'personal.lastName'
    },
    {
      label: intl.formatMessage({ id: 'ui-users.information.patronGroup' }),
      value: 'patronGroup'
    },
    {
      label: intl.formatMessage({ id: 'ui-users.information.expirationDate' }),
      value: 'expirationDate'
    },
  ], [intl]);

  const updateUserForExport = useCallback(() => {
    const { personal, expirationDate } = user;
    const modifiedUser = cloneDeep(user);
    modifiedUser.patronGroup = patronGroup;
    modifiedUser.personal.firstName = personal.preferredFirstName || personal.firstName;
    modifiedUser.expirationDate = expirationDate ? moment(expirationDate).format('MM/DD/YYYY') : '';
    return modifiedUser;
  }, [user, patronGroup]);

  const exportUserDetails = () => {
    const exportOptions = {
      onlyFields,
      filename: `${user.barcode}`
    };
    const data = [updateUserForExport()];

    exportToCsv(data, exportOptions);
  };

  const handlePrintLibraryCard = () => {
    // this method should export
    // 1. user details
    // 2. TODO: user profile picture if profile picture config is enabled for tenant
    //    and user has one image against his profile
    exportUserDetails();
  };

  return (
    <Button
      data-testid="print-library-card"
      buttonStyle="dropdownItem"
      onClick={handlePrintLibraryCard}
    >
      <Icon icon="print">
        <FormattedMessage id="ui-users.printLibraryCard" />
      </Icon>
    </Button>
  );
};

PrintLibraryCardButton.propTypes = {
  user: PropTypes.object,
  patronGroup: PropTypes.string,
};
export default PrintLibraryCardButton;

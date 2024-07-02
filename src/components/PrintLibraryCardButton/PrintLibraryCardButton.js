import { FormattedMessage } from 'react-intl';

import { Button, Icon } from '@folio/stripes/components';

const PrintLibraryCardButton = () => {
  const handlePrintLibraryCard = () => {
    // TODO:
    // this method should export
    // 1. user details
    // 2. user profile picture if profile picture config is enabled for tenant
    //    and user has one image against his profile
  };

  return (
    <Button
      buttonStyle="dropdownItem"
      onClick={handlePrintLibraryCard}
    >
      <Icon icon="print">
        <FormattedMessage id="ui-users.printLibraryCard" />
      </Icon>
    </Button>
  );
};

export default PrintLibraryCardButton;

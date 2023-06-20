import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import { Button } from '@folio/stripes/components';

const AffiliationsManagerTrigger = ({
  disabled,
  toggleModal,
}) => {
  return (
    <Button
      id="affiliations-manager-trigger"
      disabled={disabled}
      onClick={toggleModal}
    >
      <FormattedMessage id="ui-users.affiliations.section.action.edit" />
    </Button>
  );
};

AffiliationsManagerTrigger.propTypes = {
  disabled: PropTypes.bool,
  toggleModal: PropTypes.func.isRequired,
};

export default AffiliationsManagerTrigger;

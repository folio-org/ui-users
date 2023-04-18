import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import {
  Button,
  Layout,
} from '@folio/stripes/components';

const AffiliationsManagerModalFooter = ({
  onCancel,
  onSubmit,
  totalSelected,
}) => {
  return (
    <Layout className="display-flex justified full">
      <Button
        id="clickable-affiliations-manager-modal-cancel"
        onClick={onCancel}
        marginBottom0
      >
        <FormattedMessage id="ui-users.cancel" />
      </Button>

      <div>
        <FormattedMessage
          id="ui-users.affiliations.manager.modal.totalSelected"
          values={{ count: totalSelected }}
        />
      </div>

      <Button
        id="clickable-affiliations-manager-modal-submit"
        marginBottom0
        buttonStyle="primary"
        onClick={onSubmit}
      >
        <FormattedMessage id="ui-users.saveAndClose" />
      </Button>
    </Layout>
  );
};

AffiliationsManagerModalFooter.propTypes = {
  onCancel: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  totalSelected: PropTypes.number.isRequired,
};

export default AffiliationsManagerModalFooter;

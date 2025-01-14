import PropTypes from 'prop-types';
import {
  useCallback,
  useMemo,
} from 'react';
import {
  FormattedMessage,
  useIntl,
} from 'react-intl';

import { Selection } from '@folio/stripes/components';

import { affiliationsShape } from '../../shapes';

const AffiliationsSelect = ({
  id = 'user-assigned',
  affiliations,
  value,
  onChange,
  isLoading,
}) => {
  const intl = useIntl();

  const dataOptions = useMemo(() => (
    affiliations?.map(({ tenantId, tenantName, isPrimary }) => {
      const label = [
        tenantName,
        isPrimary && intl.formatMessage({ id: 'ui-users.affiliations.primary.label' }),
      ]
        .filter(Boolean)
        .join(' ');

      return {
        value: tenantId,
        label,
      };
    })
  ), [affiliations, intl]);

  const handleChange = useCallback((_value) => {
    onChange(_value);
  }, [onChange]);

  return (
    <Selection
      id={`${id}-affiliations-select`}
      label={<FormattedMessage id="ui-users.affiliations.select.label" />}
      dataOptions={dataOptions}
      onChange={handleChange}
      value={value}
      disabled={isLoading}
    />
  );
};

AffiliationsSelect.propTypes = {
  affiliations: affiliationsShape,
  onChange: PropTypes.func.isRequired,
  id: PropTypes.string,
  isLoading: PropTypes.bool,
  value: PropTypes.string.isRequired,
};

export default AffiliationsSelect;

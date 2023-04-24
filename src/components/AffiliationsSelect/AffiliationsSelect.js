import PropTypes from 'prop-types';
import {
  useCallback,
  useMemo,
} from 'react';
import { useIntl } from 'react-intl';

import { Select } from '@folio/stripes/components';

import { affiliationsShape } from '../../shapes';

const AffiliationsSelect = ({
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

  const handleChange = useCallback(({ target: { value: _value } }) => {
    onChange(_value);
  }, [onChange]);

  return (
    <Select
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
  isLoading: PropTypes.bool,
  value: PropTypes.string.isRequired,
};

export default AffiliationsSelect;

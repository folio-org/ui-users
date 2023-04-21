import PropTypes from 'prop-types';
import {
  useCallback,
  useMemo,
  useState,
} from 'react';
import { useIntl } from 'react-intl';

import { Select } from '@folio/stripes/components';
import { useStripes } from '@folio/stripes/core';

import { affiliationsShape } from '../../shapes';

const AffiliationsSelect = ({
  affiliations,
  onChange,
  isLoading,
}) => {
  const stripes = useStripes();
  const intl = useIntl();
  const [current, setValue] = useState(stripes.okapi.tenant);

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

  const handleChange = useCallback(({ target: { value } }) => {
    setValue(value);
    onChange(value);
  }, [onChange]);

  return (
    <Select
      dataOptions={dataOptions}
      onChange={handleChange}
      value={current}
      disabled={isLoading}
    />
  );
};

AffiliationsSelect.propTypes = {
  affiliations: affiliationsShape,
  onChange: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
};

export default AffiliationsSelect;

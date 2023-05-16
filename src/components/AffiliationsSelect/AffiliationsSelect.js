import PropTypes from 'prop-types';
import {
  useCallback,
  useMemo,
} from 'react';
import { useIntl } from 'react-intl';

import {
  Select,
  Selection,
} from '@folio/stripes/components';

import { affiliationsShape } from '../../shapes';

const AffiliationsSelect = ({
  id,
  affiliations,
  value,
  onChange,
  isLoading,
  selection,
}) => {
  const intl = useIntl();
  const Component = selection ? Selection : Select;

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

  const handleChange = useCallback((data) => {
    const result = selection ? data : data.target.value;
    onChange(result);
  }, [onChange, selection]);

  return (
    <Component
      id={`${id}-affiliations-select`}
      dataOptions={dataOptions}
      onChange={handleChange}
      value={value}
      disabled={isLoading}
    />
  );
};

AffiliationsSelect.defaultProps = {
  id: 'user-assigned',
  selection: false,
};

AffiliationsSelect.propTypes = {
  affiliations: affiliationsShape,
  onChange: PropTypes.func.isRequired,
  id: PropTypes.string,
  isLoading: PropTypes.bool,
  value: PropTypes.string.isRequired,
  selection: PropTypes.bool,
};

export default AffiliationsSelect;

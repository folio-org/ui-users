import React from 'react';
import PropTypes from 'prop-types';
import { Field } from 'redux-form';
import { Row, Col } from '@folio/stripes-components/lib/LayoutGrid';
import Select from '@folio/stripes-components/lib/Select';
import RadioButtonGroup from '@folio/stripes-components/lib/RadioButtonGroup';
import RadioButton from '@folio/stripes-components/lib/RadioButton';
import Datepicker from '@folio/stripes-components/lib/Datepicker';
import { Accordion } from '@folio/stripes-components/lib/Accordion';
import TextField from '@folio/stripes-components/lib/TextField';
import AddressEditList from '@folio/stripes-components/lib/structures/AddressFieldGroup/AddressEdit/AddressEditList';


import { toAddressTypeOptions } from '../../../converters/address_type';
import { getFullName } from '../../../util';
import { countriesOptions } from '../../../data/countries';
import Autocomplete from '../../Autocomplete';

import ProxyEditList from '../../ProxyGroup/ProxyEditList';
import ProxyEditItem from '../../ProxyGroup/ProxyEditItem';

const ProxySection = (props) => {

  const { expanded, onToggle, accordionId, parentResources, initialValues } = props;

  return (
    <Accordion
      open={expanded}
      id={accordionId}
      onToggle={onToggle}
      label={
        <h2>Proxy</h2>
      }
    >
      {initialValues.id &&
        <div>
          <ProxyEditList itemComponent={ProxyEditItem} label="Sponsors" name="sponsors" {...props} />
          <br />
          <ProxyEditList itemComponent={ProxyEditItem} label="Proxy" name="proxies" {...props} />
        </div>
      }
    </Accordion>
  );
};

ProxySection.propTypes = {
  expanded: PropTypes.bool,
  onToggle: PropTypes.func,
  accordionId: PropTypes.string.isRequired,
};

export default ProxySection;

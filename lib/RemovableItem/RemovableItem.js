import React from 'react';
import PropTypes from 'prop-types';
import {
  Accordion,
  FilterAccordionHeader,
} from '@folio/stripes-components/lib/Accordion';

import css from './RemovableItem.css';

export default class Proxies extends React.Component {
  static propTypes = {
    onRemove: PropTypes.func,
    headerLink: PropTypes.func,
  };

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Accordion
        header={FilterAccordionHeader}

        open={false}
        label={`First Name`}
      >

      hello...

      </Accordion>
    );
  }


};
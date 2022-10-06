import React from 'react';
import PropTypes from 'prop-types';
import {
  FormattedMessage,
} from 'react-intl';

import {
  Accordion,
  AccordionSet,
  FilterAccordionHeader,
} from '@folio/stripes/components';
import {
  CheckboxFilter,
} from '@folio/stripes/smart-components';

import {
  itemStatuses,
} from '../../../../../constants';
import {
  ACTUAL_COST_RECORD_FIELD_NAME,
  ACTUAL_COST_RECORD_FIELD_PATH,
  ITEM_STATUSES_TRANSLATIONS_KEYS,
} from '../../../constants';

const statusFilter = [
  {
    label: ITEM_STATUSES_TRANSLATIONS_KEYS[itemStatuses.AGED_TO_LOST],
    value: itemStatuses.AGED_TO_LOST,
  },
  {
    label: ITEM_STATUSES_TRANSLATIONS_KEYS[itemStatuses.DECLARED_LOST],
    value: itemStatuses.DECLARED_LOST,
  },
];

class Filters extends React.Component {
  static propTypes = {
    activeFilters: PropTypes.object,
    onChangeHandlers: PropTypes.shape({
      clearGroup: PropTypes.func.isRequired,
      state: PropTypes.func.isRequired,
    }).isRequired,
    resultOffset: PropTypes.shape({
      replace: PropTypes.func.isRequired,
    }).isRequired,
  };

  static defaultProps = {
    activeFilters: {},
  }

  getStaticFilterValues = (items) => {
    return items.map(({ label, value }) => ({
      label: <FormattedMessage id={label} />,
      value,
    }));
  };

  handleFilterChange = (filter) => {
    const {
      activeFilters,
      onChangeHandlers,
      resultOffset,
    } = this.props;

    if (resultOffset) {
      resultOffset.replace(0);
    }

    onChangeHandlers.state({
      ...activeFilters,
      [filter.name]: filter.values
    });
  };

  render() {
    const {
      activeFilters,
      onChangeHandlers: {
        clearGroup,
      },
    } = this.props;
    const {
      lossType = [],
    } = activeFilters;

    return (
      <AccordionSet>
        <Accordion
          id="lossTypeFilterAccordion"
          data-testid="lossTypeFilterAccordion"
          displayClearButton
          header={FilterAccordionHeader}
          label={<FormattedMessage id="ui-users.lostItems.list.filters.lossType" />}
          separator={false}
          onClearFilter={() => clearGroup(ACTUAL_COST_RECORD_FIELD_PATH[ACTUAL_COST_RECORD_FIELD_NAME.LOSS_TYPE])}
        >
          <CheckboxFilter
            dataOptions={this.getStaticFilterValues(statusFilter)}
            name={ACTUAL_COST_RECORD_FIELD_PATH[ACTUAL_COST_RECORD_FIELD_NAME.LOSS_TYPE]}
            selectedValues={lossType}
            onChange={this.handleFilterChange}
          />
        </Accordion>
      </AccordionSet>
    );
  }
}

export default Filters;

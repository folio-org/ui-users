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
  ITEM_LOSS_TYPES_TRANSLATIONS_KEYS,
  LOST_ITEM_STATUS_FILTER_TRANSLATIONS_KEYS,
  LOST_ITEM_STATUSES,
} from '../../../constants';

const filtersList = [
  {
    filters: [
      {
        label: ITEM_LOSS_TYPES_TRANSLATIONS_KEYS[itemStatuses.AGED_TO_LOST],
        value: itemStatuses.AGED_TO_LOST,
      },
      {
        label: ITEM_LOSS_TYPES_TRANSLATIONS_KEYS[itemStatuses.DECLARED_LOST],
        value: itemStatuses.DECLARED_LOST,
      },
    ],
    id: 'lossTypeFilterAccordion',
    label: <FormattedMessage id="ui-users.lostItems.list.filters.lossType" />,
    filterPath: ACTUAL_COST_RECORD_FIELD_PATH[ACTUAL_COST_RECORD_FIELD_NAME.LOSS_TYPE],
  },
  {
    filters: [
      {
        label: LOST_ITEM_STATUS_FILTER_TRANSLATIONS_KEYS[LOST_ITEM_STATUSES.OPEN],
        value: LOST_ITEM_STATUSES.OPEN,
      },
      {
        label: LOST_ITEM_STATUS_FILTER_TRANSLATIONS_KEYS[LOST_ITEM_STATUSES.BILLED],
        value: LOST_ITEM_STATUSES.BILLED,
      },
      {
        label: LOST_ITEM_STATUS_FILTER_TRANSLATIONS_KEYS[LOST_ITEM_STATUSES.CANCELLED],
        value: LOST_ITEM_STATUSES.CANCELLED,
      },
      {
        label: LOST_ITEM_STATUS_FILTER_TRANSLATIONS_KEYS[LOST_ITEM_STATUSES.EXPIRED],
        value: LOST_ITEM_STATUSES.EXPIRED,
      },
    ],
    id: 'statusFilterAccordion',
    label: <FormattedMessage id="ui-users.lostItems.list.filters.status" />,
    filterPath: ACTUAL_COST_RECORD_FIELD_PATH[ACTUAL_COST_RECORD_FIELD_NAME.STATUS],
  }
];

class Filters extends React.Component {
  static propTypes = {
    activeFilters: PropTypes.shape({}),
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

    return (
      <AccordionSet>
        {
          filtersList.map(({
            id,
            label,
            filterPath,
            filters,
          }) => (
            <Accordion
              key={id}
              id={id}
              data-testid={id}
              displayClearButton
              header={FilterAccordionHeader}
              label={label}
              separator={false}
              onClearFilter={() => clearGroup(filterPath)}
            >
              <CheckboxFilter
                dataOptions={this.getStaticFilterValues(filters)}
                name={filterPath}
                selectedValues={activeFilters[filterPath]}
                onChange={this.handleFilterChange}
              />
            </Accordion>
          ))
        }
      </AccordionSet>
    );
  }
}

export default Filters;

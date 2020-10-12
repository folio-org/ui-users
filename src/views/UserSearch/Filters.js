import React from 'react';
import PropTypes from 'prop-types';
import {
  FormattedMessage,
  injectIntl,
} from 'react-intl';
import {
  get,
  sortBy,
} from 'lodash';

import {
  Accordion,
  AccordionSet,
  FilterAccordionHeader,
} from '@folio/stripes/components';

import {
  CheckboxFilter,
  MultiSelectionFilter,
} from '@folio/stripes/smart-components';

import { statusFilter } from '../../constants';

class Filters extends React.Component {
  static propTypes = {
    activeFilters: PropTypes.object,
    intl: PropTypes.shape({
      formatMessage: PropTypes.func.isRequired,
    }).isRequired,
    resources: PropTypes.object.isRequired,
    onChangeHandlers: PropTypes.object.isRequired,
    resultOffset: PropTypes.shape({
      replace: PropTypes.func.isRequired,
    }),
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

  getValuesFromResources = (type, labelKey, valueKey) => {
    const items = get(this.props.resources, `${type}.records`, [])
      .map(item => ({ label: item[labelKey], value: item[valueKey] }));
    return sortBy(items, 'label');
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
      activeFilters: {
        active = [],
        pg = [],
        tags = [],
        departments = [],
      },
      onChangeHandlers: { clearGroup },
      intl: { formatMessage },
      resources,
    } = this.props;

    const departmentsAreNotEmpty = !!resources.departments?.records?.length;

    return (
      <AccordionSet>
        <Accordion
          displayClearButton
          id="users-filter-accordion-status"
          header={FilterAccordionHeader}
          label={formatMessage({ id: 'ui-users.status' })}
          separator={false}
          onClearFilter={() => clearGroup('active')}
        >
          <CheckboxFilter
            dataOptions={this.getStaticFilterValues(statusFilter)}
            name="active"
            selectedValues={active}
            onChange={this.handleFilterChange}
          />
        </Accordion>
        <Accordion
          displayClearButton
          id="users-filter-accordion-patron-group"
          header={FilterAccordionHeader}
          label={formatMessage({ id: 'ui-users.information.patronGroup' })}
          separator={false}
          onClearFilter={() => clearGroup('pg')}
        >
          <CheckboxFilter
            dataOptions={this.getValuesFromResources('patronGroups', 'group', 'group')}
            name="pg"
            selectedValues={pg}
            onChange={this.handleFilterChange}
          />
        </Accordion>
        {departmentsAreNotEmpty && (
          <Accordion
            displayClearButton
            id="users-filter-accordion-departments"
            header={FilterAccordionHeader}
            label={formatMessage({ id: 'ui-users.departments' })}
            separator={false}
            onClearFilter={() => clearGroup('departments')}
          >
            <MultiSelectionFilter
              id="departments-filter"
              dataOptions={this.getValuesFromResources('departments', 'name', 'id')}
              name="departments"
              selectedValues={departments}
              onChange={this.handleFilterChange}
            />
          </Accordion>
        )}
        <Accordion
          displayClearButton
          id="users-filter-accordion-tags"
          header={FilterAccordionHeader}
          label={formatMessage({ id: 'ui-users.tags' })}
          separator={false}
          onClearFilter={() => clearGroup('tags')}
        >
          <MultiSelectionFilter
            dataOptions={this.getValuesFromResources('tags', 'label', 'label')}
            name="tags"
            selectedValues={tags}
            onChange={this.handleFilterChange}
          />
        </Accordion>
      </AccordionSet>
    );
  }
}

export default injectIntl(Filters);

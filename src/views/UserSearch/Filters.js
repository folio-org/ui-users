import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
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

export default class Filters extends React.Component {
  static propTypes = {
    activeFilters: PropTypes.object,
    resources: PropTypes.object.isRequired,
    onChangeHandlers: PropTypes.object.isRequired,
  };

  static defaultProps = {
    activeFilters: {},
  }

  getStaticFilterValues = (items) => {
    return items.map(item => ({ label: item, value: item }));
  };

  getValuesFromResources = (type, key, sortByKey = false) => {
    const items = get(this.props.resources, `${type}.records`, [])
      .map(item => ({ label: item[key], value: item[key] }));

    return sortByKey ? sortBy(items, key) : items;
  };

  parseActiveFilters = () => {
    const { string: queryString } = this.props.activeFilters;

    if (!queryString) {
      return {};
    }

    return queryString
      .split(',')
      .reduce((filterMap, currentFilter) => {
        const [name, value] = currentFilter.split('.');

        if (!Array.isArray(filterMap[name])) {
          filterMap[name] = [];
        }

        filterMap[name].push(value);

        return filterMap;
      }, {});
  };

  handleFilterChange = (group) => {
    const {
      activeFilters,
      onChangeHandlers,
    } = this.props;

    onChangeHandlers.state({
      ...activeFilters,
      [group.name]: group.values
    });
  };

  render() {
    const {
      onChangeHandlers: { clearGroup },
    } = this.props;

    const {
      active = [],
      pg = [],
      tags = [],
    } = this.parseActiveFilters();

    return (
      <AccordionSet>
        <Accordion
          displayClearButton
          id="users-filter-accordion-status"
          header={FilterAccordionHeader}
          label={<FormattedMessage id="ui-users.status" />}
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
          label={<FormattedMessage id="ui-users.information.patronGroup" />}
          separator={false}
          onClearFilter={() => clearGroup('pg')}
        >
          <CheckboxFilter
            dataOptions={this.getValuesFromResources('patronGroups', 'group')}
            name="pg"
            selectedValues={pg}
            onChange={this.handleFilterChange}
          />
        </Accordion>
        <Accordion
          displayClearButton
          id="users-filter-accordion-tags"
          header={FilterAccordionHeader}
          label={<FormattedMessage id="ui-users.tags" />}
          separator={false}
          onClearFilter={() => clearGroup('tags')}
        >
          <MultiSelectionFilter
            dataOptions={this.getValuesFromResources('tags', 'label', true)}
            name="tags"
            selectedValues={tags}
            onChange={this.handleFilterChange}
          />
        </Accordion>
      </AccordionSet>
    );
  }
}

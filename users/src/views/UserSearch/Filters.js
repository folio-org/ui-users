import React from 'react';
import PropTypes from 'prop-types';
import {
  FormattedMessage,
  injectIntl,
} from 'react-intl';
import {
  get,
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

import CustomFieldsFilters from '../../components/CustomFieldsFilters';

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

  /**
   * Helper for formatting resource records information for <MultiSelection> component
   *
   * @param {String} type - resource type
   * @param {String} labelKey - propery of resource record that will serve as an option label
   * @param {String} valueKey - property of resource record that will serve as an option value.
   * Will be passed to search request query parameter string as a value.
   * @returns {Array} - an array of data options for <MultiSelection> component.
   */
  getValuesFromResources = (type, labelKey, valueKey) => {
    const items = get(this.props.resources, `${type}.records`, [])
      .map(item => ({ label: item[labelKey], value: item[valueKey] }));
    return items.sort((a, b) => a.label.localeCompare((b.label)));
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
      onChangeHandlers: { clearGroup },
      intl: { formatMessage },
      resources,
    } = this.props;
    const {
      active = [],
      pg = [],
      tags = [],
      departments = [],
    } = activeFilters;

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
            dataOptions={this.getValuesFromResources('patronGroups', 'group', 'id')}
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
            aria-labelledby="users-filter-accordion-tags"
          />
        </Accordion>

        <CustomFieldsFilters
          activeFilters={activeFilters}
          clearGroup={clearGroup}
          onChange={this.handleFilterChange}
        />
      </AccordionSet>
    );
  }
}

export default injectIntl(Filters);

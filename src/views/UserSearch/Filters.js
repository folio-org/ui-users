import React from 'react';
import PropTypes from 'prop-types';
import {
  FormattedMessage,
  injectIntl,
} from 'react-intl';
import { get } from 'lodash';

import {
  Accordion,
  AccordionSet,
  FilterAccordionHeader,
} from '@folio/stripes/components';
import { stripesConnect } from '@folio/stripes/core';
import {
  CheckboxFilter,
  MultiSelectionFilter,
} from '@folio/stripes/smart-components';

import CustomFieldsFilters from '../../components/CustomFieldsFilters';
import { isConsortiumEnabled } from '../../components/util';
import { USER_TYPES, statusFilter } from '../../constants';

const ACCORDION_ID_PREFIX = 'users-filter-accordion';

class Filters extends React.Component {
  static propTypes = {
    activeFilters: PropTypes.shape({}),
    intl: PropTypes.shape({
      formatMessage: PropTypes.func.isRequired,
    }).isRequired,
    resources: PropTypes.shape({}).isRequired,
    onChangeHandlers: PropTypes.shape({}).isRequired,
    resultOffset: PropTypes.shape({
      replace: PropTypes.func.isRequired,
    }),
    stripes: PropTypes.shape({}).isRequired,
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
      stripes,
    } = this.props;
    const {
      active = [],
      pg = [],
      tags = [],
      departments = [],
      userType,
    } = activeFilters;

    const departmentsAreNotEmpty = !!resources.departments?.records?.length;

    const isConsortium = isConsortiumEnabled(stripes);
    const { PATRON, SHADOW, STAFF, SYSTEM, DCB } = USER_TYPES;
    const userTypeOptions = [
      {
        value: PATRON,
        label: formatMessage({ id: 'ui-users.information.userType.patron' }),
      },
      {
        value: STAFF,
        label: formatMessage({ id: 'ui-users.information.userType.staff' }),
      },
      {
        value: SHADOW,
        label: formatMessage({ id: 'ui-users.information.userType.shadow' }),
      },
      {
        value: SYSTEM,
        label: formatMessage({ id: 'ui-users.information.userType.system' }),
      },
      {
        value: DCB,
        label: formatMessage({ id: 'ui-users.information.userType.dcb' }),
      }
    ];

    return (
      <AccordionSet>
        <Accordion
          displayClearButton
          id={`${ACCORDION_ID_PREFIX}-status`}
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
          id={`${ACCORDION_ID_PREFIX}-patron-group`}
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
            id={`${ACCORDION_ID_PREFIX}-departments`}
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
          id={`${ACCORDION_ID_PREFIX}-tags`}
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
        {
          isConsortium && (
            <Accordion
              displayClearButton
              id={`${ACCORDION_ID_PREFIX}-user-types`}
              header={FilterAccordionHeader}
              label={formatMessage({ id: 'ui-users.userType' })}
              separator={false}
              onClearFilter={() => clearGroup('userType')}
            >
              <CheckboxFilter
                dataOptions={userTypeOptions}
                name="userType"
                selectedValues={userType}
                onChange={this.handleFilterChange}
              />
            </Accordion>
          )
        }

        <CustomFieldsFilters
          activeFilters={activeFilters}
          clearGroup={clearGroup}
          onChange={this.handleFilterChange}
        />
      </AccordionSet>
    );
  }
}

export default stripesConnect(injectIntl(Filters));

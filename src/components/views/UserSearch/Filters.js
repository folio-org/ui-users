import React, { Fragment } from 'react';
import PropTypes from 'prop-types';

import {
  FilterGroups,
  Accordion,
} from '@folio/stripes/components';

import { MultiSelectionFilter } from '@folio/stripes/smart-components';

export default class Filters extends React.Component {
  static propTypes = {
    activeFilters: PropTypes.object,
    onChangeHandlers: PropTypes.object.isRequired,
    config: PropTypes.arrayOf(PropTypes.object),
  };

  static defaultProps = {
    activeFilters: {},
  }

  getTagsOptions() {
    return this.props.tags.map(tag => {
      return { label: tag.label, value: tag.label };
    });
  }

  render() {
    const {
      activeFilters,
      onChangeHandlers: { checkbox, clearGroup, state },
      config,
    } = this.props;

    const groupFilters = {};
    activeFilters.string.split(',').forEach(m => { groupFilters[m] = true; });

    return (
      <Fragment>
        <Accordion>
          <MultiSelectionFilter
            name="tags"
            selectedValues={activeFilters.state.tags}
            dataOptions={this.getTagsOptions()}
            onChange={filter => { state({ [filter.name]: filter.values }) }}
          />
        </Accordion>
        <FilterGroups
          config={config.filter(({ name }) => name !== 'tags')}
          filters={groupFilters}
          onChangeFilter={checkbox}
          onClearFilter={clearGroup}
        />
      </Fragment>
    );
  }
}

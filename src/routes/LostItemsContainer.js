import React from 'react';
import PropTypes from 'prop-types';

import {
  stripesConnect,
} from '@folio/stripes/core';
import {
  makeQueryFunction,
  StripesConnectedSource,
  buildUrl,
} from '@folio/stripes/smart-components';

import {
  LostItemsListContainer,
  NoPermissionMessage,
} from '../views/LostItems';
import {
  ACTUAL_COST_RECORD_FIELD_NAME,
  ACTUAL_COST_RECORD_FIELD_PATH,
  PAGE_AMOUNT,
  SEARCH_FIELDS,
} from '../views/LostItems/constants';
import { buildFilterConfig } from './utils';

const filterConfig = [
  {
    name: ACTUAL_COST_RECORD_FIELD_PATH[ACTUAL_COST_RECORD_FIELD_NAME.LOSS_TYPE],
    cql: ACTUAL_COST_RECORD_FIELD_PATH[ACTUAL_COST_RECORD_FIELD_NAME.LOSS_TYPE],
    values: [],
  },
];

function buildQuery(queryParams, pathComponents, resourceData, logger, props) {
  const customFilterConfig = buildFilterConfig(queryParams.filters);
  const getCql = makeQueryFunction(
    'cql.allRecords=1',
    SEARCH_FIELDS.map(index => `${index}=="*%{query.query}*"`).join(' or '),
    {
      [ACTUAL_COST_RECORD_FIELD_NAME.USER]: `${ACTUAL_COST_RECORD_FIELD_PATH[ACTUAL_COST_RECORD_FIELD_NAME.USER_LAST_NAME]} ${ACTUAL_COST_RECORD_FIELD_PATH[ACTUAL_COST_RECORD_FIELD_NAME.USER_FIRST_NAME]}`,
    },
    [...filterConfig, ...customFilterConfig],
    2,
  );
  let cql = getCql(queryParams, pathComponents, resourceData, logger, props);
  const statusQueryParam = 'status=="Open"';

  if (cql) {
    cql = `(${statusQueryParam}) and ${cql}`;
  }

  return cql;
}

class LostItemsContainer extends React.Component {
  static manifest = Object.freeze({
    query: {
      initialValue: {},
    },
    resultCount: {
      initialValue: PAGE_AMOUNT,
    },
    resultOffset: {
      initialValue: 0,
    },
    records: {
      type: 'okapi',
      records: 'actualCostRecords',
      resultOffset: '%{resultOffset}',
      perRequest: PAGE_AMOUNT,
      path: 'actual-cost-record-storage/actual-cost-records',
      GET: {
        params: {
          query: buildQuery,
        },
      },
    },
    billedRecord: {
      type: 'okapi',
      fetch: false,
      throwErrors: false,
      clientGeneratePk: false,
      POST: {
        path: 'actual-cost-fee-fine/bill',
      },
    },
  });

  static propTypes = {
    location: PropTypes.object,
    history: PropTypes.object,
    resources: PropTypes.shape({
      query: PropTypes.object,
      records: PropTypes.object,
    }).isRequired,
    mutator: PropTypes.shape({
      records: PropTypes.shape({
        POST: PropTypes.func.isRequired,
      }).isRequired,
      query: PropTypes.shape({
        update: PropTypes.func.isRequired,
        replace: PropTypes.func.isRequired,
      }).isRequired,
      resultOffset: PropTypes.shape({
        replace: PropTypes.func.isRequired,
      }).isRequired,
    }).isRequired,
    stripes: PropTypes.shape({
      logger: PropTypes.object.isRequired,
      hasPerm: PropTypes.func.isRequired,
    }).isRequired,
  }

  constructor(props) {
    super(props);

    this.state = {
      billedRecords: [],
    };
  }

  componentDidMount() {
    this.source = new StripesConnectedSource(this.props, this.props.stripes.logger);
  }

  componentDidUpdate() {
    this.source.update(this.props);
  }

  addBilledRecord = (record) => {
    this.setState((prevState) => ({
      billedRecords: [...prevState.billedRecords, record],
    }));
  }

  onNeedMoreData = (askAmount, index) => {
    const {
      resultOffset,
    } = this.props.mutator;

    if (this.source) {
      if (resultOffset && index >= 0) {
        this.source.fetchOffset(index);
      } else {
        this.source.fetchMore(PAGE_AMOUNT);
      }
    }
  };

  querySetter = ({ nsValues, state }) => {
    const {
      location,
      location: {
        pathname,
        search,
      },
      history,
      mutator: {
        resultOffset,
      },
    } = this.props;

    if (nsValues.query) {
      nsValues.query = nsValues.query.replace('*', '');
    }

    if (state.sortChanged) {
      resultOffset.replace(0);
    }

    const url = buildUrl(location, nsValues);

    if (`${pathname}${search}` !== url) {
      history.push(url);
    }
  }

  queryGetter = () => {
    return this.props?.resources?.query ?? {};
  }

  render() {
    const hasPermission = this.props.stripes.hasPerm('ui-users.lost-items.requiring-actual-cost');

    if (!hasPermission) {
      return (
        <NoPermissionMessage />
      );
    }

    if (this.source) {
      this.source.update(this.props);
    }

    return (
      <LostItemsListContainer
        source={this.source}
        onNeedMoreData={this.onNeedMoreData}
        queryGetter={this.queryGetter}
        querySetter={this.querySetter}
        addBilledRecord={this.addBilledRecord}
        billedRecords={this.state.billedRecords}
        {...this.props}
      />
    );
  }
}

export default stripesConnect(LostItemsContainer);

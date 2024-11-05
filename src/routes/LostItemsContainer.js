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

import { LostItemsListContainer } from '../views/LostItems';
import NoPermissionMessage from '../components/NoPermissionMessage';
import {
  ACTUAL_COST_RECORD_FIELD_NAME,
  ACTUAL_COST_RECORD_FIELD_PATH,
  PAGE_AMOUNT,
  SEARCH_FIELDS,
  ACTUAL_COST_RECORD_NAME,
} from '../views/LostItems/constants';
import { buildFilterConfig } from './utils';

const filterConfig = [
  {
    name: ACTUAL_COST_RECORD_FIELD_PATH[ACTUAL_COST_RECORD_FIELD_NAME.LOSS_TYPE],
    cql: ACTUAL_COST_RECORD_FIELD_PATH[ACTUAL_COST_RECORD_FIELD_NAME.LOSS_TYPE],
    values: [],
  },
  {
    name: ACTUAL_COST_RECORD_FIELD_PATH[ACTUAL_COST_RECORD_FIELD_NAME.STATUS],
    cql: ACTUAL_COST_RECORD_FIELD_PATH[ACTUAL_COST_RECORD_FIELD_NAME.STATUS],
    values: [],
  },
];

function buildQuery(queryParams, pathComponents, resourceData, logger, props) {
  const customFilterConfig = buildFilterConfig(queryParams.filters);
  const mapFields = index => `${index}=="*%{query.query}*"`;
  const getCql = makeQueryFunction(
    'cql.allRecords=1',
    SEARCH_FIELDS.map(mapFields).join(' or '),
    {
      [ACTUAL_COST_RECORD_FIELD_NAME.USER]: `${ACTUAL_COST_RECORD_FIELD_PATH[ACTUAL_COST_RECORD_FIELD_NAME.USER_LAST_NAME]} ${ACTUAL_COST_RECORD_FIELD_PATH[ACTUAL_COST_RECORD_FIELD_NAME.USER_FIRST_NAME]}`,
    },
    [...filterConfig, ...customFilterConfig],
    2,
  );

  return getCql(queryParams, pathComponents, resourceData, logger, props);
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
    [ACTUAL_COST_RECORD_NAME]: {
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
    cancelledRecord: {
      type: 'okapi',
      fetch: false,
      throwErrors: false,
      clientGeneratePk: false,
      POST: {
        path: 'actual-cost-fee-fine/cancel',
      },
    },
  });

  static propTypes = {
    location: PropTypes.object,
    history: PropTypes.object,
    resources: PropTypes.shape({
      query: PropTypes.object,
      [ACTUAL_COST_RECORD_NAME]: PropTypes.object,
    }).isRequired,
    mutator: PropTypes.shape({
      [ACTUAL_COST_RECORD_NAME]: PropTypes.shape({
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
    okapi: PropTypes.shape({
      currentUser: PropTypes.shape({
        curServicePoint: PropTypes.shape({
          id: PropTypes.string,
        }).isRequired,
      }).isRequired,
    }).isRequired,
  }

  constructor(props) {
    super(props);

    this.state = {
      billedRecords: [],
      cancelledRecords: [],
      usersLocation: {
        pathname: props.location.state?.pathname,
        search: props.location.state?.search,
      },
    };
  }

  componentDidMount() {
    this.source = new StripesConnectedSource(this.props, this.props.stripes.logger, ACTUAL_COST_RECORD_NAME);
  }

  componentDidUpdate() {
    this.source.update(this.props, ACTUAL_COST_RECORD_NAME);
  }

  addBilledRecord = (record) => {
    this.setState((prevState) => ({
      billedRecords: [...prevState.billedRecords, record],
    }));
  }

  addCancelledRecord = (recordId) => {
    this.setState((prevState) => ({
      cancelledRecords: [...prevState.cancelledRecords, recordId],
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

  onClose = () => {
    const { history } = this.props;
    const { usersLocation } = this.state;

    if (usersLocation.pathname) {
      history.push(`${usersLocation.pathname}${usersLocation.search}`);
    } else {
      history.push('/users?sort=name');
    }
  }

  render() {
    const hasPermission = this.props.stripes.hasPerm('ui-users.lost-items.requiring-actual-cost.execute');

    if (!hasPermission) {
      return (
        <NoPermissionMessage id="ui-users.lostItems.message.noAccessToActualCostPage" />
      );
    }

    if (this.source) {
      this.source.update(this.props, ACTUAL_COST_RECORD_NAME);
    }

    return (
      <LostItemsListContainer
        source={this.source}
        onNeedMoreData={this.onNeedMoreData}
        queryGetter={this.queryGetter}
        querySetter={this.querySetter}
        addBilledRecord={this.addBilledRecord}
        billedRecords={this.state.billedRecords}
        addCancelledRecord={this.addCancelledRecord}
        cancelledRecords={this.state.cancelledRecords}
        resources={this.props.resources}
        mutator={this.props.mutator}
        okapi={this.props.okapi}
        onClose={this.onClose}
      />
    );
  }
}

export default stripesConnect(LostItemsContainer);

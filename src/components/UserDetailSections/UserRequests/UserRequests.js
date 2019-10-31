import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';
import queryString from 'query-string';
import {
  Accordion,
  Badge,
  Button,
  Icon,
  Headline,
  List
} from '@folio/stripes/components';
import {
  IfPermission,
  stripesConnect,
} from '@folio/stripes/core';

import {
  getOpenRequestStatusesFilterString,
  getClosedRequestStatusesFilterString,
} from '../../../util';

/**
 * User-details "Requests" accordion pane.
 *
 * Show links to the open- and closed-requests in the body; include the
 * number of open-requests in the preview.
 */
class UserRequests extends React.Component {
  // "limit=1" on the openRequestsCount and closedRequestsCount fields is a hack
  // to get at the "totalRecords" field without pulling down too much other
  // data. Instead we should be able to construct a query to retrieve this
  // metadata directly without pulling any item records.
  // see https://issues.folio.org/browse/FOLIO-773
  static manifest = Object.freeze({
    openRequestsCount: {
      type: 'okapi',
      GET: {
        path: 'request-storage/requests',
        params: {
          query: 'query=(requesterId==:{id}) and (status="Open")',
          limit: '1',
        },
      },
    },
    closedRequestsCount: {
      type: 'okapi',
      GET: {
        path: 'request-storage/requests',
        params: {
          query: 'query=(requesterId==:{id}) and (status="Closed")',
          limit: '1',
        },
      },
    },
    userid: {},
  });

  static propTypes = {
    accordionId: PropTypes.string,
    expanded: PropTypes.bool,
    match: PropTypes.shape({
      params: PropTypes.shape({
        id: PropTypes.string,
      }),
    }).isRequired,
    onToggle: PropTypes.func,
    resources: PropTypes.shape({
      openRequestsCount: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
      closedRequestsCount: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
    }),
    user: PropTypes.object,
    stripes: PropTypes.object,
  };

  renderLinkItem = (item, index) => {
    return (
      <li key={index}>
        <Link
          id={item.id}
          to={`/requests/?${queryString.stringify(item.query)}`}
        >
          <FormattedMessage id={item.formattedMessageId} values={{ count: item.count }} />
        </Link>
      </li>
    );
  }

  renderItem = (item, index) => {
    return (
      <li key={index}>
        <FormattedMessage id={item.formattedMessageId} values={{ count: item.count }} />
      </li>
    );
  }

  render() {
    const { stripes, expanded, onToggle, accordionId, user: { barcode }, resources } = this.props;
    const openRequestsTotal = _.get(resources.openRequestsCount, ['records', '0', 'totalRecords'], 0);
    const closedRequestsTotal = _.get(resources.closedRequestsCount, ['records', '0', 'totalRecords'], 0);
    const openRequestsCount = (_.get(resources.openRequestsCount, ['isPending'], true)) ? -1 : openRequestsTotal;
    const closedRequestsCount = (_.get(resources.closedRequestsCount, ['isPending'], true)) ? -1 : closedRequestsTotal;

    const requestsLoaded = openRequestsCount >= 0 && closedRequestsCount >= 0;
    const displayWhenClosed = requestsLoaded ? (<Badge>{openRequestsCount}</Badge>) : (<Icon icon="spinner-ellipsis" width="10px" />);
    const displayWhenOpen = (
      <IfPermission perm="ui-requests.all">
        <Button to={`/requests/?${queryString.stringify({
          layer: 'create',
          userBarcode: barcode,
        })}`}
        >
          <FormattedMessage id="ui-users.requests.createRequest" />
        </Button>
      </IfPermission>
    );

    const closedFilterString = getClosedRequestStatusesFilterString();
    const openFilterString = getOpenRequestStatusesFilterString();
    const itemFormatter = stripes.hasPerm('ui-requests.all') ?
      this.renderLinkItem :
      this.renderItem;

    return (
      <Accordion
        open={expanded}
        id={accordionId}
        onToggle={onToggle}
        label={<Headline size="large" tag="h3"><FormattedMessage id="ui-users.requests.title" /></Headline>}
        displayWhenClosed={displayWhenClosed}
        displayWhenOpen={displayWhenOpen}
      >
        {requestsLoaded ?
          <List
            listStyle="bullets"
            itemFormatter={itemFormatter}
            items={[
              {
                id: 'clickable-viewopenrequests',
                count: openRequestsCount,
                formattedMessageId: 'ui-users.requests.numOpenRequests',
                query: { query: barcode, filters: openFilterString },
              },
              {
                id: 'clickable-viewclosedrequests',
                count: closedRequestsCount,
                formattedMessageId: 'ui-users.requests.numClosedRequests',
                query: { query: barcode, filters: closedFilterString },
              },
            ]}
          /> : <Icon icon="spinner-ellipsis" width="10px" />
        }
      </Accordion>
    );
  }
}

export default stripesConnect(UserRequests);

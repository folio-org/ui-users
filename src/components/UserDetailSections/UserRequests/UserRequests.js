import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';
import queryString from 'query-string';
import flowRight from 'lodash/flowRight';

import {
  Accordion,
  Badge,
  Button,
  Icon,
  Headline,
  Row,
  List
} from '@folio/stripes/components';
import {
  IfPermission,
  stripesConnect,
} from '@folio/stripes/core';

import { withCustomFields } from '../../Wrappers';
import ViewCustomFieldsSection from '../ViewCustomFieldsSection';
import {
  getOpenRequestStatusesFilterString,
  getClosedRequestStatusesFilterString,
  getRequestUrl,
  isDcbUser,
} from '../../util';
import { CUSTOM_FIELDS_SECTION } from '../../../constants';

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
      fetch: false,
      throwErrors: false,
      accumulate: true,
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
      fetch: false,
      throwErrors: false,
      accumulate: true,
    },
    userid: {},
  });

  static propTypes = {
    accordionId: PropTypes.string,
    customFields: PropTypes.arrayOf(PropTypes.object).isRequired,
    expanded: PropTypes.bool,
    match: PropTypes.shape({
      params: PropTypes.shape({
        id: PropTypes.string,
      }),
    }).isRequired,
    mutator: PropTypes.shape({
      openRequestsCount: PropTypes.shape({
        GET: PropTypes.func.isRequired,
      }),
      closedRequestsCount: PropTypes.shape({
        GET: PropTypes.func.isRequired,
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
    showCustomFieldsSection: PropTypes.bool.isRequired,
    stripes: PropTypes.shape({
      hasPerm: PropTypes.func.isRequired,
      hasInterface: PropTypes.func.isRequired,
    }).isRequired,
  };

  componentDidMount() {
    const { mutator } = this.props;

    if (this.showRequests) {
      mutator.openRequestsCount.GET();
      mutator.closedRequestsCount.GET();
    }
  }

  hasViewRequestsPerm = this.props.stripes.hasPerm('ui-users.requests.all');
  hasRequestStorageInterface = !!this.props.stripes.hasInterface('request-storage', '2.5 3.0 4.0 5.0 6.0');
  hasCirculationInterface = !!this.props.stripes.hasInterface('circulation');
  showRequests = this.hasViewRequestsPerm && this.hasRequestStorageInterface && this.hasCirculationInterface;

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
    const {
      stripes,
      expanded,
      onToggle,
      accordionId,
      user,
      customFields,
      showCustomFieldsSection,
      resources
    } = this.props;
    const { barcode, id } = user;
    const openRequestsTotal = _.get(resources.openRequestsCount, ['records', '0', 'totalRecords'], 0);
    const closedRequestsTotal = _.get(resources.closedRequestsCount, ['records', '0', 'totalRecords'], 0);
    const openRequestsCount = (_.get(resources.openRequestsCount, ['isPending'], true)) ? -1 : openRequestsTotal;
    const closedRequestsCount = (_.get(resources.closedRequestsCount, ['isPending'], true)) ? -1 : closedRequestsTotal;

    const requestsLoaded = openRequestsCount >= 0 && closedRequestsCount >= 0;
    const displayWhenClosed = requestsLoaded ? (<Badge>{openRequestsCount}</Badge>) : (<Icon icon="spinner-ellipsis" width="10px" />);
    const createRequestUrl = getRequestUrl(barcode, id);
    const displayWhenOpen = (
      <IfPermission perm="ui-requests.all">
        <Button to={createRequestUrl}>
          <FormattedMessage id="ui-users.requests.createRequest" />
        </Button>
      </IfPermission>
    );

    const closedFilterString = getClosedRequestStatusesFilterString();
    const openFilterString = getOpenRequestStatusesFilterString();
    const itemFormatter = stripes.hasPerm('ui-requests.all') ?
      this.renderLinkItem :
      this.renderItem;

    if (!showCustomFieldsSection && !this.showRequests) {
      return null;
    }

    return (
      <Accordion
        open={expanded}
        id={accordionId}
        onToggle={onToggle}
        label={<Headline size="large" tag="h3"><FormattedMessage id="ui-users.requests.title" /></Headline>}
        displayWhenClosed={displayWhenClosed}
        displayWhenOpen={!isDcbUser(user) ? displayWhenOpen : null}
      >
        {this.showRequests && (requestsLoaded ?
          <List
            listStyle="bullets"
            itemFormatter={itemFormatter}
            items={[
              {
                id: 'clickable-viewopenrequests',
                count: openRequestsCount,
                formattedMessageId: 'ui-users.requests.numOpenRequests',
                query: { query: id, filters: openFilterString },
              },
              {
                id: 'clickable-viewclosedrequests',
                count: closedRequestsCount,
                formattedMessageId: 'ui-users.requests.numClosedRequests',
                query: { query: id, filters: closedFilterString },
              },
            ]}
          /> : <Icon icon="spinner-ellipsis" width="10px" />
        )}
        {showCustomFieldsSection && (
          <Row>
            <ViewCustomFieldsSection
              customFields={customFields}
              sectionId={CUSTOM_FIELDS_SECTION.REQUESTS}
            />
          </Row>
        )}
      </Accordion>
    );
  }
}

export default flowRight(
  Component => withCustomFields(Component, {
    isVisible: true,
    sectionId: CUSTOM_FIELDS_SECTION.REQUESTS,
  }),
  stripesConnect,
)(UserRequests);

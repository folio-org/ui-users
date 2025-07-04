import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, FormattedNumber } from 'react-intl';
import { Link } from 'react-router-dom';
import { stripesConnect } from '@folio/stripes/core';
import {
  Badge,
  Accordion,
  List,
  Icon,
  Headline
} from '@folio/stripes/components';

import {
  loanActions,
  loanStatuses,
} from '../../../constants';


const ListLoans = (props) => {
  const { params, location, items } = props;
  return (
    <List
      listStyle="bullets"
      itemFormatter={(item, index) => (
        <li key={index}>
          <Link
            id={item.id}
            to={{
              pathname: `/users/${params.id}/loans/${item.status}`,
              state: { search: location.search },
            }}
          >
            <FormattedMessage id={item.formattedMessageId} values={{ count: item.count }} />
          </Link>
          {item.claimedReturnedCount > 0 &&
            <span id="claimed-returned-count">
              {' '}
              <FormattedMessage id="ui-users.loans.numClaimedReturnedLoans" values={{ count: item.claimedReturnedCount }} />
            </span>
          }
          {item.subItems &&
            (!item.subItemsCond || item.subItemsCond()) &&
            <ul>
              <li>{item.subItemsHeader}</li>
              <ListLoans params={params} location={location} items={item.subItems} />
            </ul>
          }
        </li>)}
      items={items}
    />
  );
};


/**
 * User-details "Loans" accordion pane.
 *
 * Show links to the open- and closed-loans in the body; include the
 * number of open-loans in the preview.
 */
class UserLoans extends React.Component {
  // "limit=0" on the claimedReturnedCount and closedLoansCount fields is a hack
  // to get at the "totalRecords" field without pulling down any other data
  // see https://issues.folio.org/browse/FOLIO-773
  static manifest = Object.freeze({
    loansHistory: {
      type: 'okapi',
      records: 'loans',
      GET: {
        path: 'circulation/loans?query=(userId==:{id})&limit=1000',
      },
    },
    openLoans: {
      type: 'okapi',
      GET: {
        path: 'circulation/loans',
        params: {
          query: `(userId==:{id} and status.name<>${loanStatuses.CLOSED})`,
          limit: '1000',
        },
      },
    },
    claimedReturnedCount: {
      type: 'okapi',
      GET: {
        path: 'circulation/loans',
        params: {
          query: `userId==:{id} and status.name<>${loanStatuses.CLOSED} and action==${loanActions.CLAIMED_RETURNED}`,
          limit: '0',
        },
      },
    },
    closedLoansCount: {
      type: 'okapi',
      GET: {
        path: 'circulation/loans',
        params: {
          query: `userId==:{id} and status.name==${loanStatuses.CLOSED}`,
          limit: '0',
        },
      },
    },
    userid: {},
  });

  static propTypes = {
    resources: PropTypes.shape({
      loansHistory: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
      closedLoansCount: PropTypes.object,
      openLoans: PropTypes.object,
      claimedReturnedCount: PropTypes.object,
    }),
    accordionId: PropTypes.string,
    expanded: PropTypes.bool,
    onToggle: PropTypes.func,
    match: PropTypes.object,
    location: PropTypes.shape({
      search: PropTypes.string,
      pathname: PropTypes.string,
    }),
  };

  isLoading() {
    const {
      resources: {
        openLoans,
        claimedReturnedCount,
        closedLoansCount,
      }
    } = this.props;

    return (openLoans?.isPending ?? true) &&
      (closedLoansCount?.isPending ?? true) &&
      (claimedReturnedCount?.isPending ?? true);
  }

  render() {
    const {
      expanded,
      onToggle,
      accordionId,
      resources,
      match: { params },
      location,
    } = this.props;

    const openLoansCount = resources?.openLoans?.records?.[0]?.totalRecords ?? 0;
    const claimedReturnedCount = resources?.claimedReturnedCount?.records?.[0]?.totalRecords ?? 0;
    const closedLoansCount = resources?.closedLoansCount?.records?.[0]?.totalRecords ?? 0;
    const loansLoaded = !this.isLoading();
    const displayWhenClosed = loansLoaded ? (<Badge><FormattedNumber value={openLoansCount} /></Badge>) : (<Icon icon="spinner-ellipsis" width="10px" />);

    const loans = resources?.openLoans?.records?.[0]?.loans;
    const heldLoansCount = loans?.filter(l => l.forUseAtLocation?.status === 'Held').length;
    const inUseLoansCount = loans?.filter(l => l.forUseAtLocation?.status === 'In use').length;

    const subItems = [
      {
        id: 'clickable-viewheldloans',
        count: heldLoansCount,
        formattedMessageId: 'ui-users.loans.numOpenLoans.held',
        status: 'open',
      },
      {
        id: 'clickable-viewinuseloans',
        count: inUseLoansCount,
        formattedMessageId: 'ui-users.loans.numOpenLoans.inUse',
        status: 'open',
      },
    ];

    const items = [
      {
        id: 'clickable-viewcurrentloans',
        count: openLoansCount,
        claimedReturnedCount,
        formattedMessageId: 'ui-users.loans.numOpenLoans',
        status: 'open',
        subItemsCond: () => heldLoansCount !== 0 || inUseLoansCount !== 0,
        subItemsHeader: <FormattedMessage id="ui-users.loans.columns.useAtLocation" />,
        subItems,
      },
      {
        id: 'clickable-viewclosedloans',
        count: closedLoansCount,
        formattedMessageId: 'ui-users.loans.numClosedLoans',
        status: 'closed',
      },
    ];

    return (
      <Accordion
        open={expanded}
        id={accordionId}
        onToggle={onToggle}
        label={(
          <Headline size="large" tag="h3">
            <FormattedMessage id="ui-users.loans.title" />
          </Headline>)}
        displayWhenClosed={displayWhenClosed}
      >
        {loansLoaded ?
          <ListLoans params={params} location={location} items={items} /> :
          <Icon icon="spinner-ellipsis" width="10px" />
        }
      </Accordion>
    );
  }
}

export default stripesConnect(UserLoans);

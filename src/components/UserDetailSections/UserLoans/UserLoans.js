import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, FormattedNumber } from 'react-intl';
import { Link } from 'react-router-dom';
import flowRight from 'lodash/flowRight';

import { stripesConnect } from '@folio/stripes/core';
import {
  Badge,
  Accordion,
  List,
  Icon,
  Row,
  Headline
} from '@folio/stripes/components';

import { withCustomFields } from '../../Wrappers';
import ViewCustomFieldsSection from '../ViewCustomFieldsSection';
import {
  loanActions,
  loanStatuses,
  CUSTOM_FIELDS_SECTION,
} from '../../../constants';


const ListLoans = (props) => {
  const { params, location, items } = props;
  return (
    <List
      listStyle="bullets"
      itemFormatter={(item, index) => (
        <li key={index}>
          {item.status ? (
            <Link
              id={item.id}
              to={{
                pathname: `/users/${params.id}/loans/${item.status}`,
                state: { search: location.search },
              }}
            >
              <FormattedMessage id={item.formattedMessageId} values={{ count: item.count }} />
            </Link>
          ) : (
            <FormattedMessage id={item.formattedMessageId} values={{ count: item.count }} />
          )}
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
    openLoans: {
      type: 'okapi',
      GET: {
        path: 'circulation/loans',
        params: {
          query: `(userId==:{id} and status.name<>${loanStatuses.CLOSED})`,
          limit: '1000',
        },
      },
      fetch: false,
      throwErrors: false,
      accumulate: true,
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
      fetch: false,
      throwErrors: false,
      accumulate: true,
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
      fetch: false,
      throwErrors: false,
      accumulate: true,
    },
    userid: {},
  });

  static propTypes = {
    customFields: PropTypes.arrayOf(PropTypes.object).isRequired,
    mutator: PropTypes.shape({
      openLoans: PropTypes.shape({
        GET: PropTypes.func.isRequired,
      }).isRequired,
      claimedReturnedCount: PropTypes.shape({
        GET: PropTypes.func.isRequired,
      }).isRequired,
      closedLoansCount: PropTypes.shape({
        GET: PropTypes.func.isRequired,
      }).isRequired,
    }).isRequired,
    resources: PropTypes.shape({
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
    showCustomFieldsSection: PropTypes.bool.isRequired,
    stripes: PropTypes.shape({
      hasPerm: PropTypes.func.isRequired,
      hasInterface: PropTypes.func.isRequired,
    }).isRequired,
  };

  componentDidMount() {
    const { mutator } = this.props;

    if (this.showLoans) {
      mutator.openLoans.GET();
      mutator.claimedReturnedCount.GET();
      mutator.closedLoansCount.GET();
    }
  }

  hasViewLoansPerm = this.props.stripes.hasPerm('ui-users.loans.view');
  hasLoanPolicyStorageInterface = !!this.props.stripes.hasInterface('loan-policy-storage');
  hasCirculationInterface = !!this.props.stripes.hasInterface('circulation');
  showLoans = this.hasViewLoansPerm && this.hasLoanPolicyStorageInterface && this.hasCirculationInterface;

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
      customFields,
      showCustomFieldsSection,
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
      },
      {
        id: 'clickable-viewinuseloans',
        count: inUseLoansCount,
        formattedMessageId: 'ui-users.loans.numOpenLoans.inUse',
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

    if (!showCustomFieldsSection && !this.showLoans) {
      return null;
    }

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
        {this.showLoans && (loansLoaded ?
          <ListLoans params={params} location={location} items={items} /> :
          <Icon icon="spinner-ellipsis" width="10px" />
        )}
        {showCustomFieldsSection && (
          <Row>
            <ViewCustomFieldsSection
              customFields={customFields}
              sectionId={CUSTOM_FIELDS_SECTION.LOANS}
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
    sectionId: CUSTOM_FIELDS_SECTION.LOANS,
  }),
  stripesConnect,
)(UserLoans);

import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';

import {
  Row,
  Col,
  Badge,
  Button,
  Accordion,
  Icon,
  List,
  Headline
} from '@folio/stripes/components';
import { useStripes } from '@folio/stripes/core';

import {
  accountStatuses,
  refundStatuses,
  refundClaimReturned,
} from '../../../constants';


/**
 * User-details "Accounts" accordian pane.
 *
 * Show links to the open- and closed-accounts in the body; include the
 * number of open-accounts in the preview.
 */
const UserAccounts = ({
  expanded,
  onToggle,
  accordionId,
  match: { params },
  accounts: {
    records,
    isPending,
  },
  resources,
}) => {
  const [totals, setTotals] = useState({
    openAccountsCount: 0,
    closedAccountsCount: 0,
    claimAccountsCount: 0,
    refundedAccountsCount: 0,
    total: 0.00,
    totalClaim: 0.00,
    totalRefunded: 0.00,
  });
  const stripes = useStripes();
  const accountsLoaded = !isPending;
  const {
    openAccountsCount,
    closedAccountsCount,
    claimAccountsCount,
    refundedAccountsCount,
    total,
    totalClaim,
    totalRefunded,
  } = totals;
  const displayWhenClosed = accountsLoaded ? (<Badge>{openAccountsCount}</Badge>) : (<Icon icon="spinner-ellipsis" width="10px" />);
  const buttonDisabled = !stripes?.hasPerm('ui-users.feesfines.actions.all');
  const displayWhenOpen = (<Button disabled={buttonDisabled} to={{ pathname: `/users/${params.id}/charge` }}><FormattedMessage id="ui-users.accounts.chargeManual" /></Button>);

  useEffect(() => {
    const open = records.filter(account => account?.status?.name !== accountStatuses.CLOSED);
    const closed = records.filter(account => account?.status?.name === accountStatuses.CLOSED);

    // get refunded actions and refunds total amount
    const refundStatusesValues = [
      ...Object.values(refundStatuses),
      refundClaimReturned.REFUNDED_ACTION,
    ];
    const feeFineActions = resources.feefineactions.records ?? [];
    const refunded = feeFineActions.filter((feeFineAction) => refundStatusesValues.includes(feeFineAction.typeAction));
    const refundedTotal = refunded.reduce((acc, { amountAction }) => (acc + amountAction), 0);
    const claim = resources.accounts?.records?.filter(account => account.paymentStatus.name === refundClaimReturned.PAYMENT_STATUS) || [];

    const claimTotal = claim.reduce((acc, { remaining }) => (acc + parseFloat(remaining)), 0);
    const openTotal = open.reduce((acc, { remaining }) => (acc + parseFloat(remaining)), 0) - claimTotal;

    setTotals({
      openAccountsCount: open.length - claim.length,
      closedAccountsCount: closed.length,
      claimAccountsCount: claim.length,
      refundedAccountsCount: refunded.length,
      total: parseFloat(openTotal).toFixed(2),
      totalClaim: parseFloat(claimTotal).toFixed(2),
      totalRefunded: parseFloat(refundedTotal).toFixed(2),
    });
  }, [records, resources]);

  return (
    <Accordion
      open={expanded}
      id={accordionId}
      onToggle={onToggle}
      label={<Headline size="large" tag="h3"><FormattedMessage id="ui-users.accounts.title.feeFine" /></Headline>}
      displayWhenClosed={displayWhenClosed}
      displayWhenOpen={displayWhenOpen}
    >
      {accountsLoaded ?
        <Row>
          <Col xs={5}>
            <List
              listStyle="bullets"
              itemFormatter={(item, index) => (
                <li key={index}>
                  <Link
                    id={item.id}
                    to={`/users/${params.id}/accounts/${item.status}`}
                  >
                    <FormattedMessage id={item.formattedMessageId} values={{ count: item.count }} />
                    {' '}
                    {' '}
                  </Link>
                  {item.id === 'clickable-viewcurrentaccounts' && <FormattedMessage id="ui-users.accounts.totalOpenAccounts" values={{ amount: total }} />}
                </li>)}
              items={[
                {
                  id: 'clickable-viewcurrentaccounts',
                  count: openAccountsCount,
                  formattedMessageId: 'ui-users.accounts.numOpenAccounts',
                  status: 'open',
                },
                {
                  id: 'clickable-viewclosedaccounts',
                  count: closedAccountsCount,
                  formattedMessageId: 'ui-users.accounts.numClosedAccounts',
                  status: 'closed',
                },
                {
                  id: 'clickable-viewallaccounts',
                  count: 0,
                  formattedMessageId: 'ui-users.accounts.viewAllFeesFines',
                  status: 'all',
                },
              ]}
            />
          </Col>
          <Col xs={6}>
            <List
              listStyle="bullets"
              itemFormatter={(item, index) => (
                <li key={index}>
                  <div id={item.id}>
                    <FormattedMessage id={item.formattedMessageId} values={{ count: item.count }} />
                    {' '}
                    <FormattedMessage id="ui-users.accounts.totalOpenAccounts" values={{ amount: item.total }} />
                  </div>
                </li>)}
              items={[
                {
                  id: 'no-clickable-claim',
                  count: claimAccountsCount,
                  formattedMessageId: 'ui-users.accounts.numClaimAccounts',
                  total: totalClaim
                },
                {
                  id: 'no-clickable-refunded',
                  count: refundedAccountsCount,
                  formattedMessageId: 'ui-users.accounts.numRefundedAccounts',
                  total: totalRefunded
                },
              ]}
            />
          </Col>
        </Row> : <Icon icon="spinner-ellipsis" width="10px" />
      }
    </Accordion>
  );
};

UserAccounts.propTypes = {
  accounts: PropTypes.object,
  accordionId: PropTypes.string,
  expanded: PropTypes.bool,
  onToggle: PropTypes.func,
  location: PropTypes.shape({
    search: PropTypes.string,
    pathname: PropTypes.string,
  }),
  match: PropTypes.shape({
    params: PropTypes.object,
  }).isRequired,
  resources: PropTypes.shape({
    accounts: PropTypes.shape({
      records: PropTypes.arrayOf(
        PropTypes.shape({
          paymentStatus: PropTypes.shape({
            name: PropTypes.string,
          }),
          remaining: PropTypes.number,
        })
      ),
    }).isRequired,
    loansHistory: PropTypes.shape({
      records: PropTypes.arrayOf(PropTypes.object),
    }),
    feefineactions: PropTypes.shape({
      records: PropTypes.arrayOf(
        PropTypes.shape({
          typeAction: PropTypes.string.isRequired,
        })
      ),
    }).isRequired,
  }).isRequired,
};

export default UserAccounts;

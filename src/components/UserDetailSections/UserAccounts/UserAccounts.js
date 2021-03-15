import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';

import {
  Badge,
  Button,
  Accordion,
  Icon,
  List,
  Headline
} from '@folio/stripes/components';
import { useStripes } from '@folio/stripes/core';

import { accountStatues } from '../../../constants';


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
}) => {
  const [totals, setTotals] = useState({
    openAccountsCount: 0,
    closedAccountsCount: 0,
    total: 0.00,
  });
  const stripes = useStripes();
  const accountsLoaded = !isPending;
  const {
    openAccountsCount,
    closedAccountsCount,
    total,
  } = totals;
  const displayWhenClosed = accountsLoaded ? (<Badge>{openAccountsCount}</Badge>) : (<Icon icon="spinner-ellipsis" width="10px" />);
  const buttonDisabled = !stripes?.hasPerm('ui-users.feesfines.actions.all');
  const displayWhenOpen = (<Button disabled={buttonDisabled} to={{ pathname: `/users/${params.id}/charge` }}><FormattedMessage id="ui-users.accounts.chargeManual" /></Button>);

  useEffect(() => {
    const open = records.filter(account => account?.status?.name !== accountStatues.CLOSED);
    const closed = records.filter(account => account?.status?.name === accountStatues.CLOSED);
    const openTotal = open.reduce((acc, { remaining }) => (acc + parseFloat(remaining)), 0);

    setTotals({
      openAccountsCount: open.length,
      closedAccountsCount: closed.length,
      total: parseFloat(openTotal).toFixed(2),
    });
  }, [records]);

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
        /> : <Icon icon="spinner-ellipsis" width="10px" />
      }
    </Accordion>
  );
};

UserAccounts.propTypes = {
  accounts: PropTypes.arrayOf(PropTypes.object),
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
};

export default UserAccounts;

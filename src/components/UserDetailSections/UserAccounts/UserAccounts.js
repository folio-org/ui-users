import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import { get } from 'lodash';

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
import { useCustomFieldsQuery } from '@folio/stripes/smart-components';
import { useStripes } from '@folio/stripes/core';

import ViewCustomFieldsSection from '../ViewCustomFieldsSection';
import {
  accountStatuses,
  refundStatuses,
  refundClaimReturned,
  CUSTOM_FIELDS_SECTION,
  CUSTOM_FIELDS_ENTITY_TYPE,
  MODULE_NAME,
} from '../../../constants';
import { isDcbUser } from '../../util';
import { useLocalizedCurrency } from '../../../hooks';

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
  customFields,
}) => {
  const user = get(resources, ['selUser', 'records', '0']);
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
  const { localizeCurrency } = useLocalizedCurrency();

  const {
    customFields: visibleCustomFields,
    isCustomFieldsError: customFieldsFetchFailed,
    isLoadingCustomFields,
  } = useCustomFieldsQuery({
    moduleName: MODULE_NAME,
    entityType: CUSTOM_FIELDS_ENTITY_TYPE,
    sectionId: CUSTOM_FIELDS_SECTION.FEES_FINES,
    isVisible: true,
  });

  const showCustomFieldsSection = isLoadingCustomFields || (!customFieldsFetchFailed && visibleCustomFields?.length > 0);
  const showAccounts = !!(stripes.hasPerm('ui-users.feesfines.view') && stripes.hasInterface('feesfines'));

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
      total: parseFloat(openTotal),
      totalClaim: parseFloat(claimTotal),
      totalRefunded: parseFloat(refundedTotal),
    });
  }, [records, resources]);

  if (!showCustomFieldsSection && !showAccounts) {
    return null;
  }

  return (
    <Accordion
      open={expanded}
      id={accordionId}
      onToggle={onToggle}
      label={<Headline size="large" tag="h3"><FormattedMessage id="ui-users.accounts.title.feeFine" /></Headline>}
      displayWhenClosed={displayWhenClosed}
      displayWhenOpen={!isDcbUser(user) ? displayWhenOpen : null}
    >
      {showAccounts && (accountsLoaded ?
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
                  {item.id === 'clickable-viewcurrentaccounts' && <FormattedMessage id="ui-users.accounts.totalOpenAccounts" values={{ amount: localizeCurrency(total) }} />}
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
                    <FormattedMessage id="ui-users.accounts.totalOpenAccounts" values={{ amount: localizeCurrency(item.total) }} />
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
      )}
      {showCustomFieldsSection && (
        <Row>
          <ViewCustomFieldsSection
            customFields={customFields}
            sectionId={CUSTOM_FIELDS_SECTION.FEES_FINES}
          />
        </Row>
      )}
    </Accordion>
  );
};

UserAccounts.propTypes = {
  accounts: PropTypes.object,
  accordionId: PropTypes.string,
  customFields: PropTypes.arrayOf(PropTypes.object).isRequired,
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
  stripes: PropTypes.shape({
    hasPerm: PropTypes.func.isRequired,
    hasInterface: PropTypes.func.isRequired,
  }).isRequired,
};

export default UserAccounts;

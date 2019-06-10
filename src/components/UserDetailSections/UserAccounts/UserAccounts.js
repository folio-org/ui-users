import _ from 'lodash';
import React from 'react';
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
import {
  stripesConnect
} from '@folio/stripes/core';

/**
 * User-details "Accounts" accordian pane.
 *
 * Show links to the open- and closed-accounts in the body; include the
 * number of open-accounts in the preview.
 */
class UserAccounts extends React.Component {
  static manifest = Object.freeze({
    accountsHistory: {
      type: 'okapi',
      records: 'accounts',
      GET: {
        path: 'accounts?query=(userId=:{id})&limit=100',
      },
    },
    openAccountsCount: {
      type: 'okapi',
      accumulate: 'true',
      GET: {
        path: 'accounts?query=(userId=:{id} and status.name<>Closed)&limit=100',
      },
    },
    closedAccountsCount: {
      type: 'okapi',
      accumulate: 'true',
      GET: {
        path: 'accounts?query=(userId=:{id} and status.name=Closed)&limit=1',
      },
    },
    activeRecord: {},
    userid: {},
  });

  static propTypes = {
    resources: PropTypes.shape({
      accountsHistory: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
    }),
    mutator: PropTypes.shape({
      openAccountsCount: PropTypes.object,
      closedAccountsCount: PropTypes.object,
    }),
    stripes: PropTypes.shape({
      hasPerm: PropTypes.func,
    }),
    accordionId: PropTypes.string,
    addRecord: PropTypes.bool,
    expanded: PropTypes.bool,
    onToggle: PropTypes.func,
    location: PropTypes.shape({
      search: PropTypes.string,
      pathname: PropTypes.string,
    }),
    match: PropTypes.shape({
      params: PropTypes.object,
    }).isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      openAccounts: 0,
      closedAccounts: 0,
    };
  }

  componentDidMount() {
    this.props.mutator.openAccountsCount.GET().then(records => {
      this.setState({
        total: this.getTotalOpenAccounts(records.accounts),
        openAccounts: records.totalRecords,
      });
    });
    this.props.mutator.closedAccountsCount.GET().then(records => {
      this.setState({
        closedAccounts: records.totalRecords,
      });
    });
  }

  componentDidUpdate(prevProps) {
    if (this.props.addRecord !== prevProps.addRecord) {
      this.props.mutator.openAccountsCount.GET().then(records => {
        this.setState({
          total: this.getTotalOpenAccounts(records.accounts),
          openAccounts: records.totalRecords,
        });
      });
      this.props.mutator.closedAccountsCount.GET().then(records => {
        this.setState({
          closedAccounts: records.totalRecords,
        });
      });
    }
  }

  getTotalOpenAccounts = (accounts) => {
    const total = accounts.reduce((t, { remaining }) => (t + parseFloat(remaining)), 0);
    return parseFloat(total).toFixed(2);
  }

  render() {
    const resources = this.props.resources;
    const openAccountsTotal = this.state.openAccounts || 0;
    const closedAccountsTotal = this.state.closedAccounts || 0;
    const total = this.state.total || '0.00';
    const { expanded, onToggle, accordionId, match: { params } } = this.props;

    const openAccountsCount = (_.get(resources.openAccountsCount, ['isPending'], true)) ? -1 : openAccountsTotal;
    const closedAccountsCount = (_.get(resources.closedAccountsCount, ['isPending'], true)) ? -1 : closedAccountsTotal;

    // const query = this.props.location.search ? queryString.parse(this.props.location.search) : {};

    const accountsLoaded = openAccountsCount >= 0 && closedAccountsCount >= 0;
    const displayWhenClosed = accountsLoaded ? (<Badge>{openAccountsCount}</Badge>) : (<Icon icon="spinner-ellipsis" width="10px" />);
    const buttonDisabled = !this.props.stripes.hasPerm('ui-users.feesfines.actions.all');
    const displayWhenOpen = (<Button disabled={buttonDisabled} to={{ pathname: `/users/${params.id}/charge` }}><FormattedMessage id="ui-users.accounts.chargeManual" /></Button>);
    return (
      <Accordion
        open={expanded}
        id={accordionId}
        onToggle={onToggle}
        label={<Headline size="large" tag="h3"><FormattedMessage id="ui-users.accounts.title" /></Headline>}
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
  }
}

export default stripesConnect(UserAccounts);

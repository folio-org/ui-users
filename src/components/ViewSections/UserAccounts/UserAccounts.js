import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import queryString from 'query-string';
import { FormattedMessage } from 'react-intl';
import Badge from '@folio/stripes-components/lib/Badge';
import Button from '@folio/stripes-components/lib/Button';
import { Accordion } from '@folio/stripes-components/lib/Accordion';
import Icon from '@folio/stripes-components/lib/Icon';
import List from '@folio/stripes-components/lib/List';

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
        path: 'accounts?query=(userId=:{id} and status.name<>Closed)&limit=1',
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
    onClickViewChargeFeeFine: PropTypes.func.isRequired,
    accordionId: PropTypes.string,
    addRecord: PropTypes.bool,
    expanded: PropTypes.bool,
    onToggle: PropTypes.func,
    location: PropTypes.shape({
      search: PropTypes.string,
      pathname: PropTypes.string,
    }),
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

  render() {
    const resources = this.props.resources;
    const openAccountsTotal = this.state.openAccounts || 0;
    const closedAccountsTotal = this.state.closedAccounts || 0;
    const { expanded, onToggle, accordionId } = this.props;

    const openAccountsCount = (_.get(resources.openAccountsCount, ['isPending'], true)) ? -1 : openAccountsTotal;
    const closedAccountsCount = (_.get(resources.closedAccountsCount, ['isPending'], true)) ? -1 : closedAccountsTotal;

    const query = this.props.location.search ? queryString.parse(this.props.location.search) : {};

    const accountsLoaded = openAccountsCount >= 0 && closedAccountsCount >= 0;
    const displayWhenClosed = accountsLoaded ? (<Badge>{openAccountsCount}</Badge>) : (<Icon icon="spinner-ellipsis" width="10px" />);
    const displayWhenOpen = (<Button onClick={e => this.props.onClickViewChargeFeeFine(e, {})}><FormattedMessage id="ui-users.accounts.chargeManual" /></Button>);
    return (
      <Accordion
        open={expanded}
        id={accordionId}
        onToggle={onToggle}
        label={<FormattedMessage id="ui-users.accounts.title" />}
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
                  to={`${this.props.location.pathname}?${queryString.stringify({ ...query, layer: item.layer })}`}
                >
                  <FormattedMessage id={item.formattedMessageId} values={{ count: item.count }} />
                </Link>
              </li>)}
            items={[
              {
                id: 'clickable-viewcurrentaccounts',
                count: openAccountsCount,
                formattedMessageId: 'ui-users.accounts.numOpenAccounts',
                layer: 'open-accounts',
              },
              {
                id: 'clickable-viewclosedaccounts',
                count: closedAccountsCount,
                formattedMessageId: 'ui-users.accounts.numClosedAccounts',
                layer: 'closed-accounts',
              },
            ]}
          /> : <Icon icon="spinner-ellipsis" width="10px" />
        }
      </Accordion>
    );
  }
}

export default UserAccounts;

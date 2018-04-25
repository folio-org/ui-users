import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import queryString from 'query-string';
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
  static propTypes = {
    resources: PropTypes.shape({
      accountsHistory: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
    }),
    mutator: PropTypes.shape({
      activeRecord: PropTypes.object,
    }),
    onClickViewOpenAccounts: PropTypes.func.isRequired,
    onClickViewClosedAccounts: PropTypes.func.isRequired,
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
      GET: {
        path: 'accounts?query=(userId=:{id} and status.name<>Closed)&limit=%{activeRecord.limit}',
      },
    },
    closedAccountsCount: {
      type: 'okapi',
      GET: {
        path: 'accounts?query=(userId=:{id} and status.name=Closed)&limit=%{activeRecord.limit}',
      },
    },
    activeRecord: {},
    userid: {},
  });

  componentWillMount() {
    this.props.mutator.activeRecord.update({ limit: 1 });
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.addRecord !== nextProps.addRecord) {
      if (!this.props.addRecord) this.props.mutator.activeRecord.update({ limit: 2 });
      else this.props.mutator.activeRecord.update({ limit: 1 });
    }
  }

  render() {
    const resources = this.props.resources;
    const openAccountsTotal = _.get(resources.openAccountsCount, ['records', '0', 'total_records'], 0);
    const closedAccountsTotal = _.get(resources.closedAccountsCount, ['records', '0', 'total_records'], 0);
    const { expanded, onToggle, accordionId } = this.props;

    const openAccountsCount = (_.get(resources.openAccountsCount, ['isPending'], true)) ? -1 : openAccountsTotal;
    const closedAccountsCount = (_.get(resources.closedAccountsCount, ['isPending'], true)) ? -1 : closedAccountsTotal;

    const query = this.props.location.search ? queryString.parse(this.props.location.search) : {};

    const accountsLoaded = openAccountsCount >= 0 && closedAccountsCount >= 0;
    const displayWhenClosed = accountsLoaded ? (<Badge>{openAccountsCount}</Badge>) : (<Icon icon="spinner-ellipsis" width="10px" />);
    const displayWhenOpen = (<Button onClick={e => this.props.onClickViewChargeFeeFine(e, {})}>Charge Fee/Fine</Button>);
    return (
      <Accordion
        open={expanded}
        id={accordionId}
        onToggle={onToggle}
        label="Fees/Fines"
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
                  onClick={item.onClick}
                >
                  {item.label}&nbsp;
                  {item.formattedMessageId}
                </Link>
              </li>)}
            items={[
              {
                id: 'clickable-viewcurrentaccounts',
                onClick: this.props.onClickViewOpenAccounts,
                label: openAccountsCount,
                formattedMessageId: 'open fee(s)/fine(s)',
                layer: 'open-accounts',
              },
              {
                id: 'clickable-viewclosedaccounts',
                onClick: this.props.onClickViewClosedAccounts,
                label: closedAccountsCount,
                formattedMessageId: 'closed fee(s)/fine(s)',
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

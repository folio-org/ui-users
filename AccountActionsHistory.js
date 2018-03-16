import _ from 'lodash';
import React from 'react';
import Link from 'react-router-dom/Link';
import PropTypes from 'prop-types';
import { Row, Col } from '@folio/stripes-components/lib/LayoutGrid';
import KeyValue from '@folio/stripes-components/lib/KeyValue';
import MultiColumnList from '@folio/stripes-components/lib/MultiColumnList';
import Pane from '@folio/stripes-components/lib/Pane';
import Paneset from '@folio/stripes-components/lib/Paneset';
import { formatDateTime, getFullName, getItemStatusFormatter } from './util';
import loanActionMap from './data/loanActionMap';
import Button from '@folio/stripes-components/lib/Button';
import DropdownMenu from '@folio/stripes-components/lib/DropdownMenu';
import { UncontrolledDropdown } from '@folio/stripes-components/lib/Dropdown';
import MenuItem from '@folio/stripes-components/lib/MenuItem';


class AccountActionsHistory extends React.Component {
  static propTypes = {
    stripes: PropTypes.object.isRequired,
    resources: PropTypes.shape({
      accountActions: PropTypes.object,
    }),
    mutator: PropTypes.shape({
      accountActionsWithUser: PropTypes.shape({
        replace: PropTypes.func,
      }),
      userIds: PropTypes.shape({
        replace: PropTypes.func,
      }),
    }).isRequired,
    account: PropTypes.object,
    user: PropTypes.object,
    onCancel: PropTypes.func.isRequired,
    onClickUser: PropTypes.func.isRequired,
  };

  static manifest = Object.freeze({
    accountActions: {
      type: 'okapi',
      records: 'feefineactions',
      path: 'feefineactions',
      /*
      GET: {
        path: 'feefineactions?query=(accountId=!{feefine.id})',
      },
*/
    },
  });

  constructor(props) {
    super(props);
    //    this.prueba = this.prueba.bind(this);
  }

  // TODO: refactor after join is supported in stripes-connect
  componentWillReceiveProps(nextProps) {
    const { account, resources: { accountActions } } = nextProps;

    if (!accountActions.records.length ||
      accountActions.records[0].id !== account.id) return;
  }
  /*
  prueba() {
    return ('Hola');
  }
*/
  render() {
    const { onCancel, account, user, stripes, resources: { accountActions } } = this.props;

    const accountActionsFormatter = {
      // Action: aa => loanActionMap[la.action],
      'Action Date': action => formatDateTime(action.dateAction, stripes.locale),
      Action: action => action.typeAction,
      Amount: action => action.amountAction,
      Balance: action => action.balance,
      'Transaction number': action => action.transactionNumber,
      'Created at': action => action.createdAt,
      Source: action => action.source,
      Comments: action => action.comments,
    };

    const actions = _.get(this.props.resources, ['accountActions', 'records'], []);
    console.log(this.props);

    const rightButton = {
      marginRight: '10px',
      float: 'right',
    };

    return (
      <Paneset isRoot>
        <Pane id="pane-loandetails" defaultWidth="100%" dismissible onClose={onCancel} paneTitle={'Patron: '}>
          <Row>
            <Col xs={12}>
              <UncontrolledDropdown onSelectItem={this.handleOptionsChange}>
                <Button data-role="toggle">Pay<img style={{ marginLeft: '10px' }} src="https://png.icons8.com/ios/12/ffffff/sort-down-filled.png" /></Button>
                <DropdownMenu data-role="menu" overrideStyle={{ padding: '6px 0' }}>
                  <MenuItem>
                    <Button buttonStyle="dropdownItem">Quick Paydown</Button>
                  </MenuItem>
                  <MenuItem>
                    <Button buttonStyle="dropdownItem">Regular Payment</Button>
                  </MenuItem>
                </DropdownMenu>
              </UncontrolledDropdown>
              <Button>Waive</Button>
              <Button>Refund</Button>
              <Button>Transfer</Button>
              <Button>Error</Button>
              <img src="https://png.icons8.com/ios/25/666666/upload.png" />
            </Col>
          </Row>

          <Row>
            <Col xs={2} >
              <KeyValue label="Fee/fine type" value={_.get(account, ['feeFineType'], '')} />
            </Col>
            <Col xs={2} >
              <KeyValue label="Fee/fine owner" value={_.get(account, ['feeFineOwner'], '')} />
            </Col>
            <Col xs={2} >
              <KeyValue label="Charge date" value={_.get(account, ['dateCreated'], '')} />
            </Col>
            <Col xs={2} >
              <KeyValue label="Original fee/fine" value={_.get(account, ['charged'], '')} />
            </Col>
            <Col xs={2} >
              <KeyValue label="Outstanding amount" value={_.get(account, ['remaining'], '')} />
            </Col>
            <Col xs={2} >
              <KeyValue label="Loan details" value="Se elimino" />
            </Col>
          </Row>
          <Row>
            <Col xs={2} >
              <KeyValue label="Item type" value={_.get(account, ['itemType'], '')} />
            </Col>
            <Col xs={4} >
              <KeyValue label="Instance" value={_.get(account, ['item'], '')} />
            </Col>
            <Col xs={2} >
              <KeyValue label="Barcode (falta el ID)" value={<Link to={`/items/view/${_.get(account, ['barcode'], '')}?query=${_.get(account, ['barcode'], '')}`}>{_.get(account, ['barcode'], '')}</Link>} />
            </Col>
            <Col xs={2} >
              <KeyValue label="Call number" value="Pendiente" />
            </Col>
            <Col xs={2} >
              <KeyValue label="Location" value="Pendiente" />
            </Col>
          </Row>
          <br />
          <MultiColumnList
            id="list-accountactions"
            formatter={accountActionsFormatter}
            visibleColumns={['Action Date', 'Action', 'Amount', 'Balance', 'Transaction number', 'Created at', 'Source', 'Comments']}
            contentData={actions}
          />
        </Pane>
      </Paneset>
    );
  }
}

export default AccountActionsHistory;


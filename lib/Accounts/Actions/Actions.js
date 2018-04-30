import React from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
// eslint-disable-next-line import/no-extraneous-dependencies
import dateFormat from 'dateformat';
import Callout from '@folio/stripes-components/lib/Callout';
import CancellationModal from './CancellationModal';
import PayModal from './PayModal';
import WaiveModal from './WaiveModal';
import CommentModal from './CommentModal';
import { getFullName } from '../util';

class Actions extends React.Component {
  static propTypes = {
    resources: PropTypes.shape({
      accounts: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
    }),
    mutator: PropTypes.shape({
      user: PropTypes.object,
      activeRecord: PropTypes.object,
      accounts: PropTypes.shape({
        PUT: PropTypes.func.isRequired,
      }),
      feefineactions: PropTypes.shape({
        POST: PropTypes.func.isRequired,
      }),
    }),
    okapi: PropTypes.object,
    accounts: PropTypes.arrayOf(PropTypes.object),
    actions: PropTypes.object,
    onChangeActions: PropTypes.func,
    handleEdit: PropTypes.func,
    user: PropTypes.object,
  };
  static manifest = Object.freeze({
    accounts: {
      type: 'okapi',
      records: 'accounts',
      path: 'accounts?query=(userId=%{user.id})&limit=100',
      PUT: {
        path: 'accounts/%{activeRecord.id}',
      },
    },
    feefineactions: {
      type: 'okapi',
      records: 'feefineactions',
      path: 'feefineactions',
    },
    payments: {
      type: 'okapi',
      records: 'payments',
      path: 'payments',
    },
    activeRecord: {},
    user: {},
  });
  constructor(props) {
    super(props);
    this.onCloseCancellation = this.onCloseCancellation.bind(this);
    this.onClickCancellation = this.onClickCancellation.bind(this);
    this.onClosePay = this.onClosePay.bind(this);
    this.onClickPay = this.onClickPay.bind(this);
    this.onCloseWaive = this.onCloseWaive.bind(this);
    this.onClickWaive = this.onClickWaive.bind(this);
    this.onCloseComment = this.onCloseComment.bind(this);
    this.onClickComment = this.onClickComment.bind(this);
    this.callout = null;
  }

  componentWillMount() {
    this.props.mutator.user.update({ id: this.props.user.id });
  }

  showCalloutMessage(a) {
    const message = (
      <span>
      The <strong>{a.feeFineType}</strong> fee/fine of {a.charged} has been successfully <strong>cancelled</strong> from {getFullName(this.props.user)}.
      </span>
    );
    this.callout.sendCallout({ message });
  }

  onClickCancellation(values) {
    const accounts = (this.props.resources.accounts || {}).records || [];
    const type = accounts.find(a => a.id === this.props.accounts[0].id) || {};
    this.props.mutator.activeRecord.update({ id: type.id });
    type.status = {
      name: 'Closed',
    };
    type.paymentStatus = {
      name: 'Error',
    };
    type.remaining = 0;
    type.metadata.updatedDate = dateFormat(new Date(), "yyyy-mm-dd'T'HH:MM:ss'Z'");

    const action = {};
    const source = `${this.props.okapi.currentUser.lastName}, ${this.props.okapi.currentUser.firstName}`;
    action.dateAction = (type.metadata || {}).createdDate || '';
    action.typeAction = 'Cancellation';
    action.amountAction = type.amount;
    action.balance = 0;
    action.transactionNumber = 0;
    action.createdAt = 'Main Library';
    action.source = source;
    action.comments = values.comment;
    action.accountId = type.id;
    action.userId = type.userId;
    this.props.mutator.feefineactions.POST(action);
    this.props.mutator.accounts.PUT(type);
    this.showCalloutMessage(type);
    this.onCloseCancellation();
    this.props.handleEdit(1);
  }

  onCloseCancellation() {
    this.props.onChangeActions({
      cancellation: false,
    });
  }

  onClickPay() {
    this.props.onChangeActions({
      pay: false,
    });
  }

  onClosePay() {
    this.props.onChangeActions({
      pay: false,
    });
  }

  onClickWaive() {
    this.props.onChangeActions({
      pay: false,
    });
  }


  onCloseWaive() {
    this.props.onChangeActions({
      waiveModal: false,
    });
  }

  onCloseComment() {
    this.props.onChangeActions({
      comment: false,
    });
  }

  onClickComment(values) {
    const id = this.props.accounts[0].id || '';
    const source = `${this.props.okapi.currentUser.lastName}, ${this.props.okapi.currentUser.firstName}`;
    const action = {
      dateAction: dateFormat(new Date(), "yyyy-mm-dd'T'HH:MM:ss'Z'"),
      typeAction: 'Comment',
      createdAt: 'Main Library',
      comments: values.comment,
      source,
      accountId: id,
      userId: this.props.user.id,
    };
    if (values.comment) {
      this.props.mutator.feefineactions.POST(action);
      this.onCloseComment();
    }
  }

  render() {
    const payments = _.get(this.props.resources, ['payments', 'records'], []);
    return (
      <div>
        <CancellationModal
          open={this.props.actions.cancellation}
          onClose={this.onCloseCancellation}
          user={this.props.user}
          account={this.props.accounts[0] || {}}
          onSubmit={(values) => { this.onClickCancellation(values); }}
        />
        <PayModal
          open={this.props.actions.pay}
          onClose={this.onClosePay}
          accounts={this.props.accounts}
          payments={payments}
          onSubmit={() => { this.onClickPay(); }}
        />
        <WaiveModal
          open={this.props.actions.waiveModal}
          onClose={this.onCloseWaive}
          accounts={this.props.accounts}
          onSubmit={() => { this.onClickWaive(); }}
        />
        <CommentModal
          open={this.props.actions.comment}
          onClose={this.onCloseComment}
          onSubmit={(values) => { this.onClickComment(values); }}
        />
        <Callout ref={(ref) => { this.callout = ref; }} />
      </div>
    );
  }
}

export default Actions;

import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  Row,
  Col,
  PaneHeader,
} from '@folio/stripes/components';
import { Link } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import { getFullName } from '../util';
import { isRefundAllowed } from './accountFunctions';

import css from './Menu.css';

const Menu = (props) => {
  const {
    user,
    showFilters,
    match: { params },
    filters,
    balance,
    selected,
    selectedAccounts,
    actions,
  } = props;

  const outstanding = parseFloat(balance).toFixed(2);
  const showSelected = (selected !== 0 && selected !== parseFloat(0).toFixed(2))
    && outstanding > parseFloat(0).toFixed(2);
  const buttonDisabled = !props.stripes.hasPerm('ui-users.feesfines.actions.all');
  const canRefund = selectedAccounts.some(isRefundAllowed);

  const type = <FormattedMessage id={`ui-users.accounts.${params.accountstatus}`} />;

  const firstMenu = (
    <div>
      <Row>
        <Col className={css.firstMenuItems}>
          <b><FormattedMessage id="ui-users.accounts.history.statusLabel" values={{ type }} /></b>
          {' '}
          <Link to={`/users/view/${user.id}`}>
            {`${getFullName(user)} (${_.upperFirst(props.patronGroup.group)})`}
          </Link>
          {(Object.values(filters).length !== 0 && !showFilters)
            ? <img alt="" src="https://png.icons8.com/color/40/f39c12/filled-filter.png" />
            : ''
          }
        </Col>
      </Row>
      <Row>
        <Col className={css.firstMenuItems}>
          <div id="outstanding-balance">
            <FormattedMessage
              id="ui-users.accounts.outstanding"
              values={{
                amount: outstanding
              }}
            />
          </div>
        </Col>
        <Col className={css.firstMenuItems}>
          {showSelected &&
            <FormattedMessage
              id="ui-users.accounts.selected"
              values={{
                amount: parseFloat(selected).toFixed(2)
              }}
            />
          }
        </Col>
      </Row>
    </div>);

  const lastMenu = (
    <div id="actions">
      <Button
        id="open-closed-all-charge-button"
        marginBottom0
        disabled={buttonDisabled}
        to={`/users/${params.id}/charge`}
      >
        <FormattedMessage id="ui-users.accounts.button.new" />
      </Button>
      <Button
        id="open-closed-all-pay-button"
        marginBottom0
        disabled={!((actions.regularpayment === true) && (buttonDisabled === false))}
        buttonStyle="primary"
        onClick={() => { props.onChangeActions({ regular: true }); }}
      >
        <FormattedMessage id="ui-users.accounts.history.button.pay" />
      </Button>
      <Button
        id="open-closed-all-wave-button"
        marginBottom0
        disabled={!((actions.waive === true) && (buttonDisabled === false))}
        buttonStyle="primary"
        onClick={() => { props.onChangeActions({ waiveMany: true }); }}
      >
        <FormattedMessage id="ui-users.accounts.history.button.waive" />
      </Button>
      <Button
        id="open-closed-all-refund-button"
        marginBottom0
        disabled={!((actions.refund === true) && (buttonDisabled === false) && (canRefund === true))}
        buttonStyle="primary"
        onClick={() => { props.onChangeActions({ refundMany: true }); }}
      >
        <FormattedMessage id="ui-users.accounts.history.button.refund" />
      </Button>
      <Button
        id="open-closed-all-transfer-button"
        marginBottom0
        disabled={!((actions.transfer === true) && (buttonDisabled === false))}
        buttonStyle="primary"
        onClick={() => { props.onChangeActions({ transferMany: true }); }}
      >
        <FormattedMessage id="ui-users.accounts.history.button.transfer" />
      </Button>
    </div>);

  return (
    <PaneHeader firstMenu={firstMenu} lastMenu={lastMenu} />
  );
};

Menu.propTypes = {
  user: PropTypes.object,
  stripes: PropTypes.shape({
    hasPerm: PropTypes.func,
  }),
  showFilters: PropTypes.bool,
  balance: PropTypes.number,
  selected: PropTypes.number,
  filters: PropTypes.object,
  actions: PropTypes.object,
  match: PropTypes.object,
  patronGroup: PropTypes.object,
  selectedAccounts: PropTypes.arrayOf(PropTypes.object).isRequired,
  onChangeActions: PropTypes.func,
};

export default Menu;

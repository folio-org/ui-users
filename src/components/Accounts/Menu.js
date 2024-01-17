import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import {
  Col,
  PaneHeader,
  Row,
} from '@folio/stripes/components';
import { Link } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import {
  getFullName,
} from '../util';

import { refundClaimReturned } from '../../constants';

import css from './Menu.css';
import { useLocalizedCurrency } from "../../hooks/useLocalizedCurrency/useLocalizedCurrency";

const Menu = (props) => {
  const {
    user,
    showFilters,
    match: { params },
    filters,
    selected,
    accounts
  } = props;

  const { formatCurrency } = useLocalizedCurrency();

  let balanceOutstanding = 0;
  let balanceSuspended = 0;
  if (params.accountstatus !== 'closed') {
    accounts.forEach((a) => {
      if (a.paymentStatus.name === refundClaimReturned.PAYMENT_STATUS) {
        balanceSuspended += (parseFloat(a.remaining));
      } else {
        balanceOutstanding += (parseFloat(a.remaining));
      }
    });
  }

  const showSelected = selected !== 0 && balanceOutstanding > 0;

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
              id="ui-users.accounts.outstanding.page"
              values={{ amount: formatCurrency(balanceOutstanding) }}
            />
            &nbsp;|&nbsp;
            <FormattedMessage
              id="ui-users.accounts.suspended.page"
              values={{ amount: formatCurrency(balanceSuspended) }}
            />
            {showSelected &&
            <span>
              &nbsp;|&nbsp;
              <FormattedMessage
                id="ui-users.accounts.selected.balance"
                values={{ amount: formatCurrency(selected) }}
              />
            </span>
            }
          </div>
        </Col>
      </Row>
    </div>);

  return (
    <PaneHeader firstMenu={firstMenu} />
  );
};

Menu.propTypes = {
  user: PropTypes.object,
  stripes: PropTypes.shape({
    hasPerm: PropTypes.func,
  }),
  showFilters: PropTypes.bool,
  selected: PropTypes.number,
  filters: PropTypes.object,
  match: PropTypes.object,
  patronGroup: PropTypes.object,
  accounts: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default Menu;

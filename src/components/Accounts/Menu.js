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

const Menu = (props) => {
  const {
    user,
    showFilters,
    match: { params },
    filters,
    selected,
    accounts
  } = props;

  let balanceOutstanding = 0;
  let balanceSuspended = 0;
  if (params.accountstatus !== 'closed') {
    accounts.forEach((a) => {
      if (a.paymentStatus.name === refundClaimReturned.PAYMENT_STATUS) {
        balanceSuspended += (parseFloat(a.remaining) * 100);
      } else {
        balanceOutstanding += (parseFloat(a.remaining) * 100);
      }
    });
  }
  balanceOutstanding /= 100;
  balanceSuspended /= 100;
  const suspended = parseFloat(balanceSuspended).toFixed(2);
  const outstanding = parseFloat(balanceOutstanding).toFixed(2);

  const showSelected = (selected !== 0 && selected !== parseFloat(0).toFixed(2))
    && outstanding > parseFloat(0).toFixed(2);

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
              values={{ amount: outstanding }}
            />
            &nbsp;|&nbsp;
            <FormattedMessage
              id="ui-users.accounts.suspended.page"
              values={{ amount: suspended }}
            />
            {showSelected &&
            <span>
              &nbsp;|&nbsp;
              <FormattedMessage
                id="ui-users.accounts.selected.balance"
                values={{ amount: parseFloat(selected).toFixed(2) }}
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

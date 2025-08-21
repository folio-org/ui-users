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
import { useLocalizedCurrency } from '../../hooks';

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

  const { localizeCurrency } = useLocalizedCurrency();

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
              values={{ amount: localizeCurrency(balanceOutstanding) }}
            />
            &nbsp;|&nbsp;
            <FormattedMessage
              id="ui-users.accounts.suspended.page"
              values={{ amount: localizeCurrency(balanceSuspended) }}
            />
            {showSelected &&
            <span>
              &nbsp;|&nbsp;
              <FormattedMessage
                id="ui-users.accounts.selected.balance"
                values={{ amount: localizeCurrency(selected) }}
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
  user: PropTypes.shape({}),
  stripes: PropTypes.shape({
    hasPerm: PropTypes.func,
  }),
  showFilters: PropTypes.bool,
  selected: PropTypes.number,
  filters: PropTypes.shape({}),
  match: PropTypes.shape({}),
  patronGroup: PropTypes.shape({}),
  accounts: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
};

export default Menu;

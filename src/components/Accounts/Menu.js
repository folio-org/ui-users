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
import { getFullName } from '../../util';

const Menu = (props) => {
  const { user, showFilters, filters, balance, selected, actions, query } = props;
  const outstanding = parseFloat(balance).toFixed(2);
  const showSelected = (selected !== 0 && selected !== parseFloat(0).toFixed(2))
    && outstanding > parseFloat(0).toFixed(2);
  const buttonDisabled = !props.stripes.hasPerm('ui-users.feesfines.actions.all');

  let type = <FormattedMessage id="ui-users.accounts.open" />;
  if (query.layer === 'closed-accounts') {
    type = <FormattedMessage id="ui-users.accounts.closed" />;
  } else if (query.layer === 'all-accounts') {
    type = <FormattedMessage id="ui-users.accounts.all" />;
  }

  const firstMenu = (
    <div>
      <Row>
        <Col style={{ marginLeft: '20px' }}>
          <b><FormattedMessage id="ui-users.accounts.history.statusLabel" values={{ type }} /></b>
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
        <Col style={{ marginLeft: '20px' }}>
          <FormattedMessage
            id="ui-users.accounts.outstanding"
            values={{
              amount: outstanding
            }}
          />
        </Col>
        <Col style={{ marginLeft: '10px' }}>
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
    <div>
      <Button marginBottom0 disabled={buttonDisabled} onClick={e => props.onClickViewChargeFeeFine(e, {})}>
        <FormattedMessage id="ui-users.accounts.button.new" />
      </Button>
      <Button marginBottom0 disabled={!((actions.regularpayment === true) && (buttonDisabled === false))} buttonStyle="primary" onClick={() => { props.onChangeActions({ regular: true }); }}><FormattedMessage id="ui-users.accounts.history.button.pay" /></Button>
      <Button marginBottom0 disabled={!((actions.waive === true) && (buttonDisabled === false))} buttonStyle="primary" onClick={() => { props.onChangeActions({ waiveMany: true }); }}><FormattedMessage id="ui-users.accounts.history.button.waive" /></Button>
      <Button marginBottom0 disabled buttonStyle="primary"><FormattedMessage id="ui-users.accounts.history.button.refund" /></Button>
      <Button marginBottom0 disabled buttonStyle="primary"><FormattedMessage id="ui-users.accounts.history.button.transfer" /></Button>
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
  query: PropTypes.object,
  patronGroup: PropTypes.object,
  onClickViewChargeFeeFine: PropTypes.func,
  onChangeActions: PropTypes.func,
};

export default Menu;

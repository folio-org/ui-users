import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  Row,
  Col,
} from '@folio/stripes/components';
import { Link } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import { getFullName } from '../../util';

const Menu = (props) => {
  const { user, showFilters, filters, balance, selected, actions, query } = props;
  const outstanding = parseFloat(balance).toFixed(2);

  let type = 'Open';
  if (query.layer === 'closed-accounts') {
    type = 'Closed';
  } else if (query.layer === 'all-accounts') {
    type = 'All';
  }

  const rightButton = {
    marginRight: '10px',
    float: 'right',
  };

  return (
    <div>
      <Row>
        <Col xs={6}>
          <Row>
            <Col>
              <b>{`${type} fees/fines for `}</b>
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
            <Col>
              <FormattedMessage id="ui-users.accounts.outstanding" />
              {' '}
              {outstanding}
            </Col>
            <Col style={{ marginLeft: '10px' }}>
              {((selected !== 0 && selected !== parseFloat(0).toFixed(2)) && outstanding > parseFloat(0).toFixed(2)) ?
                `Selected: ${parseFloat(selected).toFixed(2)}`
                : ''
              }
            </Col>
          </Row>
        </Col>
        <Col xs={6}>
          <Button disabled style={rightButton} buttonStyle="primary"><FormattedMessage id="ui-users.accounts.history.button.transfer" /></Button>
          <Button disabled style={rightButton} buttonStyle="primary"><FormattedMessage id="ui-users.accounts.history.button.refund" /></Button>
          <Button disabled={!actions.waive} style={rightButton} buttonStyle="primary" onClick={() => { props.onChangeActions({ waiveMany: true }); }}><FormattedMessage id="ui-users.accounts.history.button.waive" /></Button>
          <Button disabled={!actions.regularpayment} style={rightButton} buttonStyle="primary" onClick={() => { props.onChangeActions({ regular: true }); }}><FormattedMessage id="ui-users.accounts.history.button.pay" /></Button>
          <Button style={rightButton} onClick={e => props.onClickViewChargeFeeFine(e, {})}>
+
            <FormattedMessage id="ui-users.accounts.button.new" />
          </Button>
        </Col>
      </Row>
    </div>
  );
};

Menu.propTypes = {
  user: PropTypes.object,
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

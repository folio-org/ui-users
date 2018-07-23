import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';

import Button from '@folio/stripes-components/lib/Button';
import DropdownMenu from '@folio/stripes-components/lib/DropdownMenu';
import MenuItem from '@folio/stripes-components/lib/MenuItem';
import { Row, Col } from '@folio/stripes-components/lib/LayoutGrid';
import { Link } from 'react-router-dom';
import { UncontrolledDropdown } from '@folio/stripes-components/lib/Dropdown';
import { getFullName } from '../../util';

const Menu = (props) => {
  const { user, showFilters, filters, balance, selected, actions, query } = props;

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
              {`${type} fees/fines for `}
              <Link to={`/users/view/${user.id}`}>
                {getFullName(user)}
                ({_.upperFirst(props.patronGroup.group)})
              </Link>
              {(Object.values(filters).length !== 0 && !showFilters)
                ? <img alt="" src="https://png.icons8.com/color/40/f39c12/filled-filter.png" />
                : ''
              }
            </Col>
          </Row>
          <Row>
            <Col>Outstanding Balance: {balance}</Col>
            <Col style={{ marginLeft: '10px' }}>
              {(selected !== 0) ?
                `Selected: ${selected}`
                : ''
              }
            </Col>
          </Row>
        </Col>
        <Col xs={6}>
          <img alt="" style={rightButton}src="https://png.icons8.com/ios/25/666666/upload.png" />
          <Button disabled={!actions.transfer} style={rightButton} buttonStyle="primary">Transfer</Button>
          <Button disabled={!actions.refund} style={rightButton} buttonStyle="primary">Refund</Button>
          <Button disabled={!actions.waive} style={rightButton} buttonStyle="primary">Waive</Button>
          <UncontrolledDropdown
            onSelectItem={props.handleOptionsChange}
            style={rightButton}
          >
            <Button buttonStyle="primary" data-role="toggle">
              Pay
              <img
                alt=""
                style={{ marginLeft: '10px' }}
                src="https://png.icons8.com/ios/12/ffffff/sort-down-filled.png"
              />
            </Button>
            <DropdownMenu data-role="menu" overrideStyle={{ padding: '6px 0' }}>
              <MenuItem itemMeta={{ action: 'paydown' }}>
                <Button buttonStyle="dropdownItem">Quick Paydown</Button>
              </MenuItem>
              <MenuItem itemMeta={{ action: 'payment' }}>
                <Button disabled={!actions.regularpayment} buttonStyle="dropdownItem">Regular Payment</Button>
              </MenuItem>
            </DropdownMenu>
          </UncontrolledDropdown>
          <Button style={rightButton} onClick={e => props.onClickViewChargeFeeFine(e, {})}>+ New</Button>
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
  handleOptionsChange: PropTypes.func,
  onClickViewChargeFeeFine: PropTypes.func,
};

export default Menu;

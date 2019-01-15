import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import {
  Button,
  Row,
  Col,
  TextField,
} from '@folio/stripes/components';

class ItemInfo extends React.Component {
  static propTypes = {
    onClickSelectItem: PropTypes.func,
    item: PropTypes.object,
    editable: PropTypes.bool,
  };

  constructor(props) {
    super(props);
    this.onClickSelectItem = this.onClickSelectItem.bind(this);
    this.onChangeSelectItem = this.onChangeSelectItem.bind(this);
    this.query = '';
  }

  onClickSelectItem(e) {
    if (e) e.preventDefault();
    this.props.onClickSelectItem(this.query);
  }

  onChangeSelectItem(e) {
    if (e) e.preventDefault();
    this.query = e.target.value;
  }

  render() {
    const {
      location,
      callNumber,
      itemStatus,
      instance,
      barcode,
      id,
    } = this.props.item;

    return (
      <div>
        <h4 className="marginTopHalf">
          <FormattedMessage id="ui-users.charge.item.title" />
        </h4>
        <Row>
          <Col xs={6} sm={5} md={4} lg={3}>
            <FormattedMessage id="ui-users.charge.item.placeholder">
              {placeholder => (
                <TextField
                  placeholder={placeholder}
                  disabled={!this.props.editable}
                  onChange={this.onChangeSelectItem}
                />
              )}
            </FormattedMessage>
          </Col>
          <Col xs={2}>
            <Button
              buttonStyle="primary"
              onClick={this.onClickSelectItem}
              disabled={!this.props.editable}
            >
              <FormattedMessage id="ui-users.charge.item.button" />
            </Button>
          </Col>
        </Row>
        <Row>
          <Col xs={12} sm={10} md={7} lg={5}>
            <Row><Col xs={12}><FormattedMessage id="ui-users.charge.item.barcode" /></Col></Row>
            <Row>
              <Col xs={12}>
                <b>
                  <Link to={`/items/view/${id}`}>
                    {barcode}
                  </Link>
                </b>
              </Col>
            </Row>
          </Col>
        </Row>
        <br />
        <Row>
          <Col xs={12} sm={10} md={7} lg={5}>
            <Row><Col xs={12}><FormattedMessage id="ui-users.charge.item.instance" /></Col></Row>
            <Row><Col xs={12}><b>{instance}</b></Col></Row>
          </Col>
        </Row>
        <br />
        <Row>
          <Col xs={12} sm={10} md={7} lg={5}>
            <Row>
              <Col xs={4}>
                <Row><Col xs={12}><FormattedMessage id="ui-users.charge.item.status" /></Col></Row>
                <Row><Col xs={12}><b>{itemStatus}</b></Col></Row>
              </Col>
              <Col xs={4}>
                <Row><Col xs={12}><FormattedMessage id="ui-users.charge.item.callNumber" /></Col></Row>
                <Row><Col xs={12}><b>{callNumber}</b></Col></Row>
              </Col>
              <Col xs={4}>
                <Row><Col xs={12}><FormattedMessage id="ui-users.charge.item.location" /></Col></Row>
                <Row><Col xs={12}><b>{location}</b></Col></Row>
              </Col>
            </Row>
          </Col>
        </Row>
      </div>
    );
  }
}

export default ItemInfo;

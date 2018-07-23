import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Button from '@folio/stripes-components/lib/Button';
import TextField from '@folio/stripes-components/lib/TextField';
import { Row, Col } from '@folio/stripes-components/lib/LayoutGrid';
import { Link } from 'react-router-dom';

class ItemInfo extends React.Component {
  static propTypes = {
    stripes: PropTypes.shape({
      intl: PropTypes.object,
    }),
    onClickSelectItem: PropTypes.func,
    item: PropTypes.object,
    editable: PropTypes.bool,
  };

  constructor(props) {
    super(props);
    this.onClickSelectItem = this.onClickSelectItem.bind(this);
    this.onChangeSelectItem = this.onChangeSelectItem.bind(this);
    this.query = '0';
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
    const item = this.props.item || {};
    const location = item.location;
    const callnumber = item.callNumber;
    const status = item.itemStatus;
    const instance = item.instance;
    const barcode = item.barcode;
    const id = item.id;

    return (
      <div>
        <h4 className="marginTopHalf"><FormattedMessage id="ui-users.charge.item.title" /></h4>
        <Row>
          <Col xs={12} sm={10} md={7} lg={5}>
            <TextField placeholder={this.props.stripes.intl.formatMessage({ id: 'ui-users.charge.item.placeholder' })} onChange={this.onChangeSelectItem} />
          </Col>
          <Col xs={2}>
            <Button onClick={this.onClickSelectItem} disabled={!this.props.editable}><FormattedMessage id="ui-users.charge.item.button" /></Button>
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
                <Row><Col xs={12}><b>{status}</b></Col></Row>
              </Col>
              <Col xs={4}>
                <Row><Col xs={12}><FormattedMessage id="ui-users.charge.item.callNumber" /></Col></Row>
                <Row><Col xs={12}><b>{callnumber}</b></Col></Row>
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

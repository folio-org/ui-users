import React from 'react';
import PropTypes from 'prop-types';
import Button from '@folio/stripes-components/lib/Button';
import TextField from '@folio/stripes-components/lib/TextField';
import { Row, Col } from '@folio/stripes-components/lib/LayoutGrid';
import { Link } from 'react-router-dom';

class ItemInfo extends React.Component {
  static propTypes = {
    onClickSelectItem: PropTypes.func,
    item: PropTypes.object,
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
        <h4 className="marginTopHalf">Item information</h4>
        <Row>
          <Col xs={12} sm={10} md={7} lg={5}>
            <TextField placeholder="Enter barcode or title" onChange={this.onChangeSelectItem} />
          </Col>
          <Col xs={2}>
            <Button onClick={this.onClickSelectItem}>Select item</Button>
          </Col>
        </Row>
        <Row>
          <Col xs={12} sm={10} md={7} lg={5}>
            <Row><Col xs={12}>Barcode</Col></Row>
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
            <Row><Col xs={12}>Instance</Col></Row>
            <Row><Col xs={12}><b>{instance}</b></Col></Row>
          </Col>
        </Row>
        <br />
        <Row>
          <Col xs={12} sm={10} md={7} lg={5}>
            <Row>
              <Col xs={4}>
                <Row><Col xs={12}>Item status</Col></Row>
                <Row><Col xs={12}><b>{status}</b></Col></Row>
              </Col>
              <Col xs={4}>
                <Row><Col xs={12}>Call number</Col></Row>
                <Row><Col xs={12}><b>{callnumber}</b></Col></Row>
              </Col>
              <Col xs={4}>
                <Row><Col xs={12}>Location</Col></Row>
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

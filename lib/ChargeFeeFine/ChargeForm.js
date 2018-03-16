import React from 'react';
import PropTypes from 'prop-types';
import Paneset from '@folio/stripes-components/lib/Paneset';
import Pane from '@folio/stripes-components/lib/Pane';
import PaneMenu from '@folio/stripes-components/lib/PaneMenu';
import Icon from '@folio/stripes-components/lib/Icon';
import TextField from '@folio/stripes-components/lib/TextField';
import TextArea from '@folio/stripes-components/lib/TextArea';
import Button from '@folio/stripes-components/lib/Button';
import Select from '@folio/stripes-components/lib/Select';
import stripesForm from '@folio/stripes-form';
import { Field } from 'redux-form';
import { Row, Col } from '@folio/stripes-components/lib/LayoutGrid';
import Badge from './Badge/Badge';
//  import Owners from './Owners';
//  import { KeyValue } from '@folio/stripes-components/lib/KeyValue';
//  import css from './ChargeFeeFine.css';

let query = '0';
let total = 0.0;
let feefineamount = 0;
let feefinetaxvat = 0;
let render = true;

function validate(type) {
  const errors = [];
  if (!type.feeFineId) {
    errors.feeFineId = 'Select one to continue';
  }
  if (Number.isNaN(type.amount) && type.amount) {
    errors.amount = 'Amount is NaN';
  }
  if (Number.isNaN(type.totalamount) && type.totalamount) {
    errors.totalamount = 'Tax/Vat is NaN';
  }
  return errors;
}

function onChange(values, dispatch, props, previousValues) {
  if (values.ownerId !== previousValues.ownerId) {
    delete values.amount;
    delete values.totalamount;
    delete values.feeFineId;
    feefineamount = 0;
    feefinetaxvat = 0;
  }
  if (values.feeFineId !== previousValues.feeFineId) {
    values.amount = feefineamount;
    values.totalamount = feefinetaxvat;
  }

  if (values.totalamount && values.amount) {
    total = parseFloat(parseFloat(values.amount) + (parseFloat((values.amount * values.totalamount)) / 100)).toFixed(2);
  } else if (Number.isNaN(values.totalamount) || values.totalamount === 0) {
    total = parseFloat(parseFloat(values.amount)).toFixed(2);
  } else if (Number.isNaN(values.amount)) {
    total = parseFloat(0).toFixed(2);
  }
  return values;
}

class ChargeForm extends React.Component {
  static propTypes = {
    user: PropTypes.object,
    item: PropTypes.object,
    ownerId: PropTypes.string,
    owners: PropTypes.arrayOf(PropTypes.object),
    history: PropTypes.shape({
      push: PropTypes.func.isRequired,
    }),
    feefines: PropTypes.arrayOf(PropTypes.object),
    onClickCharge: PropTypes.func.isRequired,
    onClickCancel: PropTypes.func.isRequired,
    onChangeOwner: PropTypes.func.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    onClickSelectItem: PropTypes.func.isRequired,
    onFindShared: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props);

    this.state = {
      buscar: '',
    };

    this.onChangeSelectItem = this.onChangeSelectItem.bind(this);
    this.onClickSelectItem = this.onClickSelectItem.bind(this);
    this.onChangeFeeFine = this.onChangeFeeFine.bind(this);
  }

  componentWillMount() {
    feefinetaxvat = 0.0;
    feefineamount = 0;
  }

  componentWillReceiveProps(nextProps) {
    if (render && nextProps.owners.length !== 0) {
      const shared = (nextProps.owners.find(o => o.desc === 'Shared') || {}).id;
      this.props.onFindShared(shared);
      render = false;
    }
  }

  onChangeFeeFine(e) {
    const feeFineId = e.target.value.substring(0, 36);
    const feefines = this.props.feefines || [];
    const feefine = feefines.filter(f => f.id === feeFineId)[0];
    feefineamount = feefine ? feefine.defaultAmount : 0;
    feefinetaxvat = feefine ? feefine.taxVat : 0;
  }

  onClickSelectItem() {
    this.props.onClickSelectItem(query);
  }

  onChangeSelectItem(e) {
    this.setState({ buscar: e.target.value });
    query = e.target.value;
  }

  render() {
    let item = {};
    if (this.props.item) {
      item = this.props.item;
    }
    const status = (!item) ? '' : item.itemStatus;
    const location = (!item) ? '' : item.location;
    const itembarcode = (!item) ? '' : item.barcode;
    const instance = (item) ? item.instance : '';
    const callnumber = (item) ? item.callNumber : '';
    const user = (this.props.user) ? this.props.user : {};
    const userid = (user) ? user.id : '0';
    const barcode = (!user) ? '' : user.barcode;
    const name = (!user.personal) ? '' : `${user.personal.lastName}, ${user.personal.firstName}`;
    const feefines = [];
    const owners = [];

    this.props.owners.forEach((owner) => {
      if (owner.desc !== 'Shared') owners.push({ label: owner.desc, value: owner.id });
    });

    this.props.feefines.forEach((feefine) => {
      const fee = {};
      fee.label = feefine.feeFineType;
      fee.value = `${feefine.id}-${this.props.ownerId}`;
      feefines.push(fee);
    });

    const mg = { margin: '6px' };
    const firstMenu = (
      <PaneMenu>
        <button onClick={this.props.onClickCancel}>
          <Row>
            <Col><Icon icon="left-double-chevron" size="large" /></Col>
            <Col><span style={{ fontSize: 'x-large' }}>New fee/fine</span></Col>
          </Row>
        </button>
      </PaneMenu>
    );
    const lastMenu = (
      <PaneMenu>
        <Button onClick={this.props.onClickCancel} style={mg} buttonStyle="secondary">Cancel</Button>
        <Button
          onClick={this.props.handleSubmit((data) => {
          const type = {};
          type.amount = data.amount;
          type.feeFineId = data.feeFineId.substring(0, 36);
          if (Number.isNaN(data.totalamount)) data.totalamount = 0;
          type.amount = parseFloat(data.amount) + (parseFloat(data.amount * data.totalamount) / 100);
          type.comments = data.comments;
          type.ownerId = data.ownerId;
          type.paymentStatus = {
            name: 'Paid Fully',
          };
          type.status = {
            name: 'Closed',
          };
          type.remaining = 0;
          this.props.onClickCharge(type);
        })}
          style={mg}
        >
        Charge and pay
        </Button>
        <Button
          onClick={this.props.handleSubmit((data) => {
          const type = {};
          type.feeFineId = data.feeFineId.substring(0, 36);
          if (Number.isNaN(data.totalamount)) data.totalamount = 0;
          type.amount = parseFloat(data.amount) + (parseFloat(data.amount * data.totalamount) / 100);
          type.totalamount = data.totalamount;
          type.comments = data.comments;
          type.ownerId = data.ownerId;
          type.paymentStatus = {
            name: 'Non Payment',
          };
          type.status = {
            name: 'Open',
          };
          type.remaining = type.amount;
          this.props.onClickCharge(type);
        })}
          style={mg}
        >
        Charge only
        </Button>
      </PaneMenu>);

    return (
      <Paneset>
        <Pane defaultWidth="100%" paneTittle="" firstMenu={firstMenu} lastMenu={lastMenu}>
          <Badge>
            <Row>Patron</Row>
            <Row>
              <Col>
                <a
                  href="#"
                  onClick={() => { this.props.history.push(`/users/view/${userid}`); this.props.onClickCancel(); }}
                >{name}&nbsp; &nbsp; &nbsp;
                </a>
              </Col>
              <Col>Barcode:&nbsp;
                <a
                  href="#"
                  onClick={() => { this.props.history.push(`/users/view/${userid}`); this.props.onClickCancel(); }}
                >
                  {barcode}
                </a>
              </Col>
            </Row>
          </Badge>
          <form>
            <br />
            <Row>
              <Col xs={12} sm={10} md={7} lg={5}>
                <Row>
                  <Col xs={4}>
                    <Row>
                      <Col xs={12}>
                        <b>Fee/fine owner* </b>
                      </Col>
                    </Row>
                    <Row>
                      <Col xs={12}>
                        <Field
                          name="ownerId"
                          component={Select}
                          fullWidth
                          dataOptions={owners}
                          onChange={this.props.onChangeOwner}
                          placeholder="Select One"
                        />
                      </Col>
                    </Row>
                  </Col>
                  <Col xs={4}>
                    <Row>
                      <Col xs={12}>
                        <b>Fee/fine type*</b>
                      </Col>
                    </Row>
                    <Row>
                      <Col xs={12}>
                        <Field
                          name="feeFineId"
                          component={Select}
                          fullWidth
                          dataOptions={feefines}
                          placeholder="Select One"
                          onChange={this.onChangeFeeFine}
                        />
                      </Col>
                    </Row>
                  </Col>
                  <Col xs={4}>
                    <Row>
                      <Col xs={12}>
                        <b>Fee/fine amount*</b>
                      </Col>
                    </Row>
                    <Row>
                      <Col xs={12}>
                        <Field
                          name="amount"
                          component={TextField}
                          fullWidth
                          onChange={this.onChangeAmount}
                          value="Valor"
                        />
                      </Col>
                    </Row>
                    <Row>
                      <Col xs={6}>
                        Tax/Vat:
                      </Col>
                      <Col xs={6}>
                        <Field
                          name="totalamount"
                          component={TextField}
                          fullWidth
                          onChange={this.onChangeTaxVat}
                          value="Valor"
                        />
                      </Col>
                    </Row>
                    <Row>
                      <Col xs={6}>
                        <b>Total:</b>
                      </Col>
                      <Col xs={6}>
                        {total}
                      </Col>
                    </Row>
                  </Col>
                </Row>
              </Col>
            </Row>
            <br />
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
                      <a
                        href="#"
                        onClick={() => {
                          this.props.history.push(`/items/view/${item.id}`);
                          this.props.onClickCancel();
                        }}
                      >
                        {itembarcode}
                      </a>
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
            <br />
            <h4 className="marginTopHalf">Comments</h4>
            <Row>
              <Col xs={12} sm={10} md={7} lg={5}>
                <Field
                  id="comments"
                  name="comments"
                  component={TextArea}
                  fullWidth
                />
              </Col>
            </Row>
          </form>
        </Pane>
      </Paneset>
    );
  }
}

export default stripesForm({
  form: 'chargefeefine',
  validate,
  onChange,
  navigationCheck: true,
})(ChargeForm);

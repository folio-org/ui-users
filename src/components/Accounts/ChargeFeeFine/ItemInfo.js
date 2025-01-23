import React from 'react';
import { Field } from 'react-final-form';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';

import {
  Button,
  Row,
  Col,
  TextField,
} from '@folio/stripes/components';

import { NEW_FEE_FINE_FIELD_NAMES } from '../../../constants';

class ItemInfo extends React.Component {
  static propTypes = {
    resources: PropTypes.shape({
      items: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
    }).isRequired,
    form: PropTypes.object.isRequired,
    onClickSelectItem: PropTypes.func,
    item: PropTypes.object,
    editable: PropTypes.bool,
  };

  static defaultProps = {
    item: {}
  }

  constructor(props) {
    super(props);
    this.onClickSelectItem = this.onClickSelectItem.bind(this);
    this.onChangeSelectItem = this.onChangeSelectItem.bind(this);
    this.query = '';
    this.state = {
      isBarcodeChangedAfterValidation: false,
    };
  }

  componentDidUpdate(prevProps) {
    const {
      resources: {
        items,
      },
    } = this.props;
    const {
      resources: {
        items: prevItems,
      },
    } = prevProps;

    if (prevItems.records !== items.records && this.state.isBarcodeChangedAfterValidation) {
      this.triggerItemBarcodeValidation();
      this.setState({
        isBarcodeChangedAfterValidation: false,
      });
    }
  }

  onClickSelectItem(e) {
    if (e) e.preventDefault();
    this.props.onClickSelectItem(this.query);
  }

  onChangeSelectItem(e) {
    const value = e.target.value;
    const {
      form,
      resources,
    } = this.props;
    const {
      isBarcodeChangedAfterValidation,
    } = this.state;

    if (e) {
      e.preventDefault();
    }

    if (resources.activeRecord?.barcode && resources.activeRecord?.barcode !== value) {
      this.props.mutator.activeRecord.replace({
        ...resources.activeRecord,
        isBarcodeValidated: false,
        barcode: '',
      });
    }

    if (!isBarcodeChangedAfterValidation) {
      this.setState({
        isBarcodeChangedAfterValidation: true,
      });
    }

    form.change(NEW_FEE_FINE_FIELD_NAMES.ITEM_BARCODE, value);
    this.query = value;
  }

  triggerItemBarcodeValidation = () => {
    const {
      form,
      values,
    } = this.props;

    form.change(NEW_FEE_FINE_FIELD_NAMES.KEY_OF_ITEM_BARCODE, values[NEW_FEE_FINE_FIELD_NAMES.KEY_OF_ITEM_BARCODE] ? 0 : 1);
  };

  validateBarcode = (barcode) => {
    const {
      resources: {
        items,
        activeRecord,
      },
    } = this.props;

    if (barcode && barcode === activeRecord.barcode && items.records.length === 0) {
      return (
        <FormattedMessage
          id="ui-users.charge.item.barcode.error"
          values={{ barcode }}
        />
      );
    }

    return undefined;
  };

  render() {
    const {
      item: {
        location,
        callNumber,
        itemStatus,
        instance,
        barcode,
        id,
      },
      values,
      editable,
      resources: {
        items,
      },
    } = this.props;
    const {
      isBarcodeChangedAfterValidation,
    } = this.state;
    const isEnterButtonDisabled = !editable || items.isPending;

    return (
      <div>
        <h4 className="marginTopHalf">
          <FormattedMessage id="ui-users.charge.item.title" />
        </h4>
        <Row>
          <Col xs={8}>
            <FormattedMessage id="ui-users.charge.item.placeholder">
              {placeholder => {
                const key = values[NEW_FEE_FINE_FIELD_NAMES.KEY_OF_ITEM_BARCODE] ?? 0;

                return (
                  <Field
                    name={NEW_FEE_FINE_FIELD_NAMES.ITEM_BARCODE}
                    key={key}
                    validate={this.validateBarcode}
                    validateFields={[]}
                  >
                    {
                      ({input, meta}) => {
                        const validationError = !isBarcodeChangedAfterValidation && meta.error;

                        return (
                          <TextField
                            {...input}
                            placeholder={placeholder}
                            disabled={!editable}
                            onChange={this.onChangeSelectItem}
                            error={validationError}
                          />
                        );
                      }
                    }
                  </Field>
                );
              }}
            </FormattedMessage>
          </Col>
          <Col xs={2}>
            <Button
              buttonStyle="primary"
              onClick={this.onClickSelectItem}
              disabled={isEnterButtonDisabled}
            >
              <FormattedMessage id="ui-users.charge.item.button" />
            </Button>
          </Col>
        </Row>
        <Row>
          <Col xs={8} sm={10} md={7} lg={5}>
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
        <Row>
          <Col xs={8} sm={10} md={7} lg={5}>
            <Row><Col xs={12}><FormattedMessage id="ui-users.charge.item.instance" /></Col></Row>
            <Row><Col xs={12}><b>{instance}</b></Col></Row>
          </Col>
        </Row>
        <Row>
          <Col xs={12}>
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

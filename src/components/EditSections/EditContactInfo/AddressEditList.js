import React from 'react';
import PropTypes from 'prop-types';
import { FieldArray } from 'redux-form';
import { Button, Col, Layout, Row } from '@folio/stripes-components';
import { FormattedMessage } from 'react-intl';
import AddressSel from './AddressSel';
import css from './AddressEdit.css';

const propTypes = {
  label: PropTypes.node,
  name: PropTypes.string,
  onAdd: PropTypes.func,
  onDelete: PropTypes.func,
};

const defaultProps = {
  label: 'Addresses',
};

class AddressEditList extends React.Component {
  constructor(props) {
    super(props);
    this.renderFieldGroups = this.renderFieldGroups.bind(this);
    this.onAdd = this.onAdd.bind(this);
    this.onDelete = this.onDelete.bind(this);
  }

  onAdd(fields) {
    fields.push({});
    if (this.props.onAdd) {
      this.props.onAdd(fields.length - 1);
    }
  }

  onDelete(fields, index) {
    fields.remove(index);
    if (this.props.onDelete) {
      this.props.onDelete(index);
    }
  }

  renderFieldGroups({ fields }) {
    return (

      <div className={css.addressEditList}>
        <Row>
          <Col xs>
            <div className={css.legend} id="addressGroupLabel">{this.props.label}</div>
          </Col>
        </Row>
        <Row>
          <Col xs>
            {fields.length === 0 &&
              <div><em>- No addresses stored -</em></div>
            }
            <ul className={css.addressFormList} aria-labelledby="addressGroupLabel">
              {fields.map((fieldName, i) => (
                <li className={css.addressFormListItem} key={i}>
                  <AddressSel
                    fieldKey={i}
                    addressFieldName={fieldName}
                    handleDelete={(index) => { this.onDelete(fields, index); }}
                    {...this.props}
                  />
                </li>
              ))}
            </ul>
          </Col>
        </Row>
        <Row>
          <Col xs>
            <Layout>
              <Button type="button" onClick={() => { this.onAdd(fields); }}>
                <FormattedMessage
                  id="stripes-smart-components.address.addAddress"
                />
              </Button>
            </Layout>
          </Col>
        </Row>
      </div>

    );
  }

  render() {
    return (
      <FieldArray name={this.props.name} component={this.renderFieldGroups} />
    );
  }
}

AddressEditList.propTypes = propTypes;
AddressEditList.defaultProps = defaultProps;

export default AddressEditList;
import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from '@folio/stripes-components/lib/LayoutGrid';
import Pluggable from '@folio/stripes-components/lib/Pluggable';
import Layout from '@folio/stripes-components/lib/Layout';
import { FieldArray } from 'redux-form';

import ProxyEditItem from '../ProxyEditItem';
import css from './ProxyEditList.css';

export default class ProxyEditList extends React.Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
  };

  constructor(props) {
    super(props);
    this.renderList = this.renderList.bind(this);
    this.onDelete = this.onDelete.bind(this);
  }

  // eslint-disable-next-line class-methods-use-this
  onAdd(user, fields) {
    fields.unshift({ user });
  }

  // eslint-disable-next-line class-methods-use-this
  onDelete(index, fields) {
    fields.remove(index);
  }

  renderList({ fields }) {
    const disableRecordCreation = true;
    const items = fields.map((name, index) => (
      <ProxyEditItem
        field={fields.get(index)}
        key={`proxy-${index}`}
        name={name}
        onDelete={() => this.onDelete(index, fields)}
      />
    ));

    return (
      <div>
        <Row>
          <Col xs>
            <h3 className={css.label}>Proxies</h3>
          </Col>
          <Col xs={4}>
            <Layout className="right">
              <Pluggable
                aria-haspopup="true"
                type="find-user"
                {...this.props}
                dataKey={this.props.name}
                searchLabel="+ New"
                searchButtonStyle="primary"
                selectUser={user => this.onAdd(user, fields)}
                visibleColumns={['Name', 'Patron Group', 'Username', 'Barcode']}
                disableRecordCreation={disableRecordCreation}
              />
            </Layout>
          </Col>
        </Row>
        {items}
        {!items.length && <p>No proxies found</p>}
      </div>
    );
  }

  render() {
    return (
      <FieldArray name={this.props.name} component={this.renderList} />
    );
  }
}

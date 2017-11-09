import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from '@folio/stripes-components/lib/LayoutGrid';
import MultiColumnList from '@folio/stripes-components/lib/MultiColumnList';
import Pluggable from '@folio/stripes-components/lib/Pluggable';
import Layout from '@folio/stripes-components/lib/Layout';
import Button from '@folio/stripes-components/lib/Button';
import { FieldArray } from 'redux-form';

import ProxyEditItem from '../ProxyEditItem';
import css from './ProxyEditList.css';

export default class ProxyEditList extends React.Component {
  static propTypes = {
    proxies: PropTypes.arrayOf(PropTypes.object),
    onAdd: PropTypes.func,
  };

  constructor(props) {
    super(props);
  }

  onAdd(fields) {

  }

  renderList() {
    const items = this.props.proxies.map((proxy, index) => (
      <ProxyEditItem key={`proxy-${index}`} proxy={proxy} />
    ));

    return (
      <div>
        <Row>
          <Col xs>
            <h3 className={css.label}>Proxies</h3>
          </Col>
          <Col xs={4}>
            <Layout className="right">
              <Button type="button" onClick={() => this.onAdd()}>+ New</Button>
            </Layout>
          </Col>
        </Row>
        {items}
      </div>
    );
  }

  render() {
    const list = this.renderList();
    return (
      list
      /* <FieldArray name="proxies" component={this.renderList} /> */
    );
  }
}
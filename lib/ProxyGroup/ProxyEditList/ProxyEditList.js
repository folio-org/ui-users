import React from 'react';
import PropTypes from 'prop-types';
import { FieldArray } from 'redux-form';
import { Row, Col } from '@folio/stripes-components/lib/LayoutGrid';
import Pluggable from '@folio/stripes-components/lib/Pluggable';
import Layout from '@folio/stripes-components/lib/Layout';
import ConfirmationModal from '@folio/stripes-components/lib/structures/ConfirmationModal';

import { getFullName } from '../../../util';
import css from './ProxyEditList.css';

export default class ProxyEditList extends React.Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    itemComponent: PropTypes.func.isRequired,
    initialValues: PropTypes.object,
  };

  constructor(props) {
    super(props);
    this.renderList = this.renderList.bind(this);
    this.state = { confirmDelete: false };
  }

  onAdd(user) {
    const meta = {
      accrueTo: 'Sponsor',
      notificationsTo: 'Sponsor',
      requestForSponsor: 'Yes',
      status: 'Active',
    };

    this.fields.unshift({ user, meta });
  }

  beginDelete(index, record) {
    this.setState({
      index,
      curRecord: record,
      confirmDelete: true,
    });
  }

  confirmDelete(confirmation) {
    if (confirmation) {
      this.fields.remove(this.state.index);
    }

    this.setState({ confirmDelete: false });
  }

  renderList({ fields }) {
    this.fields = fields;

    const disableRecordCreation = true;
    const { itemComponent, label, name } = this.props;
    const ComponentToRender = itemComponent;

    const items = fields.map((fieldName, index) => (
      <ComponentToRender
        record={fields.get(index)}
        key={`item-${index}`}
        name={fieldName}
        onDelete={record => this.beginDelete(index, record)}
      />
    ));

    return (
      <div>
        <Row>
          <Col xs>
            <h3 className={css.label}>{label}</h3>
          </Col>
          <Col xs={4}>
            <Layout className="right">
              <Pluggable
                aria-haspopup="true"
                type="find-user"
                {...this.props}
                dataKey={name}
                searchLabel="+ New"
                searchButtonStyle="primary"
                selectUser={user => this.onAdd(user)}
                visibleColumns={['Name', 'Patron Group', 'Username', 'Barcode']}
                disableRecordCreation={disableRecordCreation}
              />
            </Layout>
          </Col>
        </Row>
        {items.length ? items : <i>- No {name} found -</i>}
      </div>
    );
  }

  render() {
    const { confirmDelete, curRecord } = this.state;
    const { initialValues, name } = this.props;

    return (
      <div>
        <FieldArray name={name} component={this.renderList} />
        {confirmDelete &&
          <ConfirmationModal
            open={confirmDelete}
            heading="Delete Proxy?"
            message={(<span>The proxy relationship of <strong>{getFullName(curRecord.user)}</strong> to <strong>{getFullName(initialValues)}</strong> will be deleted.</span>)}
            onConfirm={() => this.confirmDelete(true)}
            onCancel={() => this.confirmDelete(false)}
            confirmLabel="Delete"
          />
        }
      </div>
    );
  }
}

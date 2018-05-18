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
    stripes: PropTypes.object.isRequired,
    name: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    itemComponent: PropTypes.func.isRequired,
    initialValues: PropTypes.object,
    change: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.renderList = this.renderList.bind(this);
    this.state = { confirmDelete: false };
  }

  onAdd(user) {
    const proxy = {
      accrueTo: 'Sponsor',
      notificationsTo: 'Sponsor',
      requestForSponsor: 'Yes',
      status: 'Active',
    };

    this.fields.unshift({ user, proxy });
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
    const { itemComponent, label, name, stripes: { intl }, stripes } = this.props;
    const ComponentToRender = itemComponent;

    const items = fields.map((fieldName, index) => (
      <ComponentToRender
        record={fields.get(index)}
        index={index}
        key={`item-${index}`}
        namespace={name}
        name={fieldName}
        onDelete={record => this.beginDelete(index, record)}
        intl={intl}
        stripes={stripes}
        change={this.props.change}
      />
    ));

    // map column-IDs to table-header-values
    const columnMapping = {
      name: intl.formatMessage({ id: 'ui-users.information.name' }),
      patronGroup: intl.formatMessage({ id: 'ui-users.information.patronGroup' }),
      username: intl.formatMessage({ id: 'ui-users.information.username' }),
      barcode: intl.formatMessage({ id: 'ui-users.information.barcode' }),
    };

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
                searchButtonStyle="default"
                selectUser={user => this.onAdd(user)}
                visibleColumns={['name', 'patronGroup', 'username', 'barcode']}
                columnMapping={columnMapping}
                disableRecordCreation={disableRecordCreation}
              >
                <span>[no user-selection plugin]</span>
              </Pluggable>
            </Layout>
          </Col>
        </Row>
        {items.length ? items : <p className={css.isEmptyMessage}>No {name} found</p>}
      </div>
    );
  }

  renderConfirmModal() {
    const { confirmDelete, curRecord } = this.state;
    const { initialValues, name } = this.props;
    const heading = (name === 'sponsors') ? 'Delete Sponsor?' : 'Delete Proxy?';
    const message = (name === 'sponsors')
      ? (<span>The proxy relationship of <strong>{getFullName(initialValues)}</strong> to <strong>{getFullName(curRecord.user)}</strong> will be deleted.</span>)
      : (<span>The proxy relationship of <strong>{getFullName(curRecord.user)}</strong> to <strong>{getFullName(initialValues)}</strong> will be deleted.</span>);

    return (
      <ConfirmationModal
        open={confirmDelete}
        heading={heading}
        message={message}
        onConfirm={() => this.confirmDelete(true)}
        onCancel={() => this.confirmDelete(false)}
        confirmLabel="Delete"
      />
    );
  }

  render() {
    return (
      <div>
        <FieldArray name={this.props.name} component={this.renderList} />
        {this.state.confirmDelete && this.renderConfirmModal()}
      </div>
    );
  }
}

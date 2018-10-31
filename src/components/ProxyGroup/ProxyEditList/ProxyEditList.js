import React from 'react';
import PropTypes from 'prop-types';
import { FieldArray } from 'redux-form';
import { FormattedMessage } from 'react-intl';
import SafeHTMLMessage from '@folio/react-intl-safe-html';
import {
  Row,
  Col,
  Layout,
  ConfirmationModal,
} from '@folio/stripes/components';
import { Pluggable } from '@folio/stripes/core';

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

  renderConfirmModal() {
    const { confirmDelete, curRecord } = this.state;
    const { initialValues, name } = this.props;
    const formatMsg = this.props.stripes.intl.formatMessage;
    const heading = (name === 'sponsors') ? formatMsg({ id: 'ui-users.deleteSponsorPrompt' }) : formatMsg({ id: 'ui-users.deleteProxyPrompt' });
    const sponsorsMsg = <SafeHTMLMessage id="ui-users.proxyWillBeDeleted" values={{ name1: getFullName(initialValues), name2: getFullName(curRecord.user) }} />;
    const proxyMsg = <SafeHTMLMessage id="ui-users.proxyWillBeDeleted" values={{ name1: getFullName(curRecord.user), name2: getFullName(initialValues) }} />;
    const message = (name === 'sponsors') ? sponsorsMsg : proxyMsg;

    return (
      <ConfirmationModal
        id={`delete${name}-confirmation`}
        open={confirmDelete}
        heading={heading}
        message={message}
        onConfirm={() => this.confirmDelete(true)}
        onCancel={() => this.confirmDelete(false)}
        confirmLabel={formatMsg({ id: 'ui-users.delete' })}
      />
    );
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
                searchLabel={intl.formatMessage({ id: 'stripes-components.addNew' })}
                searchButtonStyle="default"
                selectUser={user => this.onAdd(user)}
                visibleColumns={['active', 'name', 'patronGroup', 'username', 'barcode']}
                columnMapping={columnMapping}
                disableRecordCreation={disableRecordCreation}
              >
                <span>[no user-selection plugin]</span>
              </Pluggable>
            </Layout>
          </Col>
        </Row>
        {items.length ? items : <p className={css.isEmptyMessage}><FormattedMessage id="ui-users.noItemFound" values={{ item: name }} /></p>}
      </div>
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

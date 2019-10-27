import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { FieldArray } from 'redux-form';
import {
  FormattedMessage,
  injectIntl,
  intlShape,
} from 'react-intl';
import SafeHTMLMessage from '@folio/react-intl-safe-html';
import {
  Row,
  Col,
  Layout,
  ConfirmationModal,
} from '@folio/stripes/components';
import { Pluggable } from '@folio/stripes/core';

import ErrorModal from '../../ErrorModal';
import { getFullName } from '../../util';
import css from './ProxyEditList.css';

class ProxyEditList extends React.Component {
  static propTypes = {
    stripes: PropTypes.object.isRequired,
    name: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    itemComponent: PropTypes.func.isRequired,
    initialValues: PropTypes.object,
    change: PropTypes.func.isRequired,
    intl: intlShape.isRequired,
  };

  constructor(props) {
    super(props);
    this.renderList = this.renderList.bind(this);
    this.hideModal = this.hideModal.bind(this);
    this.state = { confirmDelete: false };
  }

  validate(user) {
    const { initialValues, name } = this.props;
    const { id } = initialValues;

    if (id !== user.id) return true;

    const error = {
      label: <FormattedMessage id={`ui-users.errors.${name}.invalidUserLabel`} />,
      message: <FormattedMessage id={`ui-users.errors.${name}.invalidUserMessage`} />,
    };

    this.setState({ error });

    return false;
  }

  onAdd(user) {
    if (!this.validate(user)) return;

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
    const {
      confirmDelete,
      curRecord,
    } = this.state;
    const {
      initialValues,
      name,
    } = this.props;
    const heading = (name === 'sponsors') ?
      <FormattedMessage id="ui-users.deleteSponsorPrompt" /> :
      <FormattedMessage id="ui-users.deleteProxyPrompt" />;
    const sponsorsMsg = <SafeHTMLMessage
      id="ui-users.proxyWillBeDeleted"
      values={{ name1: getFullName(initialValues), name2: getFullName(curRecord.user) }}
    />;
    const proxyMsg = <SafeHTMLMessage
      id="ui-users.proxyWillBeDeleted"
      values={{ name1: getFullName(curRecord.user), name2: getFullName(initialValues) }}
    />;
    const message = (name === 'sponsors') ? sponsorsMsg : proxyMsg;

    return (
      <ConfirmationModal
        id={`delete${name}-confirmation`}
        open={confirmDelete}
        heading={heading}
        message={message}
        onConfirm={() => this.confirmDelete(true)}
        onCancel={() => this.confirmDelete(false)}
        confirmLabel={<FormattedMessage id="ui-users.delete" />}
      />
    );
  }

  renderErrorModal() {
    const { error } = this.state;

    return (
      <ErrorModal
        id="proxy-error-modal"
        open={!!error}
        onClose={this.hideModal}
        message={error.message}
        label={error.label}
      />
    );
  }

  hideModal() {
    this.setState({ error: null });
  }

  renderList({ fields }) {
    this.fields = fields;

    const disableRecordCreation = true;
    const {
      itemComponent,
      label,
      name,
      stripes,
      change,
      intl,
    } = this.props;
    const ComponentToRender = itemComponent;

    const items = fields.map((fieldName, index) => (
      <ComponentToRender
        record={fields.get(index)}
        index={index}
        key={`item-${index}`}
        namespace={name}
        name={fieldName}
        onDelete={record => this.beginDelete(index, record)}
        stripes={stripes}
        change={change}
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
        </Row>
        <Layout className="fullWidth" data-test={name}>
          {items.length ?
            items :
            <p className={css.isEmptyMessage}>
              <FormattedMessage
                id="ui-users.noItemFound"
                values={{ item: name }}
              />
            </p>
          }
        </Layout>
        <Row>
          <Col xs={4}>
            <Layout>
              <Pluggable
                aria-haspopup="true"
                id={`clickable-plugin-find-${name === 'proxies' ? 'proxy' : 'sponsor'}`}
                type="find-user"
                {...this.props}
                dataKey={name}
                searchLabel={
                  name === 'proxies' ?
                    <FormattedMessage id="ui-users.sponsor.addSponsor" /> :
                    <FormattedMessage id="ui-users.proxy.addProxy" />
                }
                searchButtonStyle="default"
                selectUser={user => this.onAdd(user)}
                visibleColumns={['status', 'name', 'patronGroup', 'username', 'barcode']}
                columnMapping={columnMapping}
                disableRecordCreation={disableRecordCreation}
              >
                <span>[no user-selection plugin]</span>
              </Pluggable>
            </Layout>
          </Col>
        </Row>
      </div>
    );
  }

  render() {
    const { error, confirmDelete } = this.state;

    return (
      <Fragment>
        <FieldArray name={this.props.name} component={this.renderList} />
        {confirmDelete && this.renderConfirmModal()}
        {error && this.renderErrorModal()}
      </Fragment>
    );
  }
}

export default injectIntl(ProxyEditList);

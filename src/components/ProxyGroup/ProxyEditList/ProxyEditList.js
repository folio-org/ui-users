import React from 'react';
import PropTypes from 'prop-types';
import { FieldArray } from 'react-final-form-arrays';
import {
  FormattedMessage,
  injectIntl,
} from 'react-intl';
import {
  Row,
  Col,
  Layout,
  ConfirmationModal,
} from '@folio/stripes/components';
import { Pluggable } from '@folio/stripes/core';

import ErrorModal from '../../ErrorModal';
import { withFormValues } from '../../Wrappers';
import { getFullName } from '../../util';
import css from './ProxyEditList.css';

class ProxyEditList extends React.Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    itemComponent: PropTypes.func.isRequired,
    initialValues: PropTypes.object,
    change: PropTypes.func.isRequired,
    intl: PropTypes.object.isRequired,
    values: PropTypes.object,
  };

  constructor(props) {
    super(props);
    this.renderList = this.renderList.bind(this);
    this.hideModal = this.hideModal.bind(this);
    this.state = { confirmDelete: false };
  }

  validate(user) {
    const {
      initialValues: { id },
      values,
      name,
    } = this.props;
    let error;

    if (id === user.id) {
      error = {
        label: <FormattedMessage id={`ui-users.errors.${name}.invalidUserLabel`} />,
        message: <FormattedMessage id={`ui-users.errors.${name}.invalidUserMessage`} />,
      };
    }

    values[name].forEach(({ user: { id: userId } }) => {
      if (userId === user.id) {
        error = {
          label: <FormattedMessage id={`ui-users.errors.${name}.invalidUserLabel`} />,
          message: <FormattedMessage id={`ui-users.errors.${name}.duplicateUserMessage`} />,
        };
      }
    });

    if (error) {
      this.setState({ error });
      return false;
    }

    return true;
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
    const sponsorsMsg = <FormattedMessage
      id="ui-users.proxyWillBeDeleted"
      values={{ name1: getFullName(initialValues), name2: getFullName(curRecord.user) }}
    />;
    const proxyMsg = <FormattedMessage
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
      change,
      intl,
      values,
    } = this.props;
    const ComponentToRender = itemComponent;

    const items = fields.map((fieldName, index) => (
      <ComponentToRender
        record={fields.value[index]}
        index={index}
        key={`item-${index}`}
        namespace={name}
        name={fieldName}
        onDelete={record => this.beginDelete(index, record)}
        change={change}
        formValues={values}
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
      <>
        <FieldArray name={this.props.name} component={this.renderList} />
        {confirmDelete && this.renderConfirmModal()}
        {error && this.renderErrorModal()}
      </>
    );
  }
}

export default withFormValues(injectIntl(ProxyEditList));

import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import {
  injectIntl,
  FormattedMessage,
} from 'react-intl';
import { Field } from 'react-final-form';
import {
  Select,
  Label,
  NoValue,
} from '@folio/stripes/components';
import { ControlledVocab } from '@folio/stripes/smart-components';
import { stripesConnect, withStripes } from '@folio/stripes/core';

import { validate } from '../components/util';
import {
  Owners,
  CopyModal,
  ChargeNotice,
} from './FeeFinesTable';

import {
  MAX_RECORDS,
  SHARED_OWNER,
} from '../constants';

const columnMapping = {
  feeFineType: (
    <Label
      tagName="span"
      required
    >
      <FormattedMessage id="ui-users.feefines.columns.type" />
    </Label>
  ),
  defaultAmount: <FormattedMessage id="ui-users.feefines.columns.amount" />,
  chargeNoticeId: <FormattedMessage id="ui-users.feefines.columns.chargeNotice" />,
  actionNoticeId: <FormattedMessage id="ui-users.feefines.columns.actionNotice" />,
};

class FeeFineSettings extends React.Component {
  static manifest = Object.freeze({
    feefines: {
      type: 'okapi',
      records: 'feefines',
      path: 'feefines',
      throwErrors: false,
      GET: {
        path: 'feefines?query=cql.allRecords=1 sortby feeFineType&limit=10000',
      },
    },
    owners: {
      type: 'okapi',
      records: 'owners',
      path: 'owners?query=cql.allRecords=1 sortby owner&limit=2000',
      accumulate: 'true',
      PUT: {
        path: 'owners/%{activeRecord.ownerId}',
      }
    },
    templates: {
      type: 'okapi',
      records: 'templates',
      path: `templates?limit=${MAX_RECORDS}&query=cql.allRecords=1 AND category=""`,
      accumulate: 'true',
    },
    activeRecord: {},
  });

  static propTypes = {
    stripes: PropTypes.shape({
      connect: PropTypes.func.isRequired,
    }).isRequired,
    resources: PropTypes.object,
    mutator: PropTypes.shape({
      feefines: PropTypes.shape({
        POST: PropTypes.func.isRequired,
      }),
      templates: PropTypes.shape({
        GET: PropTypes.func.isRequired,
      }),
      activeRecord: PropTypes.shape({
        update: PropTypes.func,
      }),
      owners: PropTypes.shape({
        GET: PropTypes.func.isRequired,
        PUT: PropTypes.func.isRequired,
      }),
    }).isRequired,
    intl: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);

    this.state = {
      ownerId: '',
      owners: [],
      templates: [],
    };

    this.connectedControlledVocab = props.stripes.connect(ControlledVocab);
    this.onChangeOwner = this.onChangeOwner.bind(this);
    this.onCopyFeeFines = this.onCopyFeeFines.bind(this);
    this.hideCopyDialog = this.hideCopyDialog.bind(this);
  }

  componentDidMount() {
    this.props.mutator.owners.GET().then(records => {
      const shared = records.find(o => o.owner === SHARED_OWNER);
      this.shared = shared;
      const ownerId = (shared) ? shared.id : ((records.length > 0) ? records[0].id : '');
      this.setState({ ownerId, owners: records });
    });
    this.props.mutator.templates.GET().then(records => {
      this.setState({ templates: records });
    });
  }

  onChangeOwner(e) {
    const ownerId = e.target.value;
    this.setState({ ownerId });
    const nextFeeFines = _.get(this.props.resources, ['feefines', 'records'], [])
      .filter(f => f.ownerId === ownerId) || [];
    const filterOwners = this.getOwners();
    if (!nextFeeFines.length && (ownerId !== (this.shared || {}).id) && !!filterOwners.length) {
      this.setState({ showCopyDialog: true });
    }
  }

  onCopyFeeFines(values) {
    const { ownerId, option } = values;
    const feefines = _.get(this.props.resources, ['feefines', 'records'], []);
    if (option === 'true') {
      const source = feefines.filter(f => f.ownerId === ownerId) || [];
      source.forEach(item => {
        delete item.id;
        item.ownerId = this.state.ownerId;
        this.props.mutator.feefines.POST(item);
      });
    }
    this.hideCopyDialog();
  }

  hideCopyDialog() {
    this.setState({
      showCopyDialog: false,
    });
  }

  includes(item, index, items) {
    for (let i = 0; i < items.length; i++) {
      const myItem = items[i];
      if (((myItem || {}).feeFineType || '').toLowerCase() === ((item || {}).feeFineType || '').toLowerCase()
        && myItem.id !== item.id) {
        return myItem.ownerId;
      }
    }
    return null;
  }

  validate = (item, index, items) => {
    const { intl: { formatMessage } } = this.props;

    const feefines = _.get(this.props.resources, ['feefines', 'records'], []);
    const myFeeFines = feefines.filter(f => f.ownerId !== this.state.ownerId) || [];
    const label = formatMessage({ id: 'ui-users.feefines.singular' });
    const itemErrors = validate(item, index, items, 'feeFineType', label);
    const isAutomatedFeeFineNameUsed = feefines.some(feeFine => {
      return item.feeFineType && feeFine.automatic && item.feeFineType.toLowerCase() === feeFine.feeFineType.toLowerCase();
    });

    if (Number.isNaN(Number(item.defaultAmount)) && item.defaultAmount) {
      itemErrors.defaultAmount = formatMessage({ id: 'ui-users.feefines.errors.amountNumeric' });
    }
    if (parseFloat(item.defaultAmount) < 0) {
      itemErrors.defaultAmount = formatMessage({ id: 'ui-users.feefines.errors.amountPositive' });
    }
    if (!item.feeFineType) {
      itemErrors.feeFineType = formatMessage({ id: 'stripes-core.label.missingRequiredField' });
    }
    if (this.state.ownerId === (this.shared || {}).id) {
      const includes = this.includes(item, index, myFeeFines, 'feeFineType', 'ownerId');
      if (includes) {
        itemErrors.feeFineType = <FormattedMessage id="ui-users.feefines.errors.existOther" />;
      }
    } else {
      const shareds = feefines.filter(f => f.ownerId === (this.shared || {}).id) || [];
      const includes = this.includes(item, index, shareds, 'feeFineType', 'ownerId');
      if (includes) {
        itemErrors.feeFineType = <FormattedMessage id="ui-users.feefines.errors.existShared" />;
      }
    }

    if (isAutomatedFeeFineNameUsed) {
      itemErrors.feeFineType = <FormattedMessage id="ui-users.feefines.errors.reservedName" />;
    }

    return itemErrors;
  }

  getOwners = () => {
    const items = _.get(this.props.resources, ['feefines', 'records'], []);
    const filterOwners = [];
    const { owners } = this.state;

    items.forEach(i => {
      const owner = owners.find(o => o.id === i.ownerId);
      if (owner && !filterOwners.some(o => o.id === owner.id) && owner.id !== (this.shared || {}).id) {
        filterOwners.push(owner);
      }
    });
    return filterOwners;
  }

  getDefaultNotices = () => {
    const { owners, ownerId } = this.state;
    const { defaultActionNoticeId, defaultChargeNoticeId } = owners.find(o => o.id === ownerId) || {};

    return {
      defaultChargeNoticeId,
      defaultActionNoticeId,
    };
  }

  onUpdateOwner = (item) => {
    const { owners, ownerId } = this.state;
    const owner = owners.find(o => o.id === ownerId) || {};
    owner.defaultChargeNoticeId = item.defaultChargeNoticeId;
    owner.defaultActionNoticeId = item.defaultActionNoticeId;
    this.props.mutator.activeRecord.update({ ownerId });
    return this.props.mutator.owners.PUT(owner);
  }

  getNotice = (noticeTypeId, noticeType) => {
    const { templates } = this.state;
    const defaultNotices = this.getDefaultNotices();
    const defaultNoticeId = defaultNotices[`default${noticeType}NoticeId`];
    const defaultMessage = <FormattedMessage id="ui-users.settings.default" />;
    let templateName = templates.find(t => t.id === noticeTypeId) || {};

    if (noticeTypeId) {
      templateName = templateName?.name;
    } else if (!noticeTypeId && defaultNoticeId) {
      templateName = defaultMessage;
    } else {
      templateName = <NoValue />;
    }

    return templateName;
  }

  render() {
    const { intl: { formatMessage } } = this.props;
    const { owners, templates, ownerId } = this.state;
    const filterOwners = this.getOwners();
    const label = formatMessage({ id: 'ui-users.feefines.singular' });

    let templateCharge = templates.filter(t => t.category === 'FeeFineCharge') || [];
    templateCharge = [{}, ...templateCharge.map((t) => ({ value: t.id, label: t.name }))];
    let templateAction = templates.filter(t => t.category === 'FeeFineAction') || [];
    templateAction = [{}, ...templateAction.map((t) => ({ value: t.id, label: t.name }))];

    const fieldComponents = {
      'chargeNoticeId': ({ fieldProps }) => (
        <Field
          {...fieldProps}
          marginBottom0
          component={Select}
          dataOptions={templateCharge}
        />
      ),
      'actionNoticeId': ({ fieldProps }) => (
        <Field
          {...fieldProps}
          marginBottom0
          component={Select}
          dataOptions={templateAction}
        />

      ),
    };

    const formatter = {
      'defaultAmount': (value) => (value.defaultAmount ? parseFloat(value.defaultAmount).toFixed(2) : <NoValue />),
      'chargeNoticeId': ({ chargeNoticeId }) => this.getNotice(chargeNoticeId, 'Charge'),
      'actionNoticeId': ({ actionNoticeId }) => this.getNotice(actionNoticeId, 'Action'),
    };

    const preCreateHook = (item) => {
      item.ownerId = ownerId;
      item.automatic = false;
      return item;
    };

    const preUpdateHook = (item) => {
      return _.pickBy(item, field => field !== '');
    };

    const owner = owners.find(o => o.id === ownerId) || {};

    const rowFilter =
      <div>
        <Owners filterShared={false} dataOptions={owners} onChange={this.onChangeOwner} />
        <ChargeNotice
          owner={owner}
          templates={templates}
          templateCharge={templateCharge}
          templateAction={templateAction}
          onSubmit={this.onUpdateOwner}
        />
        <CopyModal
          {...this.props}
          openModal={this.state.showCopyDialog}
          onCopyFeeFines={this.onCopyFeeFines}
          onCloseModal={this.hideCopyDialog}
          ownerList={filterOwners}
        />
      </div>;

    return (
      <this.connectedControlledVocab
        stripes={this.props.stripes}
        baseUrl="feefines"
        columnMapping={columnMapping}
        fieldComponents={fieldComponents}
        formatter={formatter}
        hiddenFields={['lastUpdated', 'numberOfObjects']}
        id="settings-feefines"
        label={formatMessage({ id: 'ui-users.feefines.title' })}
        labelSingular={label}
        nameKey="feefine"
        objectLabel=""
        preCreateHook={preCreateHook}
        preUpdateHook={preUpdateHook}
        records="feefines"
        rowFilter={rowFilter}
        rowFilterFunction={(item) => (item.ownerId === ownerId && !item.automatic)}
        sortby="feeFineType"
        validate={this.validate}
        visibleFields={['feeFineType', 'defaultAmount', 'chargeNoticeId', 'actionNoticeId']}
        formType="final-form"
        shouldReinitialize
      />
    );
  }
}

export default injectIntl(withStripes(stripesConnect(FeeFineSettings)));

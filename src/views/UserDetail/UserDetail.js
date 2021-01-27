import React from 'react';
import PropTypes from 'prop-types';
import {
  get,
  keyBy,
  cloneDeep,
  concat,
} from 'lodash';
import moment from 'moment';
import { FormattedMessage } from 'react-intl';

import {
  AppIcon,
  IfPermission,
  IfInterface,
  TitleManager,
} from '@folio/stripes/core';
import {
  Pane,
  PaneMenu,
  Icon,
  IconButton,
  expandAllFunction,
  ExpandAllButton,
  Button,
  Callout,
  Row,
  Col,
  Headline,
  AccordionSet,
  LoadingPane,
  HasCommand,
} from '@folio/stripes/components';
import {
  NotesSmartAccordion,
  ViewCustomFieldsRecord,
} from '@folio/stripes/smart-components';

import {
  UserInfo,
  ExtendedInfo,
  ContactInfo,
  ProxyPermissions,
  PatronBlock,
  UserPermissions,
  UserLoans,
  UserRequests,
  UserAccounts,
  UserServicePoints,
} from '../../components/UserDetailSections';

import HelperApp from '../../components/HelperApp';
import {
  PatronBlockMessage
} from '../../components/PatronBlock';
import {
  getFormAddressList,
} from '../../components/data/converters/address';
import {
  getFullName,
} from '../../components/util';
import RequestFeeFineBlockButtons from '../../components/RequestFeeFineBlockButtons';
import { departmentsShape } from '../../shapes';

import ExportFeesFinesReportButton from './components';

class UserDetail extends React.Component {
  static propTypes = {
    stripes: PropTypes.shape({
      hasPerm: PropTypes.func.isRequired,
      connect: PropTypes.func.isRequired,
      locale: PropTypes.string.isRequired,
      logger: PropTypes.shape({
        log: PropTypes.func.isRequired,
      }).isRequired,
    }).isRequired,
    resources: PropTypes.shape({
      selUser: PropTypes.object,
      user: PropTypes.arrayOf(PropTypes.object),
      addressTypes: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
      departments: PropTypes.shape({
        records: departmentsShape,
      }),
      permissions: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
      // query: PropTypes.object,
      patronGroups: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
      settings: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
      loansHistory: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
    }),
    match: PropTypes.shape({
      path: PropTypes.string.isRequired,
      params: PropTypes.shape({
        id: PropTypes.string,
      }),
    }).isRequired,
    okapi: PropTypes.shape({
      currentUser: PropTypes.shape({
        servicePoints: PropTypes.string.isRequired,
      }).isRequired,
    }).isRequired,
    onClose: PropTypes.func,
    tagsToggle: PropTypes.func,
    location: PropTypes.object,
    history: PropTypes.object,
    getSponsors: PropTypes.func,
    getProxies: PropTypes.func,
    getUserServicePoints: PropTypes.func,
    getPreferredServicePoint: PropTypes.func,
    tagsEnabled: PropTypes.bool,
    paneWidth: PropTypes.string,
  };

  static defaultProps = {
    paneWidth: '44%'
  };

  constructor(props) {
    super(props);

    this.editButton = React.createRef();

    this.keyboardCommands = [
      {
        name: 'edit',
        handler: this.goToEdit,
      },
      {
        name: 'collapseAllSections',
        handler: this.collapseAllSections,
      },
      {
        name: 'expandAllSections',
        handler: this.expandAllSections,
      },
    ];

    this.state = {
      lastUpdate: null,
      sections: {
        userInformationSection: true,
        extendedInfoSection: false,
        contactInfoSection: false,
        proxySection: false,
        patronBlocksSection: false,
        loansSection: false,
        requestsSection: false,
        accountsSection: false,
        permissionsSection: false,
        servicePointsSection: false,
        notesAccordion: false,
        customFields: false,
      },
    };

    this.callout = null;
  }

  getUser = () => {
    const { resources, match: { params: { id } } } = this.props;
    const selUser = (resources.selUser || {}).records || [];

    if (selUser.length === 0 || !id) return null;
    // Logging below shows this DOES sometimes find the wrong record. But why?
    // console.log(`getUser: found ${selUser.length} users, id '${selUser[0].id}' ${selUser[0].id === id ? '==' : '!='} '${id}'`);
    return selUser.find(u => u.id === id);
  }

  checkScope = () => {
    return document.getElementById('ModuleContainer').contains(document.activeElement);
  };

  // This is a helper function for the "last updated" date element. Since the
  // date/time is actually set on the server when the record is updated, the
  // lastUpdated element of the record on the client side might contain a stale
  // value. If so, this returns a locally stored update date until the data
  // is refreshed.
  dateLastUpdated(user) {
    const updatedDateRec = get(user, ['updatedDate'], '');
    const updatedDateLocal = this.state.lastUpdate;

    if (!updatedDateRec) { return ''; }

    let dateToShow;
    if (updatedDateLocal && updatedDateLocal > updatedDateRec) {
      dateToShow = updatedDateLocal;
    } else {
      dateToShow = updatedDateRec;
    }

    return new Date(dateToShow).toLocaleString(this.props.stripes.locale);
  }

  showHelperApp = (helperName) => {
    this.setState({
      helperApp: helperName
    });
  }

  closeHelperApp = () => {
    this.setState({
      helperApp: null
    });
  }

  handleExpandAll = (obj) => {
    this.setState((curState) => {
      const newState = cloneDeep(curState);
      newState.sections = obj;
      return newState;
    });
  }

  handleSectionToggle = ({ id }) => {
    this.setState((curState) => {
      const newState = cloneDeep(curState);
      newState.sections[id] = !newState.sections[id];
      return newState;
    });
  }

  toggleAllSections = (expand) => {
    this.setState((curState) => {
      const newSections = expandAllFunction(curState.sections, expand);
      return {
        sections: newSections
      };
    });
  }

  expandAllSections = (e) => {
    e.preventDefault();
    this.toggleAllSections(true);
  }

  collapseAllSections = (e) => {
    e.preventDefault();
    this.toggleAllSections(false);
  }

  // focus management when edit layer closes (refocus edit button)
  afterCloseEdit = () => {
    if (this.editButton.current) {
      this.editButton.current.focus();
    }
  };

  getEditLink = () => {
    const {
      match: { params },
      location: { search }
    } = this.props;

    return `/users/${params.id}/edit${search}`;
  }

  onClose = () => {
    const {
      history,
      location
    } = this.props;

    history.push(`/users${location.search}`);
  }

  getPatronGroup(user) {
    const { resources } = this.props;
    const patronGroups = (resources.patronGroups || {}).records || [];
    const patronGroupId = get(user, ['patronGroup'], '');
    return patronGroups.find(g => g.id === patronGroupId) || { group: '' };
  }

  renderDetailsLastMenu(user) {
    const {
      tagsEnabled,
    } = this.props;

    const tags = ((user && user.tags) || {}).tagList || [];

    return (
      <PaneMenu>
        {
          tagsEnabled &&
          <FormattedMessage id="ui-users.showTags">
            {ariaLabel => (
              <IconButton
                icon="tag"
                id="clickable-show-tags"
                onClick={() => { this.showHelperApp('tags'); }}
                badgeCount={tags.length}
                aria-label={ariaLabel}
              />
            )}
          </FormattedMessage>
        }
      </PaneMenu>
    );
  }

  getActionMenu = barcode => ({ onToggle }) => {
    const {
      okapi: {
        currentUser: {
          servicePoints,
        },
      },
      resources,
    } = this.props;
    const user = this.getUser();
    const patronGroup = this.getPatronGroup(user);
    const feeFineActions = get(resources, ['feefineactions', 'records'], []);
    const accounts = get(resources, ['accounts', 'records'], []);
    const loans = get(resources, ['loanRecords', 'records'], []);

    const feesFinesReportData = {
      user,
      patronGroup: patronGroup.group,
      servicePoints,
      feeFineActions,
      accounts,
      loans,
    };

    const showActionMenu = this.props.stripes.hasPerm('ui-users.edit')
      || this.props.stripes.hasPerm('ui-users.patron_blocks')
      || this.props.stripes.hasPerm('ui-users.feesfines.actions.all')
      || this.props.stripes.hasPerm('ui-requests.all');

    if (showActionMenu) {
      return (
        <>
          <RequestFeeFineBlockButtons
            barcode={barcode}
            onToggle={onToggle}
            userId={this.props.match.params.id}
          />
          <ExportFeesFinesReportButton
            feesFinesReportData={feesFinesReportData}
            onToggle={onToggle}
            callout={this.callout}
          />
          <IfPermission perm="ui-users.edit">
            <Button
              buttonStyle="dropdownItem"
              data-test-actions-menu-edit
              id="clickable-edituser"
              onClick={() => {
                onToggle();
                this.goToEdit();
              }}
              buttonRef={this.editButton}
            >
              <Icon icon="edit">
                <FormattedMessage id="ui-users.edit" />
              </Icon>
            </Button>
          </IfPermission>
        </>
      );
    } else {
      return null;
    }
  }

  checkScope = () => true;

  goToEdit = () => {
    const { history, match: { params } } = this.props;
    history.push(`/users/${params.id}/edit`);
  }

  shortcuts = [
    {
      name: 'edit',
      handler: this.goToEdit,
    },
    {
      name: 'expandAllSections',
      handler: this.expandAllSections,
    },
    {
      name: 'collapseAllSections',
      handler: this.collapseAllSections
    }
  ]

  getAddressesList(addresses, addressTypes) {
    const addressTypesById = keyBy(addressTypes, 'id');

    return addresses.map(address => {
      const addressTypeOption = addressTypesById[address.addressType];
      const addressType = get(addressTypeOption, ['addressType']);

      return { ...address, addressType };
    });
  }

  render() {
    const {
      resources,
      stripes,
      location,
      match,
      onClose,
      paneWidth,
    } = this.props;

    const {
      sections,
      helperApp,
      addRecord
    } = this.state;

    const user = this.getUser();

    const addressTypes = (resources.addressTypes || {}).records || [];
    const addresses = getFormAddressList(get(user, 'personal.addresses', []));
    const addressesList = this.getAddressesList(addresses, addressTypes);
    const permissions = (resources.permissions || {}).records || [];
    const settings = (resources.settings || {}).records || [];
    const sponsors = this.props.getSponsors();
    const proxies = this.props.getProxies();
    const servicePoints = this.props.getUserServicePoints();
    const preferredServicePoint = this.props.getPreferredServicePoint();
    const manualPatronBlocks = get(resources, ['hasManualPatronBlocks', 'records'], [])
      .filter(p => moment(moment(p.expirationDate).format()).isSameOrAfter(moment().format()));
    const automatedPatronBlocks = get(resources, ['hasAutomatedPatronBlocks', 'records'], []);
    const totalPatronBlocks = manualPatronBlocks.length + automatedPatronBlocks.length;
    const patronBlocks = concat(automatedPatronBlocks, manualPatronBlocks);
    const hasPatronBlocks = totalPatronBlocks > 0;
    const hasPatronBlocksPermissions = stripes.hasPerm('automated-patron-blocks.collection.get') || stripes.hasPerm('manualblocks.collection.get');
    const patronGroup = this.getPatronGroup(user);
    const requestPreferences = get(resources, 'requestPreferences.records.[0].requestPreferences[0]', {});
    const allServicePoints = get(resources, 'servicePoints.records', [{}]);
    const defaultServicePointName = get(
      allServicePoints.find(servicePoint => servicePoint.id === requestPreferences.defaultServicePointId),
      'name',
      '',
    );
    const defaultDeliveryAddressTypeName = get(
      addressTypes.find(addressType => addressType.id === requestPreferences.defaultDeliveryAddressTypeId),
      'addressType',
      '',
    );
    const customFields = user?.customFields || [];
    const departments = resources?.departments?.records || [];
    const userDepartments = (user?.departments || [])
      .map(departmentId => departments.find(({ id }) => id === departmentId)?.name);

    if (!user) {
      return (
        <LoadingPane
          id="pane-userdetails"
          defaultWidth={paneWidth}
          paneTitle={<FormattedMessage id="ui-users.information.userDetails" />}
          dismissible
          onClose={onClose}
        />
      );
    } else {
      return (
        <HasCommand
          commands={this.shortcuts}
          isWithinScope={this.checkScope}
          scope={document.body}
        >
          <>
            <Pane
              data-test-instance-details
              id="pane-userdetails"
              appIcon={<AppIcon app="users" appIconKey="users" />}
              defaultWidth={paneWidth}
              paneTitle={
                <span data-test-header-title>
                  {getFullName(user)}
                </span>
              }
              actionMenu={this.getActionMenu(get(user, 'barcode', ''))}
              lastMenu={this.renderDetailsLastMenu(user)}
              dismissible
              onClose={this.onClose}
            >
              <TitleManager record={getFullName(user)} />
              <Headline
                size="xx-large"
                tag="h2"
              >
                {getFullName(user)}
              </Headline>
              <Row>
                <Col xs={10}>
                  {hasPatronBlocks
                    ? <PatronBlockMessage />
                    : ''}
                </Col>
                <Col xs={2}>
                  <ExpandAllButton
                    accordionStatus={sections}
                    onToggle={this.handleExpandAll}
                  />
                </Col>
              </Row>
              <AccordionSet>
                <UserInfo
                  accordionId="userInformationSection"
                  user={user}
                  patronGroup={patronGroup}
                  settings={settings}
                  stripes={stripes}
                  expanded={sections.userInformationSection}
                  onToggle={this.handleSectionToggle}
                />
                <IfInterface name="feesfines">
                  {hasPatronBlocksPermissions &&
                  <PatronBlock
                    accordionId="patronBlocksSection"
                    user={user}
                    hasPatronBlocks={hasPatronBlocks}
                    patronBlocks={patronBlocks}
                    automatedPatronBlocks={automatedPatronBlocks}
                    expanded={sections.patronBlocksSection}
                    onToggle={this.handleSectionToggle}
                    onClickViewPatronBlock={this.onClickViewPatronBlock}
                    addRecord={this.state.addRecord}
                    {...this.props}
                  />
                  }
                </IfInterface>
                <ExtendedInfo
                  accordionId="extendedInfoSection"
                  user={user}
                  expanded={sections.extendedInfoSection}
                  requestPreferences={requestPreferences}
                  defaultServicePointName={defaultServicePointName}
                  defaultDeliveryAddressTypeName={defaultDeliveryAddressTypeName}
                  onToggle={this.handleSectionToggle}
                  departments={userDepartments}
                />
                <ContactInfo
                  accordionId="contactInfoSection"
                  stripes={stripes}
                  user={user}
                  addresses={addressesList}
                  addressTypes={addressTypes}
                  expanded={sections.contactInfoSection}
                  onToggle={this.handleSectionToggle}
                />
                <ViewCustomFieldsRecord
                  accordionId="customFields"
                  onToggle={this.handleSectionToggle}
                  expanded={sections.customFields}
                  backendModuleName="users"
                  entityType="user"
                  customFieldsValues={customFields}
                />
                <IfPermission perm="proxiesfor.collection.get">
                  <ProxyPermissions
                    user={user}
                    accordionId="proxySection"
                    onToggle={this.handleSectionToggle}
                    proxies={proxies}
                    sponsors={sponsors}
                    expanded={sections.proxySection}
                    {...this.props}
                  />
                </IfPermission>
                <IfInterface name="feesfines">
                  <IfPermission perm="ui-users.feesfines.actions.all">
                    <UserAccounts
                      expanded={sections.accountsSection}
                      onToggle={this.handleSectionToggle}
                      accordionId="accountsSection"
                      addRecord={addRecord}
                      location={location}
                      match={match}
                    />
                  </IfPermission>
                </IfInterface>

                <IfPermission perm="ui-users.loans.view">
                  <IfInterface name="loan-policy-storage">
                    { /* Check without version, so can support either of multiple versions.
              Replace with specific check when facility for providing
              multiple versions is available */ }
                    <IfInterface name="circulation">
                      <UserLoans
                        onClickViewLoanActionsHistory={this.onClickViewLoanActionsHistory}
                        onClickViewOpenLoans={this.onClickViewOpenLoans}
                        onClickViewClosedLoans={this.onClickViewClosedLoans}
                        expanded={sections.loansSection}
                        onToggle={this.handleSectionToggle}
                        accordionId="loansSection"
                        {...this.props}
                      />
                    </IfInterface>
                  </IfInterface>
                </IfPermission>

                <IfPermission perm="ui-users.requests.all">
                  <IfInterface name="request-storage" version="2.5 3.0">
                    <IfInterface name="circulation">
                      <UserRequests
                        expanded={sections.requestsSection}
                        onToggle={this.handleSectionToggle}
                        accordionId="requestsSection"
                        user={user}
                        {...this.props}
                      />
                    </IfInterface>
                  </IfInterface>
                </IfPermission>

                <IfPermission perm="perms.users.get">
                  <IfInterface name="permissions" version="5.0">
                    <UserPermissions
                      expanded={sections.permissionsSection}
                      onToggle={this.handleSectionToggle}
                      userPermissions={permissions}
                      accordionId="permissionsSection"
                      {...this.props}
                    />
                  </IfInterface>
                </IfPermission>

                <IfPermission perm="inventory-storage.service-points.collection.get,inventory-storage.service-points-users.collection.get">
                  <IfInterface name="service-points-users" version="1.0">
                    <UserServicePoints
                      expanded={sections.servicePointsSection}
                      onToggle={this.handleSectionToggle}
                      accordionId="servicePointsSection"
                      servicePoints={servicePoints}
                      preferredServicePoint={preferredServicePoint}
                      {...this.props}
                    />
                  </IfInterface>
                </IfPermission>
                <IfInterface name="notes">
                  <IfPermission perm="ui-notes.item.view">
                    <NotesSmartAccordion
                      domainName="users"
                      entityId={match.params.id}
                      entityName={getFullName(user)}
                      open={this.state.sections.notesAccordion}
                      onToggle={this.handleSectionToggle}
                      id="notesAccordion"
                      entityType="user"
                      pathToNoteCreate="/users/notes/new"
                      pathToNoteDetails="/users/notes"
                      hideAssignButton
                    />
                  </IfPermission>
                </IfInterface>
              </AccordionSet>
            </Pane>
            { helperApp && <HelperApp appName={helperApp} onClose={this.closeHelperApp} /> }
            <Callout ref={(ref) => { this.callout = ref; }} />
          </>
        </HasCommand>
      );
    }
  }
}

export default UserDetail;

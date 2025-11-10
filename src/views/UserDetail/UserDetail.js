import React from 'react';
import PropTypes from 'prop-types';
import {
  get,
  keyBy,
  cloneDeep,
  concat,
  orderBy,
} from 'lodash';
import { injectIntl, FormattedMessage } from 'react-intl';

import {
  AppIcon,
  CalloutContext,
  IfPermission,
  IfInterface,
  TitleManager,
} from '@folio/stripes/core';
import {
  Pane,
  PaneMenu,
  IconButton,
  expandAllFunction,
  ExpandAllButton,
  Callout,
  Row,
  Col,
  Headline,
  AccordionSet,
  LoadingPane,
  HasCommand,
  dayjs,
} from '@folio/stripes/components';
import {
  NotesSmartAccordion,
  NotePopupModal,
} from '@folio/stripes/smart-components';

import {
  UserInfo,
  ExtendedInfo,
  ContactInfo,
  ProxyPermissions,
  PatronBlock,
  UserPermissions,
  UserRoles,
  UserLoans,
  UserRequests,
  UserAccounts,
  UserAffiliations,
  UserServicePoints,
  ReadingRoomAccess,
  ViewCustomFieldsSection,
} from '../../components/UserDetailSections';
import HelperApp from '../../components/HelperApp';
import IfConsortium from '../../components/IfConsortium';
import { PatronBlockMessage } from '../../components/PatronBlock';
import { getFormAddressList } from '../../components/data/converters/address';
import {
  getFullName,
  getFormattedPronouns,
  isAffiliationsEnabled,
  isDcbUser,
  isPatronUser,
  isStaffUser,
  isShadowUser,
} from '../../components/util';
import RequestFeeFineBlockButtons from '../../components/RequestFeeFineBlockButtons';
import PrintLibraryCardButton from '../../components/PrintLibraryCardButton';
import { departmentsShape } from '../../shapes';
import ErrorPane from '../../components/ErrorPane';
import LostItemsLink from '../../components/LostItemsLink';
import IfConsortiumPermission from '../../components/IfConsortiumPermission';
import ActionMenuEditButton from './components/ActionMenuEditButton';
import ActionMenuDeleteButton from './components/ActionMenuDeleteButton';
import OpenTransactionModal from './components/OpenTransactionModal';
import DeleteUserModal from './components/DeleteUserModal';
import ExportFeesFinesReportButton from './components';
import { CUSTOM_FIELDS_SECTION } from '../../constants';

import css from './UserDetail.css';

export const ACCORDION_ID = {
  CUSTOM_FIELDS: 'customFields',
  USER_INFORMATION: 'userInformationSection',
  AFFILIATIONS: 'affiliationsSection',
  EXTENDED_INFO: 'extendedInfoSection',
  CONTACT_INFO: 'contactInfoSection',
  PROXY: 'proxySection',
  PATRON_BLOCKS: 'patronBlocksSection',
  LOANS: 'loansSection',
  REQUESTS: 'requestsSection',
  ACCOUNTS: 'accountsSection',
  PERMISSIONS: 'permissionsSection',
  ROLES: 'rolesSection',
  SERVICE_POINTS: 'servicePointsSection',
  NOTES: 'notesAccordion',
  READING_ROOM_ACCESS: 'readingRoomAccessSection',
};

class UserDetail extends React.Component {
  static propTypes = {
    stripes: PropTypes.shape({
      hasInterface: PropTypes.func.isRequired,
      hasPerm: PropTypes.func.isRequired,
      connect: PropTypes.func.isRequired,
      locale: PropTypes.string.isRequired,
      logger: PropTypes.shape({
        log: PropTypes.func.isRequired,
      }).isRequired,
    }).isRequired,
    mutator: PropTypes.shape({
      hasManualPatronBlocks: PropTypes.shape({
        GET: PropTypes.func,
      }),
      hasAutomatedPatronBlocks: PropTypes.shape({
        GET: PropTypes.func,
      }),
      delUser: PropTypes.shape({
        DELETE: PropTypes.func,
      }),
      openTransactions: PropTypes.shape({
        GET: PropTypes.func,
      }),
    }),
    resources: PropTypes.shape({
      selUser: PropTypes.object,
      delUser: PropTypes.object,
      openTransactions: PropTypes.object,
      user: PropTypes.arrayOf(PropTypes.object),
      accounts: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
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
      suppressEdit: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
      userReadingRoomPermissions: PropTypes.shape({
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
        servicePoints: PropTypes.arrayOf(PropTypes.object),
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
    intl: PropTypes.object.isRequired,
  };

  static defaultProps = {
    paneWidth: '44%'
  };

  static contextType = CalloutContext;

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
      patronBlocks: [],
      lastUpdate: null,
      showOpenTransactionModal: false,
      showDeleteUserModal: false,
      sections: {
        [ACCORDION_ID.USER_INFORMATION]: true,
        [ACCORDION_ID.AFFILIATIONS]: false,
        [ACCORDION_ID.EXTENDED_INFO]: false,
        [ACCORDION_ID.CONTACT_INFO]: false,
        [ACCORDION_ID.PROXY]: false,
        [ACCORDION_ID.PATRON_BLOCKS]: false,
        [ACCORDION_ID.LOANS]: false,
        [ACCORDION_ID.REQUESTS]: false,
        [ACCORDION_ID.ACCOUNTS]: false,
        [ACCORDION_ID.PERMISSIONS]: false,
        [ACCORDION_ID.ROLES]: false,
        [ACCORDION_ID.SERVICE_POINTS]: false,
        [ACCORDION_ID.NOTES]: false,
        [ACCORDION_ID.CUSTOM_FIELDS]: false,
        [ACCORDION_ID.READING_ROOM_ACCESS]: false,
      },
    };

    this.callout = null;
  }

  componentDidMount() {
    this._isMounted = true;
    this.loadPatronBlocks();
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  /**
   * showPermissionsAccordion
   * Return true unless the `roles` interface is present; then return false.
   * When `roles` is present, this indicates access management is handled
   * by keycloak; thus, roles, policies, and capabilites are used to manage
   * access, not the legacy permissions system.
   *
   * @returns boolean true unless the `roles` interface is present
   */
  showPermissionsAccordion = () => {
    return !this.props.stripes.hasInterface('roles');
  };

  getUser = () => {
    const { resources, match: { params: { id } } } = this.props;
    const selUser = (resources.selUser || {}).records || [];

    if (selUser.length === 0 || !id) return null;
    // Logging below shows this DOES sometimes find the wrong record. But why?
    // console.log(`getUser: found ${selUser.length} users, id '${selUser[0].id}' ${selUser[0].id === id ? '==' : '!='} '${id}'`);
    return selUser.find(u => u.id === id);
  }

  handleDeleteUser = (id) => {
    const { history, location, mutator, intl } = this.props;
    const user = this.getUser();
    const fullNameOfUser = getFullName(user);

    try {
      mutator.delUser.DELETE({ id })
        .then(() => history.replace(
          {
            pathname: '/users',
            search: `${location.search}`,
            state: { deletedUserId: id }
          }
        ))
        .then(() => {
          this.context.sendCallout({
            type: 'success',
            message: intl.formatMessage({ id: 'ui-users.details.deleteUser.success' }, { name: fullNameOfUser }),
          });
        });
    } catch (error) {
      this.context.sendCallout({
        type: 'error',
        message: intl.formatMessage({ id: 'ui-users.details.deleteUser.failed' }, { name: fullNameOfUser }),
      });
    }
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

  getLocationReferrer = () => {
    const { location } = this.props;

    return location.state?.referrer;
  }

  onClose = () => {
    const {
      history,
      location,
    } = this.props;

    history.push(this.getLocationReferrer() || `/users${location.search}`);
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
      intl,
    } = this.props;

    const tags = ((user && user.tags) || {}).tagList || [];

    return (
      <PaneMenu>
        {
          tagsEnabled &&
            <IconButton
              icon="tag"
              id="clickable-show-tags"
              onClick={() => { this.showHelperApp('tags'); }}
              badgeCount={tags.length}
              aria-label={intl.formatMessage({ id: 'ui-users.showTags' })}
            />
        }
      </PaneMenu>
    );
  }

  showOpenTransactionsModal(json) {
    this.setState({
      showOpenTransactionModal: true,
      openTransactions: json,
    });
  }

  showDeleteUserModal(json) {
    this.setState({
      showDeleteUserModal: true,
      openTransactions: json,
    });
  }

  doCloseTransactionDeleteModal = () => {
    this.setState({
      showDeleteUserModal: false,
      showOpenTransactionModal: false,
    });
  }

  selectModal(transactions) {
    if (!transactions?.hasOpenTransactions) {
      this.showDeleteUserModal();
    } else {
      this.showOpenTransactionsModal(transactions);
    }
  }

  handleDeleteClick = () => {
    const { mutator } = this.props;
    const userId = this.props.match.params.id;

    mutator.openTransactions.GET({ userId })
      .then((response) => {
        this.selectModal(response);
      });
  }

  getActionMenu = barcode => ({ onToggle }) => {
    const {
      okapi: {
        currentUser: {
          servicePoints,
        },
      },
      resources,
      stripes,
    } = this.props;
    const user = this.getUser();
    const patronGroup = this.getPatronGroup(user);
    const feeFineActions = get(resources, ['feefineactions', 'records'], []);
    const accounts = get(resources, ['accounts', 'records'], []);
    const loans = get(resources, ['loanRecords', 'records'], []);
    const settings = resources?.settings?.records;
    const isShadowUserType = isShadowUser(user);
    const isVirtualPatron = isDcbUser(user);
    const isProfilePictureFeatureEnabled = Boolean(settings?.length) && settings[0].enabled;

    const feesFinesReportData = {
      user,
      patronGroup: patronGroup.group,
      servicePoints,
      feeFineActions,
      accounts,
      loans,
    };

    const showActionMenu = stripes.hasPerm('ui-users.edit')
      || stripes.hasPerm('ui-users.patron-blocks.all')
      || stripes.hasPerm('ui-users.feesfines.actions.all')
      || stripes.hasPerm('ui-requests.all')
      || stripes.hasPerm('ui-users.delete,ui-users.open-transactions.view')
      || stripes.hasPerm('ui-users.profile-pictures.all');

    if (showActionMenu && !isVirtualPatron) {
      return (
        <>
          <ActionMenuEditButton
            id={this.props.match.params.id}
            suppressList={this.props.resources.suppressEdit}
            onToggle={onToggle}
            goToEdit={this.goToEdit}
            editButton={this.editButton}
          />
          {!isShadowUserType && <LostItemsLink />}
          <IfInterface name="feesfines">
            <ExportFeesFinesReportButton
              feesFinesReportData={feesFinesReportData}
              onToggle={onToggle}
              callout={this.callout}
            />
          </IfInterface>
          {!isShadowUserType && (
            <IfInterface name="feesfines">
              <RequestFeeFineBlockButtons
                barcode={barcode}
                onToggle={onToggle}
                userId={this.props.match.params.id}
                disabled={isShadowUserType}
              />
            </IfInterface>
          )}
          {
            isProfilePictureFeatureEnabled && (
              <PrintLibraryCardButton
                user={user}
                patronGroup={patronGroup?.group}
              />
            )
          }
          <ActionMenuDeleteButton
            handleDeleteClick={this.handleDeleteClick}
            id={this.props.match.params.id}
            onToggle={onToggle}
            suppressList={this.props.resources.suppressEdit}
          />
        </>
      );
    } else {
      return null;
    }
  }

  checkScope = () => true;

  goToEdit = () => {
    const { history, location: { search }, match: { params } } = this.props;
    history.push(`/users/${params.id}/edit${search}`);
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

  userNotFound = () => {
    return this.props.resources?.selUser?.failed?.httpStatus === 404;
  }

  loadPatronBlocks() {
    const {
      mutator: {
        hasManualPatronBlocks,
        hasAutomatedPatronBlocks,
      },
      stripes,
    } = this.props;

    const manualPatronBlocksResolver = stripes.hasInterface('feesfines')
      && stripes.hasPerm('manualblocks.collection.get')
      ? hasManualPatronBlocks
        .GET().catch(() => [])
      : Promise.resolve([]);
    const automatedPatronBlocksResolver = stripes.hasInterface('automated-patron-blocks')
      && stripes.hasPerm('patron-blocks.automated-patron-blocks.collection.get')
      ? hasAutomatedPatronBlocks
        .GET().catch(() => [])
      : Promise.resolve([]);

    Promise.all([
      manualPatronBlocksResolver,
      automatedPatronBlocksResolver,
    ]).then(([
      manualPatronBlocks,
      automatedPatronBlocks,
    ]) => {
      const { sections } = this.state;

      if (!this._isMounted) return;

      let patronBlocks = concat(manualPatronBlocks, automatedPatronBlocks)
        .filter((patronBlock) => {
          return dayjs(patronBlock.expirationDate).endOf('day').isSameOrAfter(dayjs().endOf('day'));
        });

      patronBlocks = orderBy(patronBlocks, ['metadata.createdDate'], ['desc']);

      this.setState({
        patronBlocks,
      });

      if (!sections[ACCORDION_ID.PATRON_BLOCKS] && patronBlocks.length) {
        this.handleSectionToggle({ id: ACCORDION_ID.PATRON_BLOCKS });
      }
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
      intl,
    } = this.props;

    const {
      sections,
      helperApp,
      patronBlocks,
    } = this.state;

    const user = this.getUser();
    const fullNameOfUser = getFullName(user);
    const pronouns = getFormattedPronouns(user);
    const userId = match.params.id;

    const addressTypes = (resources.addressTypes || {}).records || [];
    const addresses = getFormAddressList(get(user, 'personal.addresses', []));
    const addressesList = this.getAddressesList(addresses, addressTypes);
    const settings = (resources.settings || {}).records || [];
    const sponsors = this.props.getSponsors();
    const proxies = this.props.getProxies();
    const servicePoints = this.props.getUserServicePoints();
    const preferredServicePoint = this.props.getPreferredServicePoint();
    const hasPatronBlocks = !!patronBlocks.length;
    const hasPatronBlocksPermissions = stripes.hasPerm('patron-blocks.automated-patron-blocks.collection.get') || stripes.hasPerm('manualblocks.collection.get');
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
    const customFields = user?.customFields || {};
    const departments = resources?.departments?.records || [];
    const userDepartments = (user?.departments || [])
      .map(departmentId => departments.find(({ id }) => id === departmentId)?.name);
    const accounts = resources?.accounts;
    const isAffiliationsVisible = isAffiliationsEnabled(user);

    const isVirtualPatron = isDcbUser(user);
    const isShadowUserType = isShadowUser(user);
    const showPatronBlocksSection = hasPatronBlocksPermissions && !isShadowUserType;

    const displayReadingRoomAccessAccordion = isPatronUser(user) || isStaffUser(user);
    const readingRoomPermissions = resources?.userReadingRoomPermissions;

    if (this.userNotFound()) {
      return (
        <ErrorPane
          id="pane-user-not-found"
          defaultWidth={paneWidth}
          paneTitle={<FormattedMessage id="ui-users.information.userDetails" />}
          dismissible
          onClose={this.onClose}
        >
          <FormattedMessage id="ui-users.errors.userNotFound" />
        </ErrorPane>
      );
    }

    // Don't display loading if `resources.selUser.isPending` is true`, because creating a new tag in the 4th pane
    // will cause the `selUser` to load again. During loading, the 4th pane will not be shown, because it is rendered
    // in the 3rd pane, so it will not be visible to the user. Also, after creating a new tag, no success toast message
    // will be shown, and an E2E test will fail.
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
                margin="xx-small"
                className={css.nameContainer}
              >
                {getFullName(user)}
                {pronouns && <span className={css.pronouns}>{pronouns}</span>}
              </Headline>
              <Row className={css.patronBlockBannerRow}>
                <Col xs={10}>
                  {hasPatronBlocks
                    ? <PatronBlockMessage count={patronBlocks.length} />
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
                  accordionId={ACCORDION_ID.USER_INFORMATION}
                  user={user}
                  patronGroup={patronGroup}
                  settings={settings}
                  stripes={stripes}
                  expanded={sections[ACCORDION_ID.USER_INFORMATION]}
                  customFields={customFields}
                  onToggle={this.handleSectionToggle}
                />

                <IfConsortium>
                  <IfConsortiumPermission perm="consortia.user-tenants.collection.get">
                    {
                      isAffiliationsVisible && (
                        <UserAffiliations
                          accordionId={ACCORDION_ID.AFFILIATIONS}
                          expanded={sections[ACCORDION_ID.AFFILIATIONS]}
                          onToggle={this.handleSectionToggle}
                          userId={user?.id}
                          userName={user?.username}
                        />
                      )
                    }
                  </IfConsortiumPermission>
                </IfConsortium>

                <IfInterface name="feesfines">
                  {showPatronBlocksSection &&
                    <PatronBlock
                      accordionId={ACCORDION_ID.PATRON_BLOCKS}
                      patronBlocks={patronBlocks}
                      expanded={sections[ACCORDION_ID.PATRON_BLOCKS]}
                      onToggle={this.handleSectionToggle}
                      onClickViewPatronBlock={this.onClickViewPatronBlock}
                      {...this.props}
                    />
                  }
                </IfInterface>
                <ExtendedInfo
                  accordionId={ACCORDION_ID.EXTENDED_INFO}
                  user={user}
                  expanded={sections[ACCORDION_ID.EXTENDED_INFO]}
                  requestPreferences={requestPreferences}
                  defaultServicePointName={defaultServicePointName}
                  defaultDeliveryAddressTypeName={defaultDeliveryAddressTypeName}
                  onToggle={this.handleSectionToggle}
                  departments={departments}
                  userDepartments={userDepartments}
                  customFields={customFields}
                />
                <ContactInfo
                  accordionId={ACCORDION_ID.CONTACT_INFO}
                  stripes={stripes}
                  user={user}
                  addresses={addressesList}
                  addressTypes={addressTypes}
                  expanded={sections[ACCORDION_ID.CONTACT_INFO]}
                  customFields={customFields}
                  onToggle={this.handleSectionToggle}
                />
                <ViewCustomFieldsSection
                  accordionId={ACCORDION_ID.CUSTOM_FIELDS}
                  customFields={customFields}
                  expanded={sections[ACCORDION_ID.CUSTOM_FIELDS]}
                  sectionId={CUSTOM_FIELDS_SECTION.CUSTOM_FIELDS}
                  onToggle={this.handleSectionToggle}
                />
                {
                  displayReadingRoomAccessAccordion && (
                    <IfInterface name="reading-room-patron-permission">
                      <IfPermission perm="ui-users.reading-room-access.view">
                        <ReadingRoomAccess
                          accordionId={ACCORDION_ID.READING_ROOM_ACCESS}
                          onToggle={this.handleSectionToggle}
                          expanded={sections[ACCORDION_ID.READING_ROOM_ACCESS]}
                          readingRoomPermissions={readingRoomPermissions}
                        />
                      </IfPermission>
                    </IfInterface>
                  )
                }

                {
                  !isShadowUserType && (
                    <>
                      <IfPermission perm="proxiesfor.collection.get">
                        <ProxyPermissions
                          user={user}
                          accordionId={ACCORDION_ID.PROXY}
                          onToggle={this.handleSectionToggle}
                          proxies={proxies}
                          sponsors={sponsors}
                          expanded={sections[ACCORDION_ID.PROXY]}
                          {...this.props}
                        />
                      </IfPermission>
                      <UserAccounts
                        expanded={sections[ACCORDION_ID.ACCOUNTS]}
                        onToggle={this.handleSectionToggle}
                        accordionId={ACCORDION_ID.ACCOUNTS}
                        location={location}
                        accounts={accounts}
                        match={match}
                        customFields={customFields}
                        {...this.props}
                      />
                      <UserLoans
                        onClickViewLoanActionsHistory={this.onClickViewLoanActionsHistory}
                        onClickViewOpenLoans={this.onClickViewOpenLoans}
                        onClickViewClosedLoans={this.onClickViewClosedLoans}
                        expanded={sections[ACCORDION_ID.LOANS]}
                        onToggle={this.handleSectionToggle}
                        accordionId={ACCORDION_ID.LOANS}
                        customFields={customFields}
                        {...this.props}
                      />
                      <UserRequests
                        expanded={sections[ACCORDION_ID.REQUESTS]}
                        onToggle={this.handleSectionToggle}
                        accordionId={ACCORDION_ID.REQUESTS}
                        user={user}
                        customFields={customFields}
                        {...this.props}
                      />
                    </>
                  )
                }

                { this.showPermissionsAccordion() &&
                  <IfPermission perm="perms.users.get">
                    <IfInterface name="permissions" version="5.0">
                      <UserPermissions
                        expanded={sections[ACCORDION_ID.PERMISSIONS]}
                        onToggle={this.handleSectionToggle}
                        accordionId={ACCORDION_ID.PERMISSIONS}
                        user={user}
                        {...this.props}
                      />
                    </IfInterface>
                  </IfPermission>
                }

                { !this.showPermissionsAccordion() &&
                  <IfPermission perm="ui-users.roles.view">
                    <UserRoles
                      expanded={sections[ACCORDION_ID.ROLES]}
                      onToggle={this.handleSectionToggle}
                      accordionId={ACCORDION_ID.ROLES}
                      user={user}
                      {...this.props}
                    />
                  </IfPermission>
                }

                <IfPermission perm="inventory-storage.service-points.collection.get,inventory-storage.service-points-users.collection.get">
                  <IfInterface name="service-points-users" version="1.0">
                    <UserServicePoints
                      expanded={sections[ACCORDION_ID.SERVICE_POINTS]}
                      onToggle={this.handleSectionToggle}
                      accordionId={ACCORDION_ID.SERVICE_POINTS}
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
                      open={this.state.sections[ACCORDION_ID.NOTES]}
                      onToggle={this.handleSectionToggle}
                      id={ACCORDION_ID.NOTES}
                      entityType="user"
                      pathToNoteCreate="/users/notes/new"
                      pathToNoteDetails="/users/notes"
                      hideAssignButton
                      hideNewButton={isVirtualPatron}
                    />
                  </IfPermission>
                </IfInterface>
              </AccordionSet>
            </Pane>
            { helperApp && <HelperApp appName={helperApp} onClose={this.closeHelperApp} /> }
            <Callout ref={(ref) => { this.callout = ref; }} />
            <IfInterface name="notes">
              <IfPermission perm="ui-notes.item.view">
                <NotePopupModal
                  id="user-popup-note-modal"
                  domainName="users"
                  entityType="user"
                  popUpPropertyName="popUpOnUser"
                  entityId={user?.id}
                  label={intl.formatMessage({ id: 'ui-users.notes.popupModal.label' })}
                />
              </IfPermission>
            </IfInterface>
            {this.state.showDeleteUserModal &&
            <DeleteUserModal
              onCloseModal={this.doCloseTransactionDeleteModal}
              username={fullNameOfUser}
              userId={userId}
              deleteUser={this.handleDeleteUser}
            />
            }
            {this.state.showOpenTransactionModal &&
            <OpenTransactionModal
              onCloseModal={this.doCloseTransactionDeleteModal}
              openTransactions={this.state.openTransactions}
              username={fullNameOfUser}
            />
            }
          </>
        </HasCommand>
      );
    }
  }
}

export default injectIntl(UserDetail);

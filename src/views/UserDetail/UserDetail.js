import React from 'react';
import PropTypes from 'prop-types';
import get from 'lodash/get';
import cloneDeep from 'lodash/cloneDeep';
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
  IconButton,
  expandAllFunction,
  ExpandAllButton,
  Button,
  Icon,
  Row,
  Col,
  Headline,
  AccordionSet,
  HasCommand,
} from '@folio/stripes/components';

import {
  NotesSmartAccordion
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
  toListAddresses,
  // toUserAddresses
} from '../../components/data/converters/address';
import {
  getFullName,
  // eachPromise
} from '../../components/util';
import { PaneLoading } from '../../components/Loading';

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
    onClose: PropTypes.func,
    tagsToggle: PropTypes.func,
    location: PropTypes.object,
    history: PropTypes.object,
    getSponsors: PropTypes.func,
    getProxies: PropTypes.func,
    getServicePoints: PropTypes.func,
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
      },
    };
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
    return `/users/${this.props.match.params.id}/edit/`;
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

  renderDetailMenu(user) {
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
                ariaLabel={ariaLabel}
              />
            )}
          </FormattedMessage>
        }
        <IfPermission perm="users.item.put">
          <FormattedMessage id="ui-users.crud.editUser">
            {ariaLabel => (
              <IconButton
                icon="edit"
                id="clickable-edituser"
                style={{ visibility: !user ? 'hidden' : 'visible' }}
                href={this.getEditLink()}
                ref={this.editButton}
                ariaLabel={ariaLabel}
              />
            )}
          </FormattedMessage>
        </IfPermission>
      </PaneMenu>
    );
  }

  getActionMenu = ({ onToggle }) => {
    return (
      <Button
        data-test-user-instance-edit-action
        buttonStyle="dropdownItem"
        onClick={onToggle}
        to={this.getEditLink()}
      >
        <Icon icon="edit">
          <FormattedMessage id="ui-users.edit" />
        </Icon>
      </Button>
    );
  };

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
    const addresses = toListAddresses(get(user, ['personal', 'addresses'], []), addressTypes);
    const permissions = (resources.permissions || {}).records || [];
    const settings = (resources.settings || {}).records || [];
    const sponsors = this.props.getSponsors();
    const proxies = this.props.getProxies();
    const servicePoints = this.props.getServicePoints();
    const preferredServicePoint = this.props.getPreferredServicePoint();
    const hasPatronBlocks = (get(resources, ['hasPatronBlocks', 'isPending'], true)) ? -1 : 1;
    const totalPatronBlocks = get(resources, ['hasPatronBlocks', 'other', 'totalRecords'], 0);
    const patronBlocks = get(resources, ['hasPatronBlocks', 'records'], []);
    const patronGroup = this.getPatronGroup(user);
    // const detailMenu = this.renderDetailMenu(user);

    if (!user) {
      return (
        <PaneLoading
          id="pane-userdetails"
          defaultWidth={paneWidth}
          paneTitle={<FormattedMessage id="ui-users.information.userDetails" />}
          dismissible
          onClose={onClose}
        />
      );
    } else {
      return (
        <React.Fragment>
          <HasCommand
            commands={this.shortcuts}
            isWithinScope={this.checkScope}
            scope={document.body}
          >
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
              lastMenu={this.renderDetailMenu(user)}
              dismissible
              onClose={this.onClose}
              actionMenu={this.getActionMenu}
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
                  {(hasPatronBlocks === 1 && totalPatronBlocks > 0)
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
                <IfPermission perm="manualblocks.collection.get">
                  <PatronBlock
                    accordionId="patronBlocksSection"
                    user={user}
                    hasPatronBlocks={(hasPatronBlocks === 1 && totalPatronBlocks > 0)}
                    patronBlocks={patronBlocks}
                    expanded={sections.patronBlocksSection}
                    onToggle={this.handleSectionToggle}
                    onClickViewPatronBlock={this.onClickViewPatronBlock}
                    addRecord={this.state.addRecord}
                    {...this.props}
                  />
                </IfPermission>
                <ExtendedInfo
                  accordionId="extendedInfoSection"
                  user={user}
                  expanded={sections.extendedInfoSection}
                  onToggle={this.handleSectionToggle}
                />
                <ContactInfo
                  accordionId="contactInfoSection"
                  stripes={stripes}
                  user={user}
                  addresses={addresses}
                  addressTypes={addressTypes}
                  expanded={sections.contactInfoSection}
                  onToggle={this.handleSectionToggle}
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
                <IfPermission perm="ui-users.accounts">
                  <UserAccounts
                    expanded={sections.accountsSection}
                    onToggle={this.handleSectionToggle}
                    accordionId="accountsSection"
                    addRecord={addRecord}
                    location={location}
                    match={match}
                  />
                </IfPermission>

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
                    <UserRequests
                      expanded={sections.requestsSection}
                      onToggle={this.handleSectionToggle}
                      accordionId="requestsSection"
                      user={user}
                      {...this.props}
                    />
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
              </AccordionSet>
            </Pane>
          </HasCommand>
          { helperApp && <HelperApp appName={helperApp} onClose={this.closeHelperApp} /> }
        </React.Fragment>
      );
    }
  }
}

export default UserDetail;

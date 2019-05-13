import React from 'react';
import PropTypes from 'prop-types';
import get from 'lodash/get';
import cloneDeep from 'lodash/cloneDeep';
import { FormattedMessage } from 'react-intl';
import {
  AppIcon,
  IfPermission,
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
} from '../ViewSections';

import {
  PatronBlockMessage
} from '../PatronBlock';
import { toListAddresses, toUserAddresses } from '../../converters/address';
import { getFullName, eachPromise } from '../../util';


class UserView extends React.Component {
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
      query: PropTypes.object,
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
    mutator: PropTypes.shape({
      selUser: PropTypes.shape({
        PUT: PropTypes.func.isRequired,
      }),
      permissions: PropTypes.shape({
        POST: PropTypes.func.isRequired,
        DELETE: PropTypes.func.isRequired,
      }),
      query: PropTypes.object.isRequired,
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
    parentResources: PropTypes.shape({
      addressTypes: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
    }),
    parentMutator: PropTypes.shape({}),
    updateProxies: PropTypes.func,
    updateServicePoints: PropTypes.func,
    updateSponsors: PropTypes.func,
    getSponsors: PropTypes.func,
    getProxies: PropTypes.func,
    getServicePoints: PropTypes.func,
    getPreferredServicePoint: PropTypes.func,
    tagsEnabled: PropTypes.bool,
    okapi: PropTypes.object,
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
      },
    };

    this.connectedUserInfo = props.stripes.connect(UserInfo);
    this.connectedUserLoans = props.stripes.connect(UserLoans);
    this.connectedUserRequests = props.stripes.connect(UserRequests);
    this.connectedUserAccounts = props.stripes.connect(UserAccounts);
    this.connectedPatronBlock = props.stripes.connect(PatronBlock);
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

  expandAllSections(e) {
    e.preventDefault();
    this.toggleAllSections(true);
  }

  collapseAllSections(e) {
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
      tagsToggle,
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
                onClick={tagsToggle}
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

  renderSpinner() {
    const { onClose } = this.props;
    const detailMenu = this.renderDetailMenu();

    return (
      <Pane
        id="pane-userdetails"
        defaultWidth="44%"
        paneTitle={<FormattedMessage id="ui-users.information.userDetails" />}
        lastMenu={detailMenu}
        dismissible
        onClose={onClose}
      >
        <div style={{ paddingTop: '1rem' }}>
          <Icon icon="spinner-ellipsis" width="100px" />
        </div>
      </Pane>
    );
  }

  render() {
    const {
      resources,
      stripes,
      parentResources,
      onClose,
      paneWidth,
    } = this.props;

    const user = this.getUser();

    const addressTypes = (resources.addressTypes || {}).records || [];
    const addresses = toListAddresses(get(this.user, ['personal', 'addresses'], []), addressTypes);
    const permissions = (resources.permissions || {}).records || [];
    const settings = (resources.settings || {}).records || [];
    const sponsors = this.props.getSponsors();
    const proxies = this.props.getProxies();
    const servicePoints = this.props.getServicePoints();
    const preferredServicePoint = this.props.getPreferredServicePoint();
    const hasPatronBlocks = (get(resources, ['hasPatronBlocks', 'isPending'], true)) ? -1 : 1;
    const totalPatronBlocks = get(resources, ['hasPatronBlocks', 'other', 'totalRecords'], 0);
    const patronBlocks = get(resources, ['hasPatronBlocks', 'records'], []);
    const patronGroup = this.getPatronGroup(this.user);
    const detailMenu = this.renderDetailMenu(this.user);

    if (!user) {
      return this.renderSpinner();
    } else {
      return (
        <Pane
          data-test-instance-details
          id="pane-userdetails"
          appIcon={<AppIcon app="users" appIconKey="users" />}
          defaultWidth="44%"
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
                accordionStatus={this.state.sections}
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
              expanded={this.state.sections.userInformationSection}
              onToggle={this.handleSectionToggle}
            />
          </AccordionSet>
        </Pane>
      );
    }
  }
}

export default UserView;

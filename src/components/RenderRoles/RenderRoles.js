import _ from 'lodash';
import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import PropTypes from 'prop-types';
import {
  List,
  Accordion,
  Badge,
  Headline,
  Loading,
} from '@folio/stripes/components';

import AffiliationsSelect from '../AffiliationsSelect/AffiliationsSelect';
import IfConsortium from '../IfConsortium';
import IfConsortiumPermission from '../IfConsortiumPermission';
import RoleNameLink from '../RoleNameLink';
import { affiliationsShape } from '../../shapes';

class RenderRoles extends React.Component {
  static propTypes = {
    accordionId: PropTypes.string,
    affiliations: affiliationsShape,
    expanded: PropTypes.bool,
    heading: PropTypes.node.isRequired,
    intl: PropTypes.shape({
      formatMessage: PropTypes.func.isRequired,
    }),
    isLoading: PropTypes.bool,
    listedRoles: PropTypes.arrayOf(PropTypes.object),
    onChangeAffiliation: PropTypes.func,
    onToggle: PropTypes.func,
    permToRead: PropTypes.string.isRequired,
    selectedAffiliation: PropTypes.string,
    stripes: PropTypes.shape({
      hasPerm: PropTypes.func.isRequired,
      config: PropTypes.shape({
        showPerms: PropTypes.bool,
        listInvisiblePerms: PropTypes.bool,
      }).isRequired,
    }).isRequired,
    isAffiliationsVisible: PropTypes.bool.isRequired,
  };

  static defaultProps = {
    onChangeAffiliation: _.noop,
    isLoading: false,
  }

  renderList() {
    const {
      listedRoles,
      stripes,
      affiliations,
      selectedAffiliation,
    } = this.props;

    // don't display the link to the role if the logged in tenant does not match
    // the selected affiliation. Due to the coupling of tenant and login session,
    // the link may lead to a 404 if it tries to access a role that's outside of the current
    // logged in tenant.
    const viewingLoginAffiliation = affiliations?.length && selectedAffiliation
      ? (stripes.okapi.tenant === selectedAffiliation) : true;

    const listFormatter = item => <li key={item.id}>
      <RoleNameLink role={item} canRenderLink={viewingLoginAffiliation} />
    </li>;
    const noPermissionsFound = <FormattedMessage id="ui-users.roles.empty" />;

    return (
      <List
        items={(listedRoles || []).sort((a, b) => a.name.localeCompare(b.name))}
        itemFormatter={listFormatter}
        isEmptyMessage={noPermissionsFound}
      />
    );
  }

  render() {
    const {
      affiliations,
      accordionId,
      expanded,
      isLoading,
      onChangeAffiliation,
      onToggle,
      listedRoles,
      stripes,
      permToRead,
      selectedAffiliation,
      heading,
      isAffiliationsVisible,
    } = this.props;

    if (!stripes.hasPerm(permToRead)) { return null; }

    return (
      <Accordion
        open={expanded}
        id={accordionId}
        onToggle={onToggle}
        label={<Headline size="large" tag="h3">{heading}</Headline>}
        displayWhenClosed={
          isLoading ? <Loading /> : <Badge>{listedRoles.length}</Badge>
        }
      >
        <IfConsortium>
          <IfConsortiumPermission perm="consortia.user-tenants.collection.get">
            {Boolean(affiliations?.length) && isAffiliationsVisible && (
              <AffiliationsSelect
                affiliations={affiliations}
                onChange={onChangeAffiliation}
                isLoading={isLoading}
                value={selectedAffiliation}
              />
            )}
          </IfConsortiumPermission>
        </IfConsortium>

        {this.renderList()}
      </Accordion>
    );
  }
}

export default injectIntl(RenderRoles);

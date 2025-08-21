import _ from 'lodash';
import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import PropTypes from 'prop-types';
import {
  List,
  Accordion,
  Badge,
  Headline,
  Loading
} from '@folio/stripes/components';

import AffiliationsSelect from '../AffiliationsSelect/AffiliationsSelect';
import IfConsortium from '../IfConsortium';
import IfConsortiumPermission from '../IfConsortiumPermission';
import PermissionLabel from '../PermissionLabel';
import { getPermissionLabelString } from '../data/converters/permission';
import { affiliationsShape } from '../../shapes';

class RenderPermissions extends React.Component {
  static propTypes = {
    accordionId: PropTypes.string,
    affiliations: affiliationsShape,
    expanded: PropTypes.bool,
    heading: PropTypes.node.isRequired,
    intl: PropTypes.shape({
      formatMessage: PropTypes.func.isRequired,
    }),
    isLoading: PropTypes.bool,
    listedPermissions: PropTypes.arrayOf(PropTypes.shape({})),
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
  };

  static defaultProps = {
    onChangeAffiliation: _.noop,
    isLoading: false,
  }

  renderList() {
    const {
      intl: { formatMessage },
      listedPermissions,
      stripes,
    } = this.props;
    const showPerms = _.get(stripes, ['config', 'showPerms']);
    const listFormatter = item => ((
      <li key={item.permissionName}>
        <PermissionLabel permission={item} showRaw={showPerms} />
      </li>
    ));
    const noPermissionsFound = <FormattedMessage id="ui-users.permissions.empty" />;

    return (
      <List
        items={(listedPermissions || []).sort((a, b) => {
          const permA = getPermissionLabelString(a, formatMessage, showPerms);
          const permB = getPermissionLabelString(b, formatMessage, showPerms);

          return permA.localeCompare(permB);
        })}
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
      listedPermissions,
      stripes,
      permToRead,
      selectedAffiliation,
      heading,
    } = this.props;

    if (!stripes.hasPerm(permToRead)) { return null; }

    return (
      <Accordion
        open={expanded}
        id={accordionId}
        onToggle={onToggle}
        label={<Headline size="large" tag="h3">{heading}</Headline>}
        displayWhenClosed={
          isLoading ? <Loading /> : <Badge>{listedPermissions.length}</Badge>
        }
      >
        <IfConsortium>
          <IfConsortiumPermission perm="consortia.user-tenants.collection.get">
            {Boolean(affiliations?.length) && (
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

export default injectIntl(RenderPermissions);

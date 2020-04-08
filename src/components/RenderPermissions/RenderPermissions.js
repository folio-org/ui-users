import _ from 'lodash';
import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import PropTypes from 'prop-types';
import {
  List,
  Accordion,
  Badge,
  Headline
} from '@folio/stripes/components';

import PermissionLabel from '../PermissionLabel';
import { getPermissionLabelString } from '../data/converters/permission';

class RenderPermissions extends React.Component {
  static propTypes = {
    accordionId: PropTypes.string,
    expanded: PropTypes.bool,
    heading: PropTypes.node.isRequired,
    intl: PropTypes.shape({
      formatMessage: PropTypes.func.isRequired,
    }),
    listedPermissions: PropTypes.arrayOf(PropTypes.object),
    onToggle: PropTypes.func,
    permToRead: PropTypes.string.isRequired,
    stripes: PropTypes.shape({
      hasPerm: PropTypes.func.isRequired,
      config: PropTypes.shape({
        showPerms: PropTypes.bool,
        listInvisiblePerms: PropTypes.bool,
      }).isRequired,
    }).isRequired,
  };

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
      accordionId,
      expanded,
      onToggle,
      listedPermissions,
      stripes,
      permToRead,
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
          <Badge>{listedPermissions.length}</Badge>
        }
      >
        {this.renderList()}
      </Accordion>
    );
  }
}

export default injectIntl(RenderPermissions);

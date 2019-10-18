import _ from 'lodash';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';
import {
  List,
  Accordion,
  Badge,
  Headline
} from '@folio/stripes/components';

class RenderPermissions extends React.Component {
  static propTypes = {
    heading: PropTypes.node.isRequired,
    permToRead: PropTypes.string.isRequired,
    listedPermissions: PropTypes.arrayOf(PropTypes.object),
    stripes: PropTypes.shape({
      hasPerm: PropTypes.func.isRequired,
      config: PropTypes.shape({
        showPerms: PropTypes.bool,
        listInvisiblePerms: PropTypes.bool,
      }).isRequired,
    }).isRequired,
    accordionId: PropTypes.string,
    expanded: PropTypes.bool,
    onToggle: PropTypes.func,
  };

  renderList() {
    const {
      stripes,
      listedPermissions,
    } = this.props;
    const showPerms = _.get(stripes, ['config', 'showPerms']);
    const listFormatter = item => ((
      <li key={item.permissionName}>
        {
          (showPerms ?
            `${item.permissionName} (${item.displayName})` :
            (item.displayName || item.permissionName))
        }
      </li>
    ));
    const noPermissionsFound = <FormattedMessage id="ui-users.permissions.empty" />;

    return (
      <List
        items={(listedPermissions || []).sort((a, b) => {
          const key = showPerms ? 'permissionName' : 'displayName';
          if (Object.prototype.hasOwnProperty.call(a, key) &&
            Object.prototype.hasOwnProperty.call(b, key)) {
            return (a[key].toLowerCase() < b[key].toLowerCase() ? -1 : 1);
          }
          return 1;
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

export default RenderPermissions;

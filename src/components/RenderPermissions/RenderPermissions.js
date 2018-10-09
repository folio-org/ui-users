import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import {
  List,
  Accordion,
  Badge,
} from '@folio/stripes/components';

class RenderPermissions extends React.Component {
  static propTypes = {
    heading: PropTypes.string.isRequired,
    permToRead: PropTypes.string.isRequired,
    listedPermissions: PropTypes.arrayOf(PropTypes.object),
    stripes: PropTypes.shape({
      hasPerm: PropTypes.func.isRequired,
      config: PropTypes.shape({
        showPerms: PropTypes.bool,
        listInvisiblePerms: PropTypes.bool,
      }).isRequired,
      intl: PropTypes.object.isRequired,
    }).isRequired,
    accordionId: PropTypes.string,
    expanded: PropTypes.bool,
    onToggle: PropTypes.func,
  };

  renderList() {
    const showPerms = _.get(this.props.stripes, ['config', 'showPerms']);
    const listFormatter = item => ((
      <li key={item.permissionName}>
        {
          (showPerms ?
            `${item.permissionName} (${item.displayName})` :
            (item.displayName || item.permissionName))
        }
      </li>
    ));

    const noPermissionsFound = this.props.stripes.intl.formatMessage({ id: 'ui-users.permissions.empty' });

    return (
      <List
        items={(this.props.listedPermissions || []).sort((a, b) => {
          const key = showPerms ? 'permissionName' : 'displayName';
          return (a[key].toLowerCase() < b[key].toLowerCase() ? -1 : 1);
        })}
        itemFormatter={listFormatter}
        isEmptyMessage={noPermissionsFound}
      />
    );
  }

  render() {
    const { accordionId, expanded, onToggle, listedPermissions } = this.props;

    if (!this.props.stripes.hasPerm(this.props.permToRead)) { return null; }

    return (
      <Accordion
        open={expanded}
        id={accordionId}
        onToggle={onToggle}
        label={this.props.heading}
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

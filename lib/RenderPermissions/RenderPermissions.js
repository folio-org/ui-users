import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import List from '@folio/stripes-components/lib/List';
import { Accordion } from '@folio/stripes-components/lib/Accordion';
import Badge from '@folio/stripes-components/lib/Badge';

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

    return (
      <List
        items={(this.props.listedPermissions || []).sort((a, b) => {
          const key = showPerms ? 'permissionName' : 'displayName';
          return (a[key].toLowerCase() < b[key].toLowerCase() ? -1 : 1);
        })}
        itemFormatter={listFormatter}
        isEmptyMessage="No permissions found"
      />
    );
  }

  render() {
    const { accordionId, expanded, onToggle, listedPermissions } = this.props;

    if (!this.props.stripes.hasPerm(this.props.permToRead))
      return null;

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

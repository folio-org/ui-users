import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import List from '@folio/stripes-components/lib/List';
import { Accordion } from '@folio/stripes-components/lib/Accordion';

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
        isEmptyMessage="This user has no permissions applied."
      />
    );
  }

  render() {
    const { accordionId, expanded, onToggle } = this.props;

    if (!this.props.stripes.hasPerm(this.props.permToRead))
      return null;

    return (
      <Accordion
        open={expanded}
        id={accordionId}
        onToggle={onToggle}
        label={
          <h2 className="marginTop0">{this.props.heading}</h2>
        }
      >
        {this.renderList()}
      </Accordion>
    );
  }
}

export default RenderPermissions;

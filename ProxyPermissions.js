import React from 'react';
import PropTypes from 'prop-types';
import { Accordion } from '@folio/stripes-components/lib/Accordion';
import Badge from '@folio/stripes-components/lib/Badge';

import Sponsors from './lib/Sponsors';
import ProxyList from './lib/ProxyGroup/ProxyList';

export default class ProxyPermissions extends React.Component {
  static propTypes = {
    expanded: PropTypes.bool,
    onToggle: PropTypes.func,
    accordionId: PropTypes.string.isRequired,
    proxies: PropTypes.arrayOf(PropTypes.object),
    sponsors: PropTypes.arrayOf(PropTypes.object),
  };

  render() {
    const { onToggle, accordionId, expanded, editable, proxies, sponsors } = this.props;

    return (
      <Accordion
        open={expanded}
        id={accordionId}
        onToggle={onToggle}
        displayWhenClosed={
          <Badge>{proxies.length + sponsors.length}</Badge>
        }
        label={
          <h2>Proxy</h2>
        }
      >
        <Sponsors
          //onAdd={() => this.props.onAdd()}
          sponsors={sponsors}
          parentMutator={this.props.mutator}
          {...this.props}
        />
        <hr />
        <ProxyList
          //onAdd={proxy => this.addProxy(proxy)}
          proxies={proxies}
          parentMutator={this.props.mutator}
          {...this.props}
        />
      </Accordion>
    );
  }
}

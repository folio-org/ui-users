import React from 'react';
import PropTypes from 'prop-types';
import { Accordion } from '@folio/stripes-components/lib/Accordion';
import Badge from '@folio/stripes-components/lib/Badge';

import Sponsors from './lib/Sponsors';

import ProxyList from './lib/ProxyGroup/ProxyList';
import ProxyEditList from './lib/ProxyGroup/ProxyEditList';

export default class ProxyPermissions extends React.Component {
  static propTypes = {
    user: PropTypes.object,
    resources: PropTypes.shape({
      sponsors: PropTypes.object,
      proxies: PropTypes.object,
    }).isRequired,

    mutator: PropTypes.shape({
      proxiesFor: PropTypes.shape({
        POST: PropTypes.func.isRequired,
        GET: PropTypes.func.isRequired,
        reset: PropTypes.func,
      }),
      sponsorsFor: PropTypes.shape({
        GET: PropTypes.func.isRequired,
        reset: PropTypes.func,
      }),
      proxies: PropTypes.shape({
        GET: PropTypes.func.isRequired,
        reset: PropTypes.func,
      }),
      sponsors: PropTypes.shape({
        GET: PropTypes.func.isRequired,
        reset: PropTypes.func,
      }),
    }).isRequired,
    expanded: PropTypes.bool,
    onToggle: PropTypes.func,
    accordionId: PropTypes.string.isRequired,
    // if `editable` is true, component will be in 'edit' mode. (read-only by default)
    editable: PropTypes.bool,
  };

  static manifest = Object.freeze({
    sponsors: {
      type: 'okapi',
      records: 'users',
      path: 'users',
      accumulate: 'true',
      fetch: false,
    },
    proxies: {
      type: 'okapi',
      records: 'users',
      path: 'users',
      accumulate: 'true',
      fetch: false,
    },
    proxiesFor: {
      type: 'okapi',
      records: 'proxiesFor',
      path: 'proxiesfor',
      accumulate: 'true',
      fetch: false,
    },
    sponsorsFor: {
      type: 'okapi',
      records: 'proxiesFor',
      path: 'proxiesfor',
      accumulate: 'true',
      fetch: false,
    },
  });

  componentDidMount() {
    this.loadResource('sponsors', 'proxyUserId', 'userId');
    this.loadResource('proxies', 'userId', 'proxyUserId');
  }

  loadResource(resourceName, queryId, recordId) {
    const { mutator, user } = this.props;
    const resource = mutator[resourceName];
    const resourceFor = mutator[`${resourceName}For`];
    const query = `query=(${queryId}=${user.id})`;

    resourceFor.reset();
    resourceFor.GET({ params: { query } }).then(records => {
      if (!records.length) return;
      const ids = records.map(pf => `id=${pf[recordId]}`).join(' or ');
      resource.reset();
      resource.GET({ params: { query: `query=(${ids})` } });
    });
  }

  render() {
    const resources = this.props.resources;
    const sponsors = (resources.sponsors || {}).records || [];
    const proxies = (resources.proxies || {}).records || [];
    const { onToggle, accordionId, expanded, editable } = this.props;

    const Proxies = (editable) ? ProxyEditList : ProxyList;

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
          onAdd={() => this.getSponsors()}
          sponsors={sponsors}
          parentMutator={this.props.mutator}
          {...this.props}
        />
        <hr />
        <Proxies
          onAdd={() => this.getProxies()}
          proxies={proxies}
          parentMutator={this.props.mutator}
          {...this.props}
        />
      </Accordion>
    );
  }
}

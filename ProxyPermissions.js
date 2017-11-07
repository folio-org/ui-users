import React from 'react';
import PropTypes from 'prop-types';
import { Accordion } from '@folio/stripes-components/lib/Accordion';
import Badge from '@folio/stripes-components/lib/Badge';

import Sponsors from './lib/Sponsors';
import Proxies from './lib/Proxies';

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
    this.getProxies();
    this.getSponsors();
  }

  getProxies() {
    const { mutator, user } = this.props;
    const query = `query=(userId=${user.id})`;

    mutator.proxies.reset();
    mutator.proxiesFor.reset();
    mutator.proxiesFor.GET({ params: { query } })
    .then((records) => {
      if (!records.length) return;
      const ids = records.map(pf => `id=${pf.proxyUserId}`).join(' or ');
      mutator.proxies.GET({ params: { query: `query=(${ids})` } });
    });
  }

  getSponsors() {
    const { mutator, user } = this.props;
    const query = `query=(proxyUserId=${user.id})`;

    mutator.sponsors.reset();
    mutator.sponsorsFor.reset();
    mutator.sponsorsFor.GET({ params: { query } })
    .then((records) => {
      if (!records.length) return;
      const ids = records.map(pf => `id=${pf.userId}`).join(' or ');
      mutator.sponsors.GET({ params: { query: `query=(${ids})` } });
    });
  }

  render() {
    const resources = this.props.resources;
    const sponsors = (resources.sponsors || {}).records || [];
    const proxies = (resources.proxies || {}).records || [];
    const { onToggle, accordionId, expanded, editable } = this.props;

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
          editable={editable}
          {...this.props}
        />
        <hr />
        <Proxies
          onAdd={() => this.getProxies()}
          proxies={proxies}
          parentMutator={this.props.mutator}
          editable={editable}
          {...this.props}
        />
      </Accordion>
    );
  }
}

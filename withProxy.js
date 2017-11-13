import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';

// HOC used to manage proxies and sponsors
const withProxy = WrappedComponent =>
  class WithProxyComponent extends React.Component {
    static propTypes = {
      resources: PropTypes.shape({
        sponsors: PropTypes.object,
        proxies: PropTypes.object,
      }),
      match: PropTypes.shape({
        params: PropTypes.shape({
          id: PropTypes.string,
        }),
      }).isRequired,
      mutator: PropTypes.shape({
        proxiesFor: PropTypes.shape({
          POST: PropTypes.func.isRequired,
          GET: PropTypes.func.isRequired,
          DELETE: PropTypes.func.isRequired,
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
      }),
    };

    static manifest = Object.freeze(
      Object.assign({}, WrappedComponent.manifest, {
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
      },
    ));

    constructor(props) {
      super(props);
      this.getProxies = this.getProxies.bind(this);
      this.getSponsors = this.getSponsors.bind(this);
      this.updateProxies = this.updateProxies.bind(this);
      this.updateSponsors = this.updateSponsors.bind(this);
    }

    componentDidMount() {
      this.loadSponsors();
      this.loadProxies();
    }

    componentWillReceiveProps(nextProps) {
      const { match: { params: { id } } } = nextProps;
      if (id !== this.props.match.params.id) {
        this.loadSponsors();
        this.loadProxies();
      }
    }

    loadSponsors() {
      this.loadResource('sponsors', 'proxyUserId', 'userId');
    }

    loadProxies() {
      this.loadResource('proxies', 'userId', 'proxyUserId');
    }

    // join proxiesFor with proxies
    getProxies() {
      return this.getRecords('proxies', 'proxyUserId');
    }

    // join sponsorsFor with sponsors
    getSponsors() {
      return this.getRecords('sponsors', 'userId');
    }

    // used for loading sponsors and proxies
    loadResource(resourceName, queryId, recordId) {
      const userId = this.props.match.params.id;
      const { mutator } = this.props;
      const resource = mutator[resourceName];
      const resourceFor = mutator[`${resourceName}For`];
      const query = `query=(${queryId}=${userId})`;

      resourceFor.reset();
      resource.reset();
      resourceFor.GET({ params: { query } }).then((recordsFor) => {
        if (!recordsFor.length) return;
        const ids = recordsFor.map(pf => `id=${pf[recordId]}`).join(' or ');
        resource.GET({ params: { query: `query=(${ids})` } });
      });
    }

    // use to join proxyFor and proxies records
    getRecords(resourceName, idKey) {
      const { resources } = this.props;
      const resourceForName = `${resourceName}For`;
      const records = (resources[resourceName] || {}).records || [];
      const recordsFor = (resources[resourceForName] || {}).records || [];

      if (!records.length) return records;

      const rMap = records.reduce((memo, record) =>
        Object.assign(memo, { [record.id]: record }), {});
      return recordsFor.map(r => ({ ...r, user: rMap[r[idKey]] }));
    }

    update(resourceName, records, curRecords) {
      const { match: { params }, mutator: { proxiesFor } } = this.props;
      const userId = params.id;

      const edited = records.filter(rec => !!(rec.id));
      const removed = _.differenceBy(curRecords, edited, 'id');
      const added = records.filter(rec => !rec.id);

      const editPromises = edited.map(rec => (proxiesFor.PUT(_.omit(rec, 'user'))));
      const removePromises = removed.map(rec => (proxiesFor.DELETE(_.omit(rec, 'user'))));
      const addPromises = added.map((rec) => {
        const data = (resourceName === 'proxies') ?
          { proxyUserId: rec.user.id, userId, meta: rec.meta } :
          { proxyUserId: userId, userId: rec.user.id, meta: rec.meta };
        return proxiesFor.POST(data);
      });

      return Promise.all([...addPromises, ...editPromises, ...removePromises]);
    }

    updateProxies(proxies) {
      const curProxies = this.getProxies();
      this.update('proxies', proxies, curProxies)
        .then(() => this.loadProxies());
    }

    updateSponsors(sponsors) {
      const curSponsors = this.getSponsors();
      this.update('sponsors', sponsors, curSponsors)
        .then(() => this.loadSponsors());
    }

    render() {
      return (<WrappedComponent
        getSponsors={this.getSponsors}
        getProxies={this.getProxies}
        updateProxies={this.updateProxies}
        updateSponsors={this.updateSponsors}
        {...this.props}
      />);
    }
  };


export default withProxy;

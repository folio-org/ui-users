import { differenceWith } from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';

// HOC used to manage proxies and sponsors
const withProxy = WrappedComponent => class WithProxyComponent extends React.Component {
    static manifest = Object.freeze(
      { ...WrappedComponent.manifest,
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
        } },
    );

    static propTypes = {
      stripes: PropTypes.shape({
        hasPerm: PropTypes.func.isRequired,
      }),
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
          PUT: PropTypes.func.isRequired,
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

    constructor(props) {
      super(props);
      this.getProxies = this.getProxies.bind(this);
      this.getSponsors = this.getSponsors.bind(this);
      this.updateProxies = this.updateProxies.bind(this);
      this.updateSponsors = this.updateSponsors.bind(this);
      this.state = {};
    }

    static getDerivedStateFromProps(nextProps) {
      if (!nextProps.stripes.hasPerm('proxiesfor.collection.get')) {
        return null;
      }

      const { match: { params: { id } } } = nextProps;

      if (id) {
        return { userId: id };
      }

      return null;
    }

    componentDidMount() {
      const { match: { params: { id } } } = this.props;
      this.load(id);
    }

    componentDidUpdate(prevProps, prevState) {
      const { userId } = this.state;
      if (userId && userId !== prevState.userId) {
        this.load(userId);
      }
    }

    loadSponsors(userId) {
      this.loadResource('sponsors', userId);
    }

    loadProxies(userId) {
      this.loadResource('proxies', userId);
    }

    load(userId) {
      if (!this.props.stripes.hasPerm('proxiesfor.collection.get')) {
        return;
      }

      this.loadSponsors(userId);
      this.loadProxies(userId);
    }

    // join proxiesFor with proxies
    getProxies() {
      return this.getRecords('proxies', 'proxyUserId');
    }

    // join sponsorsFor with sponsors
    getSponsors() {
      return this.getRecords('sponsors', 'userId');
    }

    loadResource(resourceName, userId) {
      const [queryKey, recordKey] = (resourceName === 'sponsors')
        ? ['proxyUserId', 'userId'] : ['userId', 'proxyUserId'];
      const { mutator, resources } = this.props;
      const resource = mutator[resourceName];
      const resourceFor = mutator[`${resourceName}For`];
      const query = `(${queryKey}=="${userId}")`;
      const limit = '50';
      if (resources[resourceName] && !resources[resourceName].isPending) {
        resourceFor.reset();
        resource.reset();
        resourceFor.GET({ params: { query, limit } }).then((recordsFor) => {
          if (!recordsFor.length) return;
          const ids = recordsFor.map(pf => `id=="${pf[recordKey]}"`).join(' or ');
          resource.GET({ params: { query: `(${ids})`, limit } });
        });
      }
    }

    getRecords(resourceName, idKey) {
      const { resources } = this.props;
      const resourceForName = `${resourceName}For`;
      const records = (resources[resourceName] || {}).records || [];
      const recordsFor = (resources[resourceForName] || {}).records || [];

      if (!records.length) return records;

      const rMap = records.reduce((memo, record) => Object.assign(memo, { [record.id]: record }), {});
      return recordsFor.map(r => ({ proxy: r, user: rMap[r[idKey]] }));
    }

    update(resourceName, records, curRecords) {
      const { match: { params }, mutator: { proxiesFor } } = this.props;
      const userId = params.id;

      const edited = records.filter(rec => !!(rec.proxy.id));
      const removed = differenceWith(curRecords, edited, (r1, r2) => (r1.proxy.id === r2.proxy.id));
      const added = records.filter(rec => !rec.proxy.id);

      const editPromises = edited.map(rec => (proxiesFor.PUT(rec.proxy)));
      const removePromises = removed.map(rec => (proxiesFor.DELETE(rec.proxy)));
      const addPromises = added.map((rec) => {
        const data = (resourceName === 'proxies') ?
          { ...rec.proxy, proxyUserId: rec.user.id, userId } :
          { ...rec.proxy, proxyUserId: userId, userId: rec.user.id };

        return proxiesFor.POST(data);
      });

      return Promise.all([...addPromises, ...editPromises, ...removePromises]);
    }

    updateProxies(proxies) {
      const curProxies = this.getProxies();

      this.update('proxies', proxies, curProxies);
    }

    updateSponsors(sponsors) {
      const curSponsors = this.getSponsors();

      this.update('sponsors', sponsors, curSponsors);
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

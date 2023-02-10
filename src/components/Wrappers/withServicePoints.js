import React from 'react';
import PropTypes from 'prop-types';
import { get, keyBy } from 'lodash';

import {
  stripesShape,
  setServicePoints,
  setCurServicePoint,
  HandlerManager,
  coreEvents as events,
} from '@folio/stripes/core';

import { MAX_RECORDS } from '../../constants';

const withServicePoints = WrappedComponent => class WithServicePointsComponent extends React.Component {
    static manifest = {
      ...WrappedComponent.manifest,
      servicePoints: {
        type: 'okapi',
        path: 'service-points',
        params: {
          query: 'cql.allRecords=1 sortby name',
          limit: MAX_RECORDS,
        },
        records: 'servicepoints',
        accumulate: true,
        fetch: false,
      },
      servicePointUserId: '',
      servicePointsUsers: {
        type: 'okapi',
        path: `service-points-users?query=(userId==:{id})&limit=${MAX_RECORDS}`,
        records: 'servicePointsUsers',
        accumulate: true,
        fetch: false,
        POST: {
          path: 'service-points-users',
        },
        PUT: {
          path: 'service-points-users/%{servicePointUserId}',
        },
      },
    };

    static propTypes = {
      resources: PropTypes.shape({
        servicePoints: PropTypes.shape({
          records: PropTypes.arrayOf(PropTypes.object),
        }),
        servicePointsUsers: PropTypes.shape({
          records: PropTypes.arrayOf(PropTypes.object),
        }),
        servicePointUserId: PropTypes.oneOfType([
          PropTypes.object,
          PropTypes.string,
        ]),
      }),
      match: PropTypes.shape({
        params: PropTypes.shape({
          id: PropTypes.string,
        }).isRequired,
      }).isRequired,
      mutator: PropTypes.shape({
        servicePoints: PropTypes.shape({
          GET: PropTypes.func.isRequired,
          reset: PropTypes.func.isRequired,
        }),
        servicePointUserId: PropTypes.shape({
          replace: PropTypes.func.isRequired,
        }),
        servicePointsUsers: PropTypes.shape({
          GET: PropTypes.func.isRequired,
          reset: PropTypes.func.isRequired,
          POST: PropTypes.func.isRequired,
          PUT: PropTypes.func.isRequired,
        }),
      }),
      stripes: stripesShape.isRequired,
    };

    state = {
      userServicePoints: [],
      userPreferredServicePoint: undefined,
    };

    static getDerivedStateFromProps(nextProps, state) {
      // Save the id of the record in the service-points-users table for later use when mutating it.
      const servicePointUserId = get(nextProps.resources.servicePointsUsers, ['records', 0, 'id'], '');
      const localServicePointUserId = nextProps.resources.servicePointUserId;

      // Why this gross shouldUpdateState variable? It makes things easy:
      // if the id is changing, then we know the SPs cached in state need
      // to change too. The test below that compares servicePointsUsers
      // with servicePoints is insufficient when transitioning between
      // users with the same numbers of SPs assigned or if both queries
      // are still in-progress. Thus, shouldUpdateState serves to clear
      // out state when the ID changes, and then the array comparison
      // serves to fill in state when the queries complete.
      let shouldUpdateState = false;
      if (servicePointUserId && servicePointUserId !== localServicePointUserId) {
        nextProps.mutator.servicePointUserId.replace(servicePointUserId);
        shouldUpdateState = true;
      }

      // Check if new user service points have been received and the list of all service points has also been received.
      const userServicePointsIds = get(nextProps.resources.servicePointsUsers, ['records', 0, 'servicePointsIds'], []);
      const servicePoints = get(nextProps.resources.servicePoints, ['records'], []);
      if (shouldUpdateState || ((userServicePointsIds.length !== state.userServicePoints.length) && servicePoints.length)) {
        const servicePointsById = keyBy(servicePoints, 'id');
        const userServicePoints = userServicePointsIds
          .filter(id => servicePointsById[id])
          .map(id => servicePointsById[id])
          .sort(((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true })));
        const userPreferredServicePoint = get(nextProps.resources.servicePointsUsers, ['records', 0, 'defaultServicePointId'], '-');

        return {
          userServicePoints,
          userPreferredServicePoint,
        };
      }

      return null;
    }

    componentDidMount() {
      this._isMounted = true;
      this.fetchServicePointsResources();
    }

    componentDidUpdate(prevProps) {
      if (prevProps.match.params.id !== this.props.match.params.id) {
        this.fetchServicePointsResources();
      }

      return {};
    }

    componentWillUnmount() {
      this._isMounted = false;
    }

    fetchServicePointsResources() {
      // Fetch the records for what service points are associated with this user. We can't
      // automatically fetch them since we have `fetch: false` turned on to avoid fetching
      // if the logged-in user doesn't have permissions to fetch the record.
      if (this.props.stripes.hasPerm('inventory-storage.service-points.collection.get,inventory-storage.service-points-users.collection.get')) {
        this.props.mutator.servicePointsUsers.reset();
        this.props.mutator.servicePointsUsers.GET();
        this.props.mutator.servicePoints.reset();
        this.props.mutator.servicePoints.GET();
      }
    }

    getUserServicePoints = () => {
      return this.state.userServicePoints;
    };

    getPreferredServicePoint = () => {
      return this.state.userPreferredServicePoint;
    };

    updateServicePoints = (servicePoints, preferredServicePoint) => {
      let mutator;
      let record = get(this.props.resources.servicePointsUsers, ['records', 0]);
      if (record) {
        mutator = this.props.mutator.servicePointsUsers.PUT;
      } else {
        mutator = this.props.mutator.servicePointsUsers.POST;
        record = { userId: this.props.match.params.id };
      }

      record.servicePointsIds = servicePoints.map(sp => sp.id);
      record.defaultServicePointId = (!servicePoints.length || preferredServicePoint === '-') ? null : preferredServicePoint;

      mutator(record).then(() => {
        this.props.mutator.servicePointsUsers.reset();
        this.props.mutator.servicePointsUsers.GET();

        // Check if we finished editing the currently-logged-in user.
        if (this.props.match.params.id === this.props.stripes.user.user.id) {
          this.setCurrentServicePoint(servicePoints, record.defaultServicePointId);
        }
      });
    };

    setCurrentServicePoint(servicePoints, defaultServicePointId) {
      const { stripes: { store } } = this.props;

      setServicePoints(store, servicePoints);

      if (defaultServicePointId) {
        const sp = servicePoints.find(r => r.id === defaultServicePointId);
        setCurServicePoint(store, sp);
      } else if (this._isMounted) {
        this.setState({
          showChangeServicePointHandler: true
        });
      }
    }

    render() {
      return (
        <>
          <WrappedComponent
            getUserServicePoints={this.getUserServicePoints}
            getPreferredServicePoint={this.getPreferredServicePoint}
            updateServicePoints={this.updateServicePoints}
            {...this.props}
          />
          { this.state.showChangeServicePointHandler ?
            <HandlerManager
              props={{ onClose: () => this.setState({ showChangeServicePointHandler: false }) }}
              event={events.CHANGE_SERVICE_POINT}
              stripes={this.props.stripes}
            /> : null
          }
        </>
      );
    }
};

export default withServicePoints;

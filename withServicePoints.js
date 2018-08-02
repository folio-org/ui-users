import React from 'react';
import PropTypes from 'prop-types';
import { get } from 'lodash';

const withServicePoints = WrappedComponent =>
  class WithServicePointsComponent extends React.Component {
    static manifest = {
      ...WrappedComponent.manifest,
      servicePoints: {
        type: 'okapi',
        path: 'service-points',
        records: 'servicepoints',
        accumulate: true,
        fetch: false,
      },
      servicePointUserId: '',
      servicePointsUsers: {
        type: 'okapi',
        path: 'service-points-users?query=(userId==:{id})',
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
    }

    static propTypes = {
      parentResources: PropTypes.object,
      resources: PropTypes.shape({
        servicePoints: PropTypes.shape({
          records: PropTypes.arrayOf(PropTypes.object),
        }),
        servicePointsUsers: PropTypes.shape({
          records: PropTypes.arrayOf(PropTypes.object),
        }),
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
      stripes: PropTypes.shape({
        hasPerm: PropTypes.func.isRequired,
      }).isRequired,
    };

    state = {
      userServicePoints: [],
      userPreferredServicePoint: undefined,
    }

    static getDerivedStateFromProps(nextProps, state) {
      // Save the id of the record in the service-points-users table for later use when mutating it.
      const servicePointUserId = get(nextProps.resources.servicePointsUsers, ['records', 0, 'id'], '');
      const localServicePointUserId = nextProps.resources.servicePointUserId;
      if (servicePointUserId !== localServicePointUserId) {
        nextProps.mutator.servicePointUserId.replace(servicePointUserId);
      }

      // Check if new user service points have been received and the list of all service points has also been received.
      const userServicePointsIds = get(nextProps.resources.servicePointsUsers, ['records', 0, 'servicePointsIds'], []);
      const servicePoints = get(nextProps.resources.servicePoints, ['records'], []);
      if ((userServicePointsIds.length !== state.userServicePoints.length) && servicePoints.length) {
        const userServicePoints = userServicePointsIds
          .map(usp => servicePoints.find(sp => sp.id === usp))
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
      this.fetchServicePointsResources();
    }

    componentDidUpdate(prevProps) {
      if (prevProps.match.params.id !== this.props.match.params.id) {
        this.fetchServicePointsResources();
      }

      return {};
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

    getServicePoints = () => {
      return this.state.userServicePoints;
    }

    getPreferredServicePoint = () => {
      return this.state.userPreferredServicePoint;
    }

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
      record.defaultServicePointId = preferredServicePoint === '-' ? null : preferredServicePoint;

      mutator(record).then(() => {
        this.props.mutator.servicePointsUsers.reset();
        this.props.mutator.servicePointsUsers.GET();
      });
    }


    render() {
      return (<WrappedComponent
        getServicePoints={this.getServicePoints}
        getPreferredServicePoint={this.getPreferredServicePoint}
        updateServicePoints={this.updateServicePoints}
        {...this.props}
      />);
    }
  };

export default withServicePoints;

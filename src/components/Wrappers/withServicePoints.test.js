import React, { act, useEffect } from 'react';

import {
  HandlerManager,
  updateUser,
} from '@folio/stripes/core';
import { render, screen, waitFor } from '@folio/jest-config-stripes/testing-library/react';

import PropTypes from 'prop-types';

import okapiCurrentUser from '../../../test/jest/fixtures/okapiCurrentUser';

import withServicePoints from './withServicePoints';


const mockGet = jest.fn(() => new Promise((resolve, _) => resolve()));
const mockPost = jest.fn((record) => new Promise((resolve, _) => resolve(record)));
const mockPut = jest.fn((record) => new Promise((resolve, _) => resolve(record)));

const mutator = {
  servicePointsUsers: {
    GET: mockGet,
    POST: mockPost,
    PUT: mockPut,
    reset: jest.fn(() => new Promise((resolve, _) => resolve()))
  },
  servicePoints: {
    GET: jest.fn(),
    reset: jest.fn()
  },
  servicePointUserId: {
    replace: jest.fn()
  }
};

const servicePointsIds = okapiCurrentUser.servicePoints.map(({ id }) => id);
const servicePointsUsersRecord = {
  id: 'a51df26e-b472-5c06-8362-01025b90238b',
  servicePointsIds,
  defaultServicePointId: okapiCurrentUser.curServicePoint.id,
};

const resources = {
  servicePoints: { records: okapiCurrentUser.servicePoints },
  servicePointsUsers: { records: [servicePointsUsersRecord] },
  servicePointUserId: { id: 'a51df26e-b472-5c06-8362-01025b90238b' },
};

const props = {
  match: { params: { id: '1' } },
  mutator,
  resources,
  stripes: {
    hasPerm: jest.fn().mockReturnValue(true),
    hasAnyPerm: jest.fn().mockReturnValue(true),
    hasInterface: jest.fn().mockReturnValue(true),
    actionNames: [],
    config: {},
    connect: jest.fn(),
    user: {
      user: {
        id: '1'
      }
    },
    clone: jest.fn()
  },
};

const MockComponent = ({ getUserServicePoints, getPreferredServicePoint, updateServicePoints }) => {
  useEffect(() => {
    getUserServicePoints();
    getPreferredServicePoint();
    updateServicePoints(okapiCurrentUser.servicePoints, '-');
  }, [getUserServicePoints, getPreferredServicePoint, updateServicePoints]);

  return (
    <div data-testid="userService">Test Mock Component</div>
  );
};

MockComponent.propTypes = {
  getUserServicePoints: PropTypes.func,
  getPreferredServicePoint: PropTypes.func,
  updateServicePoints: PropTypes.func,
};

const WrappedComponent = withServicePoints(MockComponent);
const renderWithServicePoints = () => render(<WrappedComponent {...props} />);

describe('withDeclareLost', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('render wrapped component', () => {
    renderWithServicePoints();
    expect(screen.getByText('Test Mock Component')).toBeInTheDocument();
  });
  test('Check if update is called', () => {
    renderWithServicePoints();
    expect(mockPut).toHaveBeenCalled();
  });
  test('Check if service points are called', () => {
    renderWithServicePoints();
    expect(mockGet).toHaveBeenCalled();
  });
  describe('when servicePoints array is empty', () => {
    it('should not show HandlerManager', async () => {
      const MockComponentEmpty = ({ updateServicePoints }) => {
        useEffect(() => {
          updateServicePoints([], '-');
        }, [updateServicePoints]);

        return (
          <div data-testid="userService">Test Mock Component</div>
        );
      };

      const WrappedComponentEmpty = withServicePoints(MockComponentEmpty);
      const propsWithCurrentUser = {
        ...props,
        match: { params: { id: props.stripes.user.user.id } },
        stripes: {
          ...props.stripes,
          hasAnyPerm: jest.fn().mockReturnValue(true),
          store: {
            getState: jest.fn(),
            dispatch: jest.fn(),
            subscribe: jest.fn(),
          }
        }
      };

      await act(async () => render(<WrappedComponentEmpty {...propsWithCurrentUser} />));

      expect(screen.queryByText('HandlerManagerMock')).not.toBeInTheDocument();
    });
  });

  describe('when updating service points for the current user', () => {
    it('persists servicePoints and curServicePoint in a single updateUser call', async () => {
      const MockComponentWithDefaultServicePoint = ({ updateServicePoints }) => {
        useEffect(() => {
          updateServicePoints(okapiCurrentUser.servicePoints, okapiCurrentUser.curServicePoint.id);
        }, [updateServicePoints]);

        return <div data-testid="userService">Test Mock Component</div>;
      };

      MockComponentWithDefaultServicePoint.propTypes = {
        updateServicePoints: PropTypes.func,
      };

      const WrappedComponentWithDefaultServicePoint = withServicePoints(MockComponentWithDefaultServicePoint);
      const store = {
        getState: jest.fn(),
        dispatch: jest.fn(),
        subscribe: jest.fn(),
      };
      const propsWithCurrentUser = {
        ...props,
        match: { params: { id: props.stripes.user.user.id } },
        stripes: {
          ...props.stripes,
          store,
        }
      };

      await act(async () => render(<WrappedComponentWithDefaultServicePoint {...propsWithCurrentUser} />));

      await waitFor(() => {
        expect(updateUser).toHaveBeenCalledTimes(1);
        expect(updateUser).toHaveBeenCalledWith(store, {
          servicePoints: okapiCurrentUser.servicePoints,
          curServicePoint: okapiCurrentUser.servicePoints[0],
        });
      });
    });

    it('waits for the change service point handler to close before resolving updateServicePoints', async () => {
      let updateServicePointsPromise;

      const MockComponentWithoutDefaultServicePoint = ({ updateServicePoints }) => {
        useEffect(() => {
          updateServicePointsPromise = updateServicePoints(okapiCurrentUser.servicePoints, '-');
        }, [updateServicePoints]);

        return <div data-testid="userService">Test Mock Component</div>;
      };

      const WrappedComponentWithoutDefaultServicePoint = withServicePoints(MockComponentWithoutDefaultServicePoint);
      const store = {
        getState: jest.fn(),
        dispatch: jest.fn(),
        subscribe: jest.fn(),
      };
      const propsWithCurrentUser = {
        ...props,
        match: { params: { id: props.stripes.user.user.id } },
        stripes: {
          ...props.stripes,
          store,
        }
      };
      const onResolved = jest.fn();

      await act(async () => render(<WrappedComponentWithoutDefaultServicePoint {...propsWithCurrentUser} />));

      await waitFor(() => expect(updateServicePointsPromise).toBeDefined());

      updateServicePointsPromise.then(onResolved);

      await waitFor(() => {
        expect(updateUser).toHaveBeenCalledWith(store, {
          servicePoints: okapiCurrentUser.servicePoints,
        });
        expect(HandlerManager).toHaveBeenCalled();
      });

      expect(onResolved).not.toHaveBeenCalled();

      await act(async () => {
        HandlerManager.mock.lastCall[0].props.onClose();
      });

      await waitFor(() => expect(onResolved).toHaveBeenCalled());
      expect(screen.queryByText('HandlerManagerMock')).not.toBeInTheDocument();
    });
  });

  describe('when defaultServicePointId and servicePoints are undefined', () => {
    it('should not crash the page', async () => {
      const MockComponentEmpty = ({ updateServicePoints }) => {
        useEffect(() => {
          const defaultServicePointId = undefined;
          const servicePoints = undefined;

          updateServicePoints(servicePoints, defaultServicePointId);
        }, [updateServicePoints]);

        return (
          <div data-testid="userService">Test Mock Component</div>
        );
      };

      const WrappedComponentEmpty = withServicePoints(MockComponentEmpty);
      const propsWithCurrentUser = {
        ...props,
        match: { params: { id: props.stripes.user.user.id } },
        stripes: {
          ...props.stripes,
          hasAnyPerm: jest.fn().mockReturnValue(true),
          store: {
            getState: jest.fn(),
            dispatch: jest.fn(),
            subscribe: jest.fn(),
          }
        }
      };

      await act(() => render(<WrappedComponentEmpty {...propsWithCurrentUser} />));

      expect(screen.getByTestId('userService')).toBeInTheDocument();
    });
  });
});

import React, { act, useEffect } from 'react';
import { render, screen } from '@folio/jest-config-stripes/testing-library/react';
import PropTypes from 'prop-types';

import okapiCurrentUser from '../../../test/jest/fixtures/okapiCurrentUser';

import withServicePoints from './withServicePoints';


jest.mock('@folio/stripes/core', () => {
  return {
    ...jest.requireActual('@folio/stripes/core'),
    updateUser: () => jest.fn(),
    HandlerManager: () => <div>HandlerManagerMock</div>
  };
});

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

const resources = {
  servicePoints: { records: okapiCurrentUser.servicePoints },
  servicePointsUsers: { records: okapiCurrentUser.servicePoints },
  servicePointUserId: { id: 'a51df26e-b472-5c06-8362-01025b90238b' },
};

const props = {
  match: { params: { id: '1' } },
  mutator,
  resources,
  stripes: {
    hasPerm: jest.fn().mockReturnValue(true),
    hasInterface: jest.fn().mockReturnValue(true),
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
});

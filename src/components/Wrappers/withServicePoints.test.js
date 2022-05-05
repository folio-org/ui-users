import React, { useEffect } from 'react';
import { render, screen } from '@testing-library/react';
import PropTypes from 'prop-types';
import '__mock__/currencyData.mock';
import okapiCurrentUser from 'fixtures/okapiCurrentUser';

import withServicePoints from './withServicePoints';


jest.mock('@folio/stripes/core', () => {
  return {
    ...jest.requireActual('@folio/stripes/core'),
    setServicePoints: () => jest.fn(),
    setCurServicePoint: () => jest.fn(),
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
    user: {
      user: {
        id: '1'
      }
    }
  },
};

const MockComponent = ({ getUserServicePoints, getPreferredServicePoint, updateServicePoints }) => {
  useEffect(() => {
    const isMounted = true;
    if (isMounted) {
      getUserServicePoints();
      getPreferredServicePoint();
      updateServicePoints(okapiCurrentUser.servicePoints, '-');
    }
  });

  return (
    <>
      <div data-testid="userService">Test Mock Component</div>
    </>
  );
};

MockComponent.propTypes = {
  getUserServicePoints: PropTypes.func,
  getPreferredServicePoint: PropTypes.func,
  updateServicePoints: PropTypes.bool,
};

const WrappedComponent = withServicePoints(MockComponent);
const renderwithServicePoints = () => render(<WrappedComponent {...props} />);

describe('withDeclareLost', () => {
  test('render wrapped component', () => {
    renderwithServicePoints();
    expect(screen.getByText('Test Mock Component')).toBeInTheDocument();
  });
  test('Check if update is called', () => {
    renderwithServicePoints();
    expect(mockPut).toHaveBeenCalled();
  });
  test('Check if service points are called', () => {
    renderwithServicePoints();
    expect(mockGet).toHaveBeenCalled();
  });
});

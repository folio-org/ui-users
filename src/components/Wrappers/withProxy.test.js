import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PropTypes from 'prop-types';

import '__mock__/currencyData.mock';
import '__mock__/stripesCore.mock';
import buildStripes from '__mock__/stripes.mock';
import proxiesFor from 'fixtures/proxiesFor';
import proxies from 'fixtures/proxies';
import sponsors from 'fixtures/sponsors';
import sponsorsFor from 'fixtures/sponsorsFor';

import withProxy from './withProxy';

const Wrapper = ({
  updateProxies,
  updateSponsors,
  getSponsors,
  getProxies,
  updatedProxies,
  updatedSponsors,
}) => {
  const proxyRecords = getProxies();
  const sponsorRecords = getSponsors();

  return (
    <>
      <div data-testid="proxies">
        {
          proxyRecords.map((p, index) => (<p key={`proxy-${index}`} data-testid={`proxy-${index}`}>{p.user.username}</p>))
        }
      </div>
      <div data-testid="sponsors">
        {
          sponsorRecords.map((s, index) => (<p key={`sponsor-${index}`} data-testid={`sponsor-${index}`}>{s.user.username}</p>))
        }
      </div>
      <button type="button" data-testid="update-proxies" onClick={() => updateProxies(updatedProxies)}>update proxies</button>
      <button type="button" data-testid="update-sponsors" onClick={() => updateSponsors(updatedSponsors)}>update sponsors</button>
    </>
  );
};

Wrapper.propTypes = {
  updateProxies: PropTypes.func,
  updateSponsors: PropTypes.func,
  getSponsors: PropTypes.func,
  getProxies: PropTypes.func,
  updatedProxies: PropTypes.arrayOf(PropTypes.object),
  updatedSponsors: PropTypes.arrayOf(PropTypes.object),
};

const mutator = {
  proxiesFor: {
    GET: jest.fn().mockReturnValue(Promise.resolve(proxiesFor)),
    PUT: jest.fn().mockReturnValue(Promise.resolve()),
    POST: jest.fn().mockReturnValue(Promise.resolve()),
    DELETE: jest.fn().mockReturnValue(Promise.resolve()),
    reset: jest.fn(),
  },
  sponsorsFor: {
    GET: jest.fn().mockReturnValue(Promise.resolve(sponsorsFor)),
    PUT: jest.fn().mockReturnValue(Promise.resolve()),
    POST: jest.fn().mockReturnValue(Promise.resolve()),
    DELETE: jest.fn().mockReturnValue(Promise.resolve()),
    reset: jest.fn(),
  },
  sponsors: {
    GET: jest.fn().mockReturnValue(Promise.resolve(sponsors)),
    reset: jest.fn(),
  },
  proxies: {
    GET: jest.fn().mockReturnValue(Promise.resolve(proxies)),
    reset: jest.fn(),
  },
};

const resources = {
  sponsors: { records: sponsors },
  proxies: { records: proxies },
  proxiesFor: { records: proxiesFor },
  sponsorsFor: { records: sponsorsFor },
};

const props = {
  match: { params: { id: '1' } },
  mutator,
  resources,
  stripes: buildStripes({ hasPerm: () => true }),
};

const WrappedComponent = withProxy(Wrapper);
const renderWithProxy = (extraProps = {}) => render(<WrappedComponent {...props} {...extraProps} />);

afterEach(() => jest.clearAllMocks());

describe('withProxy', () => {
  test('renders proxies and sponors', () => {
    renderWithProxy();

    expect(screen.queryByTestId('proxies')).toBeInTheDocument();
    expect(screen.queryByTestId('proxy-0')).toBeInTheDocument();
    expect(screen.queryByTestId('sponsors')).toBeInTheDocument();
    expect(screen.queryByTestId('sponsor-0')).toBeInTheDocument();
  });

  test('renders empty list without permissions', () => {
    renderWithProxy({
      stripes: buildStripes({ hasPerm: () => false }),
      resources: {
        sponsors: {},
        proxies: {},
      }
    });
    expect(screen.queryByTestId('proxies')).toBeInTheDocument();
    expect(screen.queryByTestId('proxy-0')).not.toBeInTheDocument();
    expect(screen.queryByTestId('sponsors')).toBeInTheDocument();
    expect(screen.queryByTestId('sponsor-0')).not.toBeInTheDocument();
  });

  test('remove proxies', () => {
    renderWithProxy({ updatedProxies: [] });
    userEvent.click(screen.queryByTestId('update-proxies'));

    expect(mutator.proxiesFor.DELETE).toHaveBeenCalled();
  });

  test('remove sponsors', () => {
    renderWithProxy({ updatedSponsors: [] });
    userEvent.click(screen.queryByTestId('update-sponsors'));

    expect(mutator.proxiesFor.DELETE).toHaveBeenCalled();
  });

  test('update sponsors', () => {
    renderWithProxy({ updatedSponsors: [{ user: {}, proxy: { id: 1 } }] });
    userEvent.click(screen.queryByTestId('update-sponsors'));

    expect(mutator.proxiesFor.PUT).toHaveBeenCalled();
  });

  test('update proxies', () => {
    renderWithProxy({ updatedProxies: [{ user: {}, proxy: { id: 1 } }] });
    userEvent.click(screen.queryByTestId('update-proxies'));

    expect(mutator.proxiesFor.PUT).toHaveBeenCalled();
  });

  test('add sponsors', () => {
    renderWithProxy({ updatedSponsors: [{ user: {}, proxy: {} }] });
    userEvent.click(screen.queryByTestId('update-sponsors'));

    expect(mutator.proxiesFor.POST).toHaveBeenCalled();
  });

  test('add proxies', () => {
    renderWithProxy({ updatedProxies: [{ user: {}, proxy: {} }] });
    userEvent.click(screen.queryByTestId('update-proxies'));

    expect(mutator.proxiesFor.POST).toHaveBeenCalled();
  });

  test('rerender with a different user id', () => {
    const { rerender } = renderWithProxy();

    rerender(<WrappedComponent {...props} match={{ params: { id: '2' } }} />);

    expect(mutator.proxiesFor.GET).toHaveBeenCalled();
  });
});

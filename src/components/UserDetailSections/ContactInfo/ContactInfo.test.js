import { screen } from '@folio/jest-config-stripes/testing-library/react';

import renderWithRouter from 'helpers/renderWithRouter';
import '__mock__/stripesSmartComponent.mock';
import ContactInfo from './ContactInfo';

jest.mock('../../UserAddresses', () => () => <div>UserAddresses</div>);

const toggleMock = jest.fn();

const renderContactInfo = (props) => renderWithRouter(<ContactInfo {...props} />);

const defaultProps = {
  expanded: true,
  onToggle: toggleMock,
  accordionId: 'contactInfoSection',
  user: {
    personal: {
      email: 'test@example.com',
      phone: '555-1234',
      mobilePhone: '555-5678',
      preferredContactTypeIds: ['002'],
    },
    preferredEmailCommunication: ['Notices', 'Digests'],
  },
  addressTypes: [],
  addresses: [],
  customFields: {},
};

describe('ContactInfo', () => {
  it('displays email address', () => {
    renderContactInfo(defaultProps);
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  it('displays phone number', () => {
    renderContactInfo(defaultProps);
    expect(screen.getByText('555-1234')).toBeInTheDocument();
  });

  it('displays mobile phone number', () => {
    renderContactInfo(defaultProps);
    expect(screen.getByText('555-5678')).toBeInTheDocument();
  });

  describe('preferredContactTypeIds list formatting', () => {
    it('displays a single preferred contact type', () => {
      renderContactInfo(defaultProps);
      expect(screen.getByText('ui-users.data.contactTypes.email')).toBeInTheDocument();
    });

    it('displays multiple preferred contact types', () => {
      const props = {
        ...defaultProps,
        user: {
          ...defaultProps.user,
          personal: {
            ...defaultProps.user.personal,
            preferredContactTypeIds: ['002', '001'],
          },
        },
      };
      renderContactInfo(props);
      // FormattedList renders both labels in a single element; use regex to match each
      expect(screen.getByText(/ui-users\.data\.contactTypes\.email/)).toBeInTheDocument();
      expect(screen.getByText(/ui-users\.data\.contactTypes\.mail/)).toBeInTheDocument();
    });

    it('falls back to preferredContactTypeId (singular) when preferredContactTypeIds is absent', () => {
      const props = {
        ...defaultProps,
        user: {
          ...defaultProps.user,
          personal: {
            ...defaultProps.user.personal,
            preferredContactTypeIds: undefined,
            preferredContactTypeId: '003',
          },
        },
      };
      renderContactInfo(props);
      expect(screen.getByText('ui-users.data.contactTypes.textMessage')).toBeInTheDocument();
    });

    it('renders nothing for preferred contact when no valid type id is provided', () => {
      const props = {
        ...defaultProps,
        user: {
          ...defaultProps.user,
          personal: {
            ...defaultProps.user.personal,
            preferredContactTypeIds: ['invalid-id'],
          },
        },
      };
      renderContactInfo(props);
      expect(screen.queryByText('ui-users.data.contactTypes.email')).not.toBeInTheDocument();
      expect(screen.queryByText('ui-users.data.contactTypes.mail')).not.toBeInTheDocument();
      expect(screen.queryByText('ui-users.data.contactTypes.textMessage')).not.toBeInTheDocument();
    });
  });

  it('displays preferred email communication as a formatted list', () => {
    renderContactInfo(defaultProps);
    expect(screen.getByText('Notices and Digests')).toBeInTheDocument();
  });

  it('renders NoValue when preferredEmailCommunication is empty', () => {
    const props = {
      ...defaultProps,
      user: {
        ...defaultProps.user,
        preferredEmailCommunication: [],
      },
    };
    renderContactInfo(props);
    expect(screen.queryByText('Notices and Digests')).not.toBeInTheDocument();
  });

  it('renders NoValue when no valid preferred contact type is provided', () => {
    const props = {
      ...defaultProps,
      user: {
        ...defaultProps.user,
        personal: {
          ...defaultProps.user.personal,
          preferredContactTypeIds: [],
        },
      },
    };
    renderContactInfo(props);
    expect(screen.queryByText('ui-users.data.contactTypes.email')).not.toBeInTheDocument();
  });
});

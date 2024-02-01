import { screen } from '@folio/jest-config-stripes/testing-library/react';

import renderWithRouter from 'helpers/renderWithRouter';
import UserInfo from './UserInfo';
import { useProfilePicture } from './hooks';

import profilePicData from '../../../../test/jest/fixtures/profilePicture';

const toggleMock = jest.fn();

jest.mock('./hooks', () => ({
  useProfilePicture: jest.fn(),
}));

const renderUserInfo = (props) => renderWithRouter(<UserInfo {...props} />);

const props = {
  expanded: true,
  onToggle: toggleMock,
  accordionId: 'userInformationSection',
  patronGroup: {
    desc: 'Staff Member',
    expirationOffsetInDays: 730,
    group: 'staff',
    id: '3684a786-6671-4268-8ed0-9db82ebca60b'
  },
  user: {
    active: true,
    barcode: '1652148049552566548',
    createdDate: '2022-05-10T02:00:49.576+00:00',
    departments: [],
    id: 'ec6d380d-bcdd-4ef6-bb65-15677ab7cb84',
    patronGroup: '3684a786-6671-4268-8ed0-9db82ebca60b',
    personal: { lastName: 'Admin', firstName: 'acq-admin', addresses: [], profilePictureLink: 'profilePictureLink' },
    proxyFor: [],
    type: 'patron',
    updatedDate: '2022-05-10T02:00:49.576+00:00',
    username: 'acq-admin'
  },
  settings: [{ enabled: true }]
};

describe('Render userInfo component', () => {
  beforeEach(() => {
    useProfilePicture.mockClear().mockReturnValue(profilePicData.profile_picture_blob);
  });
  describe('Check if user data are shown', () => {
    it('Active Users', () => {
      renderUserInfo(props);
      expect(screen.getByText('acq-admin')).toBeInTheDocument();
      expect(screen.getByText('patron')).toBeInTheDocument();
      expect(screen.getByText('1652148049552566548')).toBeInTheDocument();
    });
    it('Inactive Users', () => {
      renderUserInfo({ ...props, user: { ...props.user, active: false } });
      expect(screen.getByText('acq-admin')).toBeInTheDocument();
      expect(screen.getByText('1652148049552566548')).toBeInTheDocument();
    });
    it('should display profile picture', () => {
      renderUserInfo(props);
      expect(screen.getByText('ui-users.information.profilePicture')).toBeInTheDocument();
    });
  });
});

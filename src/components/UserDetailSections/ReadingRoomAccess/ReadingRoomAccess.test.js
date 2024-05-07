import { screen, render, fireEvent } from '@folio/jest-config-stripes/testing-library/react';

import ReadingRoomAccess from './ReadingRoomAccess';

jest.unmock('@folio/stripes/components');
jest.mock('@folio/stripes/components', () => ({
  ...jest.requireActual('@folio/stripes/components'),
  MultiColumnList: jest.fn((props) => (
    <div data-testid={props['data-testid']} />
  )),
  SearchField: jest.fn((props) => (
    <input
      {...props}
    />
  )),
}));

const mockedRRAData = [
  {
    'userId': '2205005b-ca51-4a04-87fd-938eefa8f6de',
    'readingRoomId': '0e589a51-5f28-4b59-b923-b036cf56a41d',
    'readingRoomName': 'reading room1',
    'access': 'NOT_ALLOWED'
  },
  {
    'id': '2205005b-ca51-4a04-87fd-938eefaf86de',
    'userId': '2205005b-ca51-4a04-87fd-938eefa8f6de',
    'readingRoomId': 'ef1b8f7f-afb3-4454-bc3a-4c9989fcf977',
    'readingRoomName': 'reading room2',
    'access': 'NOT_ALLOWED',
    'metadata': {
      'createdDate': '2024-05-03T09:18:16.221500',
      'createdByUserId': '21457ab5-4635-4e56-906a-908f05e9233b',
      'updatedDate': '2024-05-03T09:18:52.016583',
      'updatedByUserId': '21457ab5-4635-4e56-906a-908f05e9233b'
    }
  },
];
const props = {
  accordionId: 'readingRoomSection',
  expanded: false,
  onToggle: jest.fn(),
  userRRAPermissions: mockedRRAData,
};

describe('ReadingRoomAccess', () => {
  const alteredProps = {
    ...props,
    expanded : true,
  };

  it('should render and accordion', () => {
    render(<ReadingRoomAccess {...props} />);
    expect(screen.getByText('ui-users.readingRoom.readingRoomAccess')).toBeDefined();
  });

  it('should display MultiColumnList', () => {
    render(<ReadingRoomAccess {...alteredProps} />);
    expect(screen.getByTestId('reading-room-access-mcl')).toBeDefined();
  });

  it('should display search field', () => {
    render(<ReadingRoomAccess {...alteredProps} />);
    expect(screen.getByPlaceholderText('ui-users.readingRoom.filter')).toBeDefined();
  });

  it('should filter MCL records "Name" column, based on the string entered in search box', () => {
    render(<ReadingRoomAccess {...alteredProps} />);
    const inputEl = screen.getByPlaceholderText('ui-users.readingRoom.filter');
    fireEvent.change(inputEl, { target: { value: '1' } });
    expect(screen.getByTestId('reading-room-access-mcl')).toBeDefined();
  });
});

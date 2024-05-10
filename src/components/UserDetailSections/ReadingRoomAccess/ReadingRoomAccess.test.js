import { screen, render, fireEvent, waitFor } from '@folio/jest-config-stripes/testing-library/react';

import ReadingRoomAccess from './ReadingRoomAccess';

jest.unmock('@folio/stripes/components');
jest.unmock('@folio/stripes/smart-components');

jest.mock('@folio/stripes/components', () => ({
  ...jest.requireActual('@folio/stripes/components'),
  SearchField: jest.fn((props) => (
    <input
      {...props}
    />
  )),
}));
jest.mock('@folio/stripes/smart-components', () => ({
  ...jest.requireActual('@folio/stripes/smart-components'),
  ViewMetaData: (props) => {
    if (props.children) {
      return props.children({
        lastUpdatedBy: {
          personal: {
            lastName: 'lastName',
            firstName: 'firstName'
          }
        }
      });
    }
    return <div>ViewMetaData</div>;
  }

}));

const mockedRRAData = [
  {
    'userId': '2205005b-ca51-4a04-87fd-938eefa8f6de',
    'readingRoomId': '0e589a51-5f28-4b59-b923-b036cf56a41d',
    'readingRoomName': 'reading room1',
    'access': 'NOT_ALLOWED'
  },
  {
    'id': '2205005b-ca51-4a04-87fd-938eefa8f6de',
    'userId': '2205005b-ca51-4a04-87fd-938eefa8f6de',
    'readingRoomId': '4f711485-4408-4bc9-8f67-9a9f37bce2f8',
    'readingRoomName': 'reading room 1',
    'access': 'ALLOWED',
    'notes': 'In Review',
    'metadata': {
      'createdDate': '2024-05-07T06:15:17.005013',
      'createdByUserId': '21457ab5-4635-4e56-906a-908f05e9233b',
      'updatedDate': '2024-05-07T06:15:38.838042',
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
    expect(document.querySelectorAll('[class^="mclContainer"]')).toBeDefined();
  });

  it('should display search field', () => {
    render(<ReadingRoomAccess {...alteredProps} />);
    expect(screen.getByPlaceholderText('ui-users.readingRoom.filter')).toBeDefined();
  });

  it('should filter MCL records "Name" column, based on the string entered in search box', async () => {
    render(<ReadingRoomAccess {...alteredProps} />);
    const inputEl = screen.getByPlaceholderText('ui-users.readingRoom.filter');
    fireEvent.change(inputEl, { target: { value: 'room1' } });
    const numOfRows = document.querySelectorAll('[class^="mclRowFormatterContainer"]').length;
    await waitFor(() => expect(numOfRows).toBe(1));
  });

  it('should render updated date', () => {
    render(<ReadingRoomAccess {...alteredProps} />);
    expect(screen.getByText('ui-users.readingRoom.metaSection.lastUpdatedDetails')).toBeDefined();
  });
});

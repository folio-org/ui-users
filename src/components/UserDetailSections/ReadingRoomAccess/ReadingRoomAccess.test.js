import { screen, render } from '@folio/jest-config-stripes/testing-library/react';

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

const props = {
  accordionId: 'readingRoomSection',
  expanded: false,
  onToggle: jest.fn(),
  // userId: 'b17096d8-5b8c-587f-8e78-8f808994b09b',
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
});

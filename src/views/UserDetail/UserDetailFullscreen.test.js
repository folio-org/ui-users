import React from 'react';
import {
  render,
  screen,
} from '@testing-library/react';
import '../../../test/jest/__mock__';
import UserDetailFullscreen from './UserDetailFullscreen';

jest.mock(
  './UserDetail',
  () => 'UserDetail'
);

const renderUserDetailFullScreen = (props) => {
  return render(
    <UserDetailFullscreen {...props} />
  );
};

describe('UserDetailFullScreen', () => {
  it('should render UserDetailFulScreen', () => {
    renderUserDetailFullScreen({});
    expect(screen.findByText('UserDetail')).toBeDefined();
  });
});

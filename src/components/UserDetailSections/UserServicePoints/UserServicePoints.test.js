import { screen } from '@testing-library/react';
import okapiCurrentUser from 'fixtures/okapiCurrentUser';
import userEvent from '@testing-library/user-event';
import '__mock__/stripesComponents.mock';

import renderWithRouter from 'helpers/renderWithRouter';
import UserServicePoints from './UserServicePoints';

const toggleMock = jest.fn();

const renderUserServicePoints = (props) => renderWithRouter(<UserServicePoints {...props} />);

const props = (preffered, isEmpty) => {
  return {
    expanded: true,
    onToggle: toggleMock,
    accordionId: 'UserServicePoints',
    preferredServicePoint: preffered ? '578a8413-dec9-4a70-a2ab-10ec865399f6' : '-',
    servicePoints: isEmpty ? [] : okapiCurrentUser.servicePoints,
  };
};

describe('Render User Service Points component', () => {
  it('Check if Component is rendered', () => {
    renderUserServicePoints(props(true, false));
    expect(screen.getByText('7c5abc9f-f3d7-4856-b8d7-6712462ca007')).toBeInTheDocument();
  });
  it('Check if Formatter is working', () => {
    renderUserServicePoints(props(true, false));
    userEvent.click(screen.getByText('Formatter'));
    expect(document.querySelector('[id="UserServicePoints"]')).toBeInTheDocument();
  });
  it('if preffered service point is empty', () => {
    renderUserServicePoints(props(false, false));
    expect(screen.getByText('ui-users.sp.preferredSPNone')).toBeInTheDocument();
  });
  it('if services point is empty', () => {
    renderUserServicePoints(props(false, true));
    expect(screen.getByText('List Component')).toBeInTheDocument();
  });
});

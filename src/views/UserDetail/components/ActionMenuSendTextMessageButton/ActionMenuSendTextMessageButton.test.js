import { render, screen } from '@folio/jest-config-stripes/testing-library/react';
import userEvent from '@folio/jest-config-stripes/testing-library/user-event';
import { IfPermission } from '@folio/stripes/core';

import ActionMenuSendTextMessageButton, {
  shouldAllowSendingText,
} from './ActionMenuSendTextMessageButton';

const sms = '003';
const email = '002';

const smsUser = {
  personal: {
    preferredContactTypeId: sms,
    preferredContactTypeIds: [],
    mobilePhone: '555-1234',
  },
};

IfPermission.mockImplementation(({ children }) => children);

describe('shouldAllowSendingText', () => {
  test.each([
    [
      'preferredContactTypeId is sms with mobile phone',
      { preferredContactTypeId: sms, preferredContactTypeIds: [], mobilePhone: '555-1234' },
      true,
    ],
    [
      'preferredContactTypeIds includes sms with mobile phone',
      { preferredContactTypeId: email, preferredContactTypeIds: [sms], mobilePhone: '555-1234' },
      true,
    ],
    [
      'preferred contact type is not sms',
      { preferredContactTypeId: email, preferredContactTypeIds: [], mobilePhone: '555-1234' },
      false,
    ],
    [
      'mobile phone is absent',
      { preferredContactTypeId: sms, preferredContactTypeIds: [], mobilePhone: '' },
      false,
    ],
  ])('%s', (_, personal, expected) => {
    expect(shouldAllowSendingText({ personal })).toBe(expected);
  });

  it('gracefully handles undefined user (loading state)', () => {
    expect(shouldAllowSendingText(undefined)).toBe(false);
    expect(shouldAllowSendingText({})).toBe(false);
  });
});

describe('ActionMenuSendTextMessageButton', () => {
  test('renders the button', () => {
    render(<ActionMenuSendTextMessageButton user={smsUser} handleClick={jest.fn()} />);
    expect(screen.getByText('ui-users.details.sendTextMessage.button')).toBeTruthy();
  });

  test.each([
    ['enabled', smsUser, false],
    [
      'disabled',
      {
        personal: {
          preferredContactTypeId: email,
          preferredContactTypeIds: [],
          mobilePhone: '555-1234',
        },
      },
      true,
    ],
  ])('button is %s based on sms eligibility', (_, user, expectedDisabled) => {
    render(<ActionMenuSendTextMessageButton user={user} handleClick={jest.fn()} />);
    expect(document.querySelector('#clickable-sendsms')).toHaveProperty(
      'disabled',
      expectedDisabled,
    );
  });

  test('calls handleClick when clicked', async () => {
    const handleClick = jest.fn();
    render(<ActionMenuSendTextMessageButton user={smsUser} handleClick={handleClick} />);
    await userEvent.click(document.querySelector('#clickable-sendsms'));
    expect(handleClick).toHaveBeenCalled();
  });

  test('does not render when user lacks the permission', () => {
    IfPermission.mockImplementationOnce(() => null);
    render(<ActionMenuSendTextMessageButton user={smsUser} handleClick={jest.fn()} />);
    expect(screen.queryByText('ui-users.details.sendTextMessage.button')).not.toBeInTheDocument();
  });
});

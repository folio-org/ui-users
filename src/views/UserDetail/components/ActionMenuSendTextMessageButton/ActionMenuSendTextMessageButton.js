import { Button, Icon } from '@folio/stripes/components';
import { IfPermission } from '@folio/stripes/core';
import { useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import { contactTypesMap } from '../../../../components/data/static/contactTypes';

export function shouldAllowSendingText(user) {
  return !!(
    user?.personal &&
    (user.personal.preferredContactTypeId === contactTypesMap.sms.value ||
      user.personal.preferredContactTypeIds?.includes(contactTypesMap.sms.value)) &&
    user.personal.mobilePhone?.length > 0
  );
}

/**
 * ActionMenuSendTextMessageButton
 * Handle display of the "Send text message" button in the Action menu.
 *
 * If the preferred contact type of the user is not "SMS" or there is no phone number, the button will be disabled.
 *
 * @returns component
 */
const ActionMenuSendTextMessageButton = ({ user, handleClick }) => {
  const shouldDisplay = useMemo(() => shouldAllowSendingText(user), [user]);

  return (
    <IfPermission perm="text-notify.message.post">
      <Button
        buttonStyle="dropdownItem"
        disabled={!shouldDisplay}
        data-test-actions-menu-send-sms
        id="clickable-sendsms"
        onClick={handleClick}
      >
        <Icon icon="comment">
          <FormattedMessage id="ui-users.details.sendTextMessage.button" />
        </Icon>
      </Button>
    </IfPermission>
  );
};

export default ActionMenuSendTextMessageButton;

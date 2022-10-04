import {
  FormattedMessage,
} from 'react-intl';

import css from './NoPermissionMessage.css';

const NoPermissionMessage = () => {
  return (
    <div
      data-testid="noPermissionWrapper"
      className={css.wrapper}
    >
      <FormattedMessage id="ui-users.lostItems.message.noAccessToActualCostPage" />
    </div>
  );
};

export default NoPermissionMessage;

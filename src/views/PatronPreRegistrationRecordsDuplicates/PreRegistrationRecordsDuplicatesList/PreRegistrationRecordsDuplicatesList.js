import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { useLocation } from 'react-router';

import {
  Button,
  Layout,
  MultiColumnList,
  NoValue,
  TextLink,
} from '@folio/stripes/components';
import { AppIcon } from '@folio/stripes/core';
import { getFullName } from '@folio/stripes/util';

import css from '../../UserSearch/UserSearch.css';

const getResultsFormatter = ({ onMerge, patronGroups, location }) => {
  const getRowURL = (userId) => {
    return {
      pathname: `/users/view/${userId}`,
      state: {
        referrer: {
          pathname: location.pathname,
          search: location.search,
          state: location.state,
        }
      },
    };
  };

  return {
    action: user => (
      <Layout className="full flex centerContent">
        <Button
          onClick={() => onMerge(user)}
          marginBottom0
        >
          <FormattedMessage id="ui-users.stagingRecords.merge" />
        </Button>
      </Layout>
    ),
    active: user => {
      return user.active
        ? <FormattedMessage id="ui-users.active" />
        : <FormattedMessage id="ui-users.inactive" />;
    },
    name: user => (
      <>
        <AppIcon
          app="users"
          size="small"
          className={user.active ? undefined : css.inactiveAppIcon}
        />
        &nbsp;
        <TextLink to={getRowURL(user.id)}>{getFullName(user)}</TextLink>
      </>
    ),
    barcode: user => user.barcode || <NoValue />,
    patronGroup: (user) => patronGroups.find(g => g.id === user.patronGroup)?.group || '?',
    username: user => user.username || <NoValue />,
    email: user => user?.personal?.email || <NoValue />,
  };
};

const COLUMN_MAPPING = {
  action: <FormattedMessage id="ui-users.action" />,
  name: <FormattedMessage id="ui-users.information.name" />,
  active: <FormattedMessage id="ui-users.active" />,
  barcode: <FormattedMessage id="ui-users.information.barcode" />,
  patronGroup: <FormattedMessage id="ui-users.information.patronGroup" />,
  username: <FormattedMessage id="ui-users.information.username" />,
  email: <FormattedMessage id="ui-users.contact.email" />,
};

const VISIBLE_COLUMNS = Object.keys(COLUMN_MAPPING);

const PreRegistrationRecordsDuplicatesList = ({
  isLoading,
  onMerge,
  patronGroups,
  totalRecords,
  users,
}) => {
  const location = useLocation();

  return (
    <MultiColumnList
      id="patron-user-duplicates-list"
      virtualize
      isLoading={isLoading}
      columnMapping={COLUMN_MAPPING}
      contentData={users}
      formatter={getResultsFormatter({ onMerge, patronGroups, location })}
      totalCount={totalRecords}
      visibleColumns={VISIBLE_COLUMNS}
      interactive={false}
    />
  );
};

PreRegistrationRecordsDuplicatesList.propTypes = {
  isLoading: PropTypes.bool,
  onMerge: PropTypes.func.isRequired,
  patronGroups: PropTypes.arrayOf(PropTypes.object),
  totalRecords: PropTypes.number,
  users: PropTypes.arrayOf(PropTypes.object),
};

export default PreRegistrationRecordsDuplicatesList;

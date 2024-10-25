import PropTypes from 'prop-types';
import {
  memo,
  useMemo,
} from 'react';
import { FormattedMessage } from 'react-intl';
import { useLocation } from 'react-router';

import {
  Button,
  Layout,
  MultiColumnList,
  NoValue,
  TextLink,
} from '@folio/stripes/components';
import {
  AppIcon,
  useStripes,
} from '@folio/stripes/core';

import { getFullName } from '../../../utils';
import css from '../../UserSearch/UserSearch.css';

const getResultsFormatter = ({ onMerge, patronGroups, location, isLoading }) => {
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
          disabled={isLoading}
          marginBottom0
        >
          <FormattedMessage id="ui-users.stagingRecords.merge" />
        </Button>
      </Layout>
    ),
    status: user => {
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
  status: <FormattedMessage id="ui-users.status" />,
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
  const stripes = useStripes();

  const visibleColumns = useMemo(() => {
    return stripes.hasPerm('ui-users.patron-pre-registrations.execute') ? VISIBLE_COLUMNS : VISIBLE_COLUMNS.filter(column => column !== 'action');
  }, [stripes]);

  return (
    <MultiColumnList
      id="patron-user-duplicates-list"
      autosize
      virtualize
      loading={isLoading}
      columnMapping={COLUMN_MAPPING}
      contentData={users}
      formatter={getResultsFormatter({ onMerge, patronGroups, location, isLoading })}
      totalCount={totalRecords}
      visibleColumns={visibleColumns}
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

export default memo(PreRegistrationRecordsDuplicatesList);

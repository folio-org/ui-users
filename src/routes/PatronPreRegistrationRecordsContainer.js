import PropTypes from 'prop-types';
import { useHistory } from 'react-router-dom';
import { get, template } from 'lodash';

import { stripesConnect } from '@folio/stripes/core';
import {
  makeQueryFunction,
  StripesConnectedSource,
} from '@folio/stripes/smart-components';

import PatronsPreRegistrationListContainer from '../views/PatronsPreRegistrationListContainer/PatronsPreRegistrationListContainer';
import { PATRON_PREREGISTRATION_RECORDS_NAME, PATRON_PREREGISTRATIONS_API } from '../constants';
import NoPermissionMessage from '../components/NoPermissionMessage';

const RESULT_COUNT_INCREMENT = 100;
const PAGE_AMOUNT = 100;

const PatronPreRegistrationRecordsContainer = (props) => {
  const {
    resources,
    mutator,
    stripes,
  } = props;
  const history = useHistory();
  const source = new StripesConnectedSource({ resources, mutator }, stripes.logger, PATRON_PREREGISTRATION_RECORDS_NAME);
  const data = get(resources, `${PATRON_PREREGISTRATION_RECORDS_NAME}.records`, []);

  const queryGetter = () => {
    return get(resources, 'query', {});
  };

  const onNeedMoreData = (askAmount, index) => {
    const { resultOffset } = mutator;

    if (source) {
      if (resultOffset && index >= 0) {
        source.fetchOffset(index);
      } else {
        source.fetchMore(RESULT_COUNT_INCREMENT);
      }
    }
  };

  const onClose = () => {
    history.push('/users?sort=name');
  };

  if (source) {
    source.update(props, PATRON_PREREGISTRATION_RECORDS_NAME);
  }

  const hasPermission = props.stripes.hasPerm('ui-users.patron-pre-registrations.view');

  if (!hasPermission) {
    return (
      <NoPermissionMessage id="ui-users.stagingRecords.message.noAccessToStagingRecordsPage" />
    );
  }

  return (
    <PatronsPreRegistrationListContainer
      onClose={onClose}
      queryGetter={queryGetter}
      onNeedMoreData={onNeedMoreData}
      source={source}
      data={data}
      stripes={stripes}
    />
  );
};

PatronPreRegistrationRecordsContainer.manifest = {
  query: { initialValue: {} },
  resultCount: { initialValue: 0 },
  resultOffset: { initialValue: 0 },
  [PATRON_PREREGISTRATION_RECORDS_NAME]: {
    type: 'okapi',
    records: 'staging_users',
    resultOffset: '%{resultOffset}',
    resultDensity: 'sparse',
    perRequest: PAGE_AMOUNT,
    path: PATRON_PREREGISTRATIONS_API,
    GET: {
      params: {
        query: makeQueryFunction(
          'cql.allRecords=1',
          (parsedQuery, _, localProps) => localProps.query.query.trim().replace('*', '').split(/\s+/)
            .map(query => template('keywords="%{query}*"', { interpolate: /%{([\s\S]+?)}/g })({ query }))
            .join(' and ')
            .concat(' AND status == "TIER-2"'),
          {
            'name': 'generalInfo.lastName generalInfo.preferredFirstName generalInfo.firstName generalInfo.middleName',
            'email': 'contactInfo.email'
          },
          '',
          2
        ),
      },
      staticFallback: { params: {} },
    },
  }
};

PatronPreRegistrationRecordsContainer.propTypes = {
  mutator: PropTypes.object,
  stripes: PropTypes.object,
  resources: PropTypes.object,
};

export default stripesConnect(PatronPreRegistrationRecordsContainer);


import PropTypes from 'prop-types';
import { useHistory } from 'react-router-dom';

import { stripesConnect } from '@folio/stripes/core';

import PatronNoticePrintJobs from '../views/PatronNoticePrintJobs';

const PatronNoticePrintJobsContainer = (props) => {
  const { mutator, resources } = props;
  const records = resources?.entries?.records;
  const history = useHistory();

  const onClose = () => {
    const { location } = props;
    if (location.state) {
      history.goBack();
    } else {
      history.push('/users?sort=name');
    }
  };

  return (
    <PatronNoticePrintJobs
      records={records}
      mutator={mutator}
      onClose={onClose}
    />
  );
};

PatronNoticePrintJobsContainer.manifest = {
  entries: {
    type: 'okapi',
    path: 'print/entries',
    params: {
      query: 'type="BATCH"',
      sortby: 'created/sort.descending'
    },
    records: 'items',
    throwErrors: false,
  },
  printingJob: {
    type: 'okapi',
    path: 'print/entries',
    accumulate: 'true',
    fetch: false,
    throwErrors: false,
  },
};

PatronNoticePrintJobsContainer.propTypes = {
  resources: PropTypes.shape({
    entries: PropTypes.shape({
      records: PropTypes.arrayOf(PropTypes.object),
    }),
  }).isRequired,
  mutator: PropTypes.shape({
    printingJob: PropTypes.shape({
      GET: PropTypes.func,
      reset: PropTypes.func,
    }),
  }).isRequired,
  location: PropTypes.object,
};

export default stripesConnect(PatronNoticePrintJobsContainer);

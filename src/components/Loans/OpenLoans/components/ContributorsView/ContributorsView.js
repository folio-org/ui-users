import React from 'react';
import PropTypes from 'prop-types';

import { Popover } from '@folio/stripes/components';

const propTypes = {
  contributorsList: PropTypes.arrayOf(PropTypes.string).isRequired
};

const ContributorsView = (props) => {
  const { contributorsList } = props;
  // eslint-disable-next-line react/no-this-in-sfc
  const contributorsListString = contributorsList.join(' ');
  // Truncate if no of contributors > 2
  const listTodisplay = (contributorsList === '-')
    ? '-'
    : (contributorsList.length > 2)
      ? `${contributorsList[0]}, ${contributorsList[1]}...`
      : `${contributorsListString.substring(0, contributorsListString.length - 2)}`;

  return (contributorsList.length > 2)
    ? (
      <Popover>
        <div
          data-role="target"
          style={{ cursor: 'pointer' }}
        >
          {listTodisplay}
        </div>
        <div data-role="popover">
          {
            contributorsList.map(contributor => <p key={contributor}>{contributor}</p>)
          }
        </div>
      </Popover>
    )
    : (
      <div>
        {listTodisplay}
      </div>
    );
};

ContributorsView.propTypes = propTypes;

export default ContributorsView;

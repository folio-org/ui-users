import React from 'react';
import PropTypes from 'prop-types';
import { isEmpty } from 'lodash';

import { Popover } from '@folio/stripes/components';

import getListPresentation from '../../helpers/getListPresentation';

const propTypes = {
  contributorsList: PropTypes.arrayOf(PropTypes.string).isRequired
};

const ContributorsView = (props) => {
  const { contributorsList } = props;
  // eslint-disable-next-line react/no-this-in-sfc
  const contributorsListString = contributorsList.join(' ');
  // Truncate if no of contributors > 2
  const listTodisplay = isEmpty(contributorsList)
    ? '-'
    : getListPresentation(contributorsList, contributorsListString);

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

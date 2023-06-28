import React from 'react';
import PropTypes from 'prop-types';
import { isEmpty } from 'lodash';

import { Popover } from '@folio/stripes/components';

import getListPresentation from '../../helpers/getListPresentation';

import css from './ContributorsView.css';

const propTypes = {
  contributorsList: PropTypes.arrayOf(PropTypes.string).isRequired
};

const ContributorsView = (props) => {
  const { contributorsList } = props;
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
          className={css.pointer}
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

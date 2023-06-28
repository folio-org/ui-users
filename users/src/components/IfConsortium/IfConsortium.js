import PropTypes from 'prop-types';

import {
  IfInterface,
  useStripes,
} from '@folio/stripes/core';

const IfConsortium = ({ children }) => {
  const stripes = useStripes();
  const consortiumId = stripes?.user?.user?.consortium?.id;

  return (
    <IfInterface name="consortia">
      {consortiumId && children}
    </IfInterface>
  );
};

IfConsortium.propTypes = {
  children: PropTypes.node,
};

export default IfConsortium;

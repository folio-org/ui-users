import React from 'react';
import PropTypes from 'prop-types';

import usePrintData from '../../../../../hooks/usePrintData';
import PrintContent from './PrintContent';


const PrintToPDFWrapper = ({
  children,
  entities = [],
  type,
  patronGroup = {}
}) => {
  const { templateFn, dataSource, reactToPrintFn, handleRef } = usePrintData(entities, type, patronGroup);


  return (
    <>
      {children(reactToPrintFn)}
      <PrintContent
        printContentTestId="printContentTestId"
        dataSource={dataSource}
        templateFn={templateFn}
        contentRef={handleRef}
      />
    </>
  );
};

PrintToPDFWrapper.propTypes = {
  children: PropTypes.func.isRequired,
  entities: PropTypes.arrayOf(PropTypes.shape({})),
  type: PropTypes.string,
  patronGroup: PropTypes.shape({}),
};

export default PrintToPDFWrapper;

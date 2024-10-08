import React from 'react';
import PropTypes from 'prop-types';

import usePrintData from '../../../../../hooks/usePrintData';
import PrintContent from './PrintContent';


const PrintToPDFWrapper = ({
  children,
  entities = [],
  type,
}) => {
  const { templateFn, dataSource, reactToPrintFn, handleRef } = usePrintData(entities, type);


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
  entities: PropTypes.arrayOf(PropTypes.object),
  type: PropTypes.string,
};

export default PrintToPDFWrapper;

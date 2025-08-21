import React from 'react';
import PropTypes from 'prop-types';

import PrintTemplate from './PrintTemplate';


const PrintContent = ({
  dataSource,
  templateFn,
  contentRef,
}) => {
  return (
    <div style={{ display: 'none' }}>
      <div ref={contentRef}>
        {dataSource.map((source, index) => (
          <div
            key={index}
            style={{ pageBreakAfter: 'always' }}
          >
            <PrintTemplate
              dataSource={source}
              templateFn={templateFn}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

PrintContent.propTypes = {
  dataSource: PropTypes.shape({}),
  templateFn: PropTypes.func,
  contentRef: PropTypes.func,
};

export default PrintContent;

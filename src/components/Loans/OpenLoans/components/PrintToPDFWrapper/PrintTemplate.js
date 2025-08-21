import React from 'react';
import Barcode from 'react-barcode';
import PropTypes from 'prop-types';
import HtmlToReact, { Parser } from 'html-to-react';
import DOMPurify from 'dompurify';

const processNodeDefinitions = new HtmlToReact.ProcessNodeDefinitions(React);
const rules = [
  {
    replaceChildren: true,
    shouldProcessNode: node => node.name === 'barcode',
    processNode: (_, children) => (<Barcode value={children[0] ? children[0].trim() : ' '} />),
  },
  {
    shouldProcessNode: () => true,
    processNode: processNodeDefinitions.processDefaultNode,
  }
];

const parser = new Parser();

const PrintTemplate = ({ dataSource, templateFn }) => {
  const componentStr = DOMPurify.sanitize(templateFn(dataSource), { ADD_TAGS: ['Barcode'] });
  const Component = parser.parseWithInstructions(componentStr, () => true, rules) || null;

  return Component;
};

PrintTemplate.propTypes = {
  dataSource: PropTypes.shape({}),
  templateFn: PropTypes.func,
};

export default PrintTemplate;

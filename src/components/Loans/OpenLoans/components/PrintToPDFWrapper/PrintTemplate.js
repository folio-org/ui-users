import PropTypes from 'prop-types';
import { Parser } from 'html-to-react';
import { sanitize } from 'dompurify';


const parser = new Parser();

const PrintTemplate = ({ dataSource, templateFn }) => {
  const componentStr = sanitize(templateFn(dataSource));

  return parser.parse(componentStr) || null;
};

PrintTemplate.propTypes = {
  dataSource: PropTypes.object,
  templateFn: PropTypes.func,
};

export default PrintTemplate;

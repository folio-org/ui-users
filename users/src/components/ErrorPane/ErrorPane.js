import PropTypes from 'prop-types';

import {
  Pane,
  Layout,
} from '@folio/stripes/components';

const ErrorPane = ({ children, ...props }) => (
  <Pane defaultWidth="fill" {...props}>
    <Layout element="p" className="textCentered">
      {children}
    </Layout>
  </Pane>
);

ErrorPane.propTypes = {
  children: PropTypes.node,
};

export default ErrorPane;

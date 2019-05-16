import React from 'react';
import { Pane, Paneset, Layout } from '@folio/stripes/components';
import Loading from './Loading';

const ViewLoading = ({ inPaneset, ...rest }) => {
  const spinnerStyle = { maxWidth: '15rem', height: '8rem' };
  if (inPaneset) {
    return (
      <Paneset>
        <Pane {...rest}>
          <Layout className="centered full" style={spinnerStyle}>
            &nbsp;
            <Loading />
          </Layout>
        </Pane>
      </Paneset>
    );
  }

  return (
    <Pane {...rest}>
      <Layout className="centered full" style={spinnerStyle}>
        &nbsp;
        <Loading />
      </Layout>
    </Pane>
  );
};

export default ViewLoading;

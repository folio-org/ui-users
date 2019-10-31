import React from 'react';
import { Pane, Paneset, Layout } from '@folio/stripes/components';
import Loading from './Loading';

const ViewLoading = (props) => {
  const spinnerStyle = { maxWidth: '15rem', height: '8rem' };
  return (
    <Paneset>
      <Pane {...props}>
        <Layout className="centered full" style={spinnerStyle}>
          &nbsp;
          <Loading />
        </Layout>
      </Pane>
    </Paneset>
  );
};

export default ViewLoading;

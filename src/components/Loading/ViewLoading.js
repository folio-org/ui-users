import React from 'react';
import { Pane, Paneset, Layout } from '@folio/stripes/components';
import Loading from './Loading';
import css from './DotSpinner.css';

const ViewLoading = (props) => {
  return (
    <Paneset>
      <Pane {...props}>
        <Layout className={`centered full ${css.spinnerStyle}`}>
          &nbsp;
          <Loading />
        </Layout>
      </Pane>
    </Paneset>
  );
};

export default ViewLoading;

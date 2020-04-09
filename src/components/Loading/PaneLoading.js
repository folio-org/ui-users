import React from 'react';
import { Pane, Layout } from '@folio/stripes/components';
import Loading from './Loading';
import css from './DotSpinner.css';

const PaneLoading = (props) => {

  return (
    <Pane {...props}>
      <Layout className="centered full" className={css.spinnerStyle}>
        &nbsp;
        <Loading />
      </Layout>
    </Pane>
  );
};

export default PaneLoading;

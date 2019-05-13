import React from 'react';
import { Pane, Paneset } from '@folio/stripes/components';
import Loading from './Loading';

const ViewLoading = ({ inPaneset, ...rest }) => {
  if (inPaneset) {
    return (
      <Paneset>
        <Pane {...rest}>
          <Loading />
        </Pane>
      </Paneset>
    );
  }

  return (
    <Pane {...rest}>
      <Loading />
    </Pane>
  );
};

export default ViewLoading;

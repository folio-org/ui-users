import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import { stripesConnect } from '@folio/stripes/core';
import { Callout, Pane } from '@folio/stripes/components';
import SafeHTMLMessage from '@folio/react-intl-safe-html';

import LimitsForm from './LimitsForm';
import { capitilizeLabel } from './utils';
//import css from './conditions.css';

class Limits extends Component {
  static manifest = Object.freeze({
    patronBlockCondition: {
      type: 'okapi',
      records: 'patronBlockConditions',
      GET: {
        path: 'patron-block-conditions',
      },
      params: {
        query: 'cql.allRecords=1 sortby name',
      },
    },
    groups: {
      type: 'okapi',
      records: 'usergroups',
      GET: {
        path: 'groups',
      },
    },
  });

  shouldRenderCondition = () => {
    return !!this.props?.resources?.patronBlockCondition?.records.length;
  }

  getInitialValues = () => {

  }

  getPatronBlockConditions = () => {
    const conditions = [];
    const patronBlockConditions = this.props?.resources?.patronBlockCondition?.records ?? [];

    patronBlockConditions.forEach(({ name }) => conditions.push(name));

    return conditions;
  }

  onSubmit = (value) => {
    console.log(value);
  }

  render() {
    const { patronGroup } = this.props;
    console.log(this.getPatronBlockConditions());
    
    if (!this.shouldRenderCondition()) {
      return null;
    }

    return (
      // <section>
      //   <div>
      //     <LimitsForm
      //       label="name"
      //       initialValues={() => {}}
      //       onSubmit={() => {}}
      //     />
      //     <Callout ref={(ref) => { this.callout = ref; }} />
      //   </div>
      // </section>
      <Pane
        defaultWidth="30%"
        paneTitle={patronGroup}
      >
        <LimitsForm
          initialValues={this.getInitialValues()}
          onSubmit={this.onSubmit}
          patronBlockConditions={this.getPatronBlockConditions()}
        />

        <Callout ref={(ref) => { this.callout = ref; }} />
      </Pane>
    );
  }
}

export default stripesConnect(Limits);

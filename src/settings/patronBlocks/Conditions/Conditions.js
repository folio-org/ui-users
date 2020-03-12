import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import {
  stripesConnect,
} from '@folio/stripes/core';
import { Callout } from '@folio/stripes/components';
import SafeHTMLMessage from '@folio/react-intl-safe-html';

import ConditionsForm from './ConditionsForm';

import css from './conditions.css';

class Conditions extends Component {
  static manifest = Object.freeze({
    patronBlockCondition: {
      type: 'okapi',
      records: 'patronBlockConditions',
      GET: {
        path: 'patron-block-conditions',
      },
      PUT: {
        path: 'patron-block-conditions/!{id}',
      },
    },
  });

  static propTypes = {
    id: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired,
    mutator: PropTypes.shape({
      patronBlockCondition: PropTypes.shape({
        PUT: PropTypes.func,
      }),
    }),
  };

  getInitialValues = () => {
    const {
      id : conditionsId,
    } = this.props;
    const currentConditions = this.props?.resources?.patronBlockCondition?.records
      .filter(({ id }) => id === conditionsId)[0];

    return currentConditions;
  }

  normalize = (value) => {
    return {
      ...this.getInitialValues(),
      ...value,
      message: value.message || '',
    };
  }

  onSubmit = (value) => {
    return this.props.mutator.patronBlockCondition.PUT({
      ...this.normalize(value),
    }).then(() => {
      if (this.callout) {
        this.callout.sendCallout({
          message: <SafeHTMLMessage
            id="ui-users.settings.callout.message"
            values={{
              name: value.name,
            }}
          />
        });
      }
    });
  }


  shouldRenderCondition = () => {
    return !!this.props?.resources?.patronBlockCondition?.records.length;
  }

  render() {
    if (!this.shouldRenderCondition()) {
      return null;
    }

    const {
      children,
    } = this.props;
    const {
      name,
    } = this.getInitialValues();

    return (
      <section className={css.conditionsWrapper}>
        <div style={{ width: '100%' }}>
          <ConditionsForm
            onSubmit={this.onSubmit}
            initialValues={this.getInitialValues()}
            label={name}
          >
            {children}
          </ConditionsForm>
          <Callout ref={(ref) => { this.callout = ref; }} />
        </div>
      </section>
    );
  }
}

export default stripesConnect(Conditions);

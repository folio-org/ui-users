import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { stripesConnect } from '@folio/stripes/core';
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
    mutator: PropTypes.shape({
      patronBlockCondition: PropTypes.shape({
        PUT: PropTypes.func.isRequired,
      }).isRequired,
    }).isRequired,
  };

  callout = React.createRef();

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
        this.callout.current.sendCallout({
          message: <SafeHTMLMessage
            id="ui-users.settings.callout.message"
            values={{ name: value.name }}
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
      name,
    } = this.getInitialValues();

    return (
      <section className={css.conditionsWrapperHolder}>
        <div className={css.conditionsWrapper}>
          <ConditionsForm
            label={name}
            initialValues={this.getInitialValues()}
            onSubmit={this.onSubmit}
          />
          <Callout ref={this.callout} />
        </div>
      </section>
    );
  }
}

export default stripesConnect(Conditions);

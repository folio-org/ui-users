import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl } from 'react-intl';

import { stripesConnect, TitleManager } from '@folio/stripes/core';
import { Callout } from '@folio/stripes/components';

import ConditionsForm from './ConditionsForm';
import css from '../patronBlocks.css';

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
    resources: PropTypes.shape({
      patronBlockCondition: PropTypes.shape({})
    }),
    id: PropTypes.string.isRequired,
    mutator: PropTypes.shape({
      patronBlockCondition: PropTypes.shape({
        PUT: PropTypes.func.isRequired,
      }).isRequired,
    }).isRequired,
    stripes: PropTypes.shape({
      hasPerm: PropTypes.func.isRequired
    }).isRequired,
    intl: PropTypes.shape({}),
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
          message: <FormattedMessage
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
    const { stripes, intl: { formatMessage } } = this.props;
    const areConditionsEditable = stripes.hasPerm('ui-users.settings.conditions.edit');

    if (!this.shouldRenderCondition()) {
      return null;
    }

    const {
      name,
    } = this.getInitialValues();
    return (
      <TitleManager
        prefix={`${formatMessage({ id: 'ui-users.settings.users.title' })} - `}
        page={formatMessage({ id: 'ui-users.settings.conditions' })}
        record={name}
      >
        <section className={css.partonBlockWrapperHolder}>
          <div
            data-test-conditions-wrapper
            className={css.partonBlockWrapper}
          >
            <ConditionsForm
              label={name}
              initialValues={this.getInitialValues()}
              onSubmit={this.onSubmit}
              areConditionsEditable={areConditionsEditable}
            />
            <Callout ref={this.callout} />
          </div>
        </section>
      </TitleManager>
    );
  }
}

export default injectIntl(stripesConnect(Conditions));

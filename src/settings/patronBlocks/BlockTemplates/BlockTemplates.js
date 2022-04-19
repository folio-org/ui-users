import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl } from 'react-intl';

import { EntryManager } from '@folio/stripes/smart-components';
import { stripesConnect } from '@folio/stripes/core';

import BlockTemplateDetails from './BlockTemplateDetails';
import BlockTemplateForm from './BlockTemplateForm';

function validate(values) {
  const errors = {};
  if (!values.name) {
    errors.displayName = (
      <FormattedMessage id="ui-users.permissions.emptyField" />
    );
  }
  return errors;
}

function BlockTemplates(props) {
  const {
    intl: { formatMessage },
    mutator,
    resources: { manualBlockTemplates },
  } = props;

  return (
    <EntryManager
      {...props}
      parentMutator={mutator}
      entryList={_.sortBy((manualBlockTemplates || {}).records || [], [
        'name',
      ])}
      resourceKey="manualBlockTemplates"
      detailComponent={BlockTemplateDetails}
      paneTitle={
        <FormattedMessage id="ui-users.settings.manualBlockTemplates.paneTitle" />
      }
      entryLabel={formatMessage({ id: 'ui-users.manualBlockTemplate' })}
      entryFormComponent={BlockTemplateForm}
      validate={validate}
      nameKey="name"
      permissions={{
        put: 'manual-block-templates.item.put',
        post: 'manual-block-templates.item.post',
        delete: 'manual-block-templates.item.delete',
      }}
    />
  );
}

BlockTemplates.manifest = Object.freeze({
  manualBlockTemplates: {
    type: 'okapi',
    records: 'manualBlockTemplates',
    path: 'manual-block-templates',
    GET: {
      params: {
        limit: '200',
      },
    }
  },
});

BlockTemplates.propTypes = {
  intl: PropTypes.object,
  resources: PropTypes.shape({
    manualBlockTemplates: PropTypes.shape({
      records: PropTypes.arrayOf(PropTypes.object),
    }),
  }),
  mutator: PropTypes.shape({
    manualBlockTemplates: PropTypes.shape({
      POST: PropTypes.func,
      PUT: PropTypes.func,
      DELETE: PropTypes.func,
    }).isRequired,
  }).isRequired,
};

export default injectIntl(stripesConnect(BlockTemplates));

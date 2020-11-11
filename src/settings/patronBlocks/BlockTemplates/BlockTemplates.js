import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

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
    mutator,
    resources: { manualBlockTemplates },
  } = props;

  return (
    <FormattedMessage id="ui-users.manualBlockTemplate">
      {(entryLabel) => (
        <EntryManager
          {...props}
          parentMutator={mutator}
          entryList={_.sortBy((manualBlockTemplates || {}).records || [], [
            'name',
          ])}
          resourceKey="manualBlockTemplates"
          detailComponent={BlockTemplateDetails}
          paneTitle={
            <FormattedMessage id="ui-users.settings.manualBlockTemplates" />
          }
          entryLabel={entryLabel}
          entryFormComponent={BlockTemplateForm}
          validate={validate}
          nameKey="name"
          permissions={{
            put: 'manual-block-templates.item.put',
            post: 'manual-block-templates.item.post',
            delete: 'manual-block-templates.item.delete',
          }}
        />
      )}
    </FormattedMessage>
  );
}

BlockTemplates.manifest = Object.freeze({
  manualBlockTemplates: {
    type: 'okapi',
    records: 'manualBlockTemplates',
    GET: {
      path: 'manual-block-templates',
    },
    POST: {
      path: 'manual-block-templates',
    },
    PUT: {
      path: 'manual-block-templates',
    },
    DELETE: {
      path: 'manual-block-templates',
    },
  },
});

BlockTemplates.propTypes = {
  resources: PropTypes.shape({
    manualBlockTemplates: PropTypes.shape({
      records: PropTypes.arrayOf(PropTypes.object),
    }),
  }),
  id: PropTypes.string.isRequired,
  mutator: PropTypes.shape({
    manualBlockTemplates: PropTypes.shape({
      POST: PropTypes.func,
      PUT: PropTypes.func,
      DELETE: PropTypes.func,
    }).isRequired,
  }).isRequired,
};

export default stripesConnect(BlockTemplates);

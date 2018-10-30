import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { Callout } from '@folio/stripes/components';

import CommentRequiredForm from './CommentRequiredForm';

class CommentRequiredSettings extends React.Component {
  static manifest = Object.freeze({
    recordId: {},
    commentRequired: {
      type: 'okapi',
      records: 'comments',
      path: 'comments',
      POST: {
        path: 'comments',
      },
      PUT: {
        path: 'comments/%{recordId}',
      },
    },
  });

  static propTypes = {
    resources: PropTypes.object,
    stripes: PropTypes.object,
    mutator: PropTypes.shape({
      recordId: PropTypes.shape({
        replace: PropTypes.func,
      }),
      commentRequired: PropTypes.shape({
        POST: PropTypes.func,
        PUT: PropTypes.func,
      }),
    }),
  };

  onSave = (values) => {
    const settings = _.get(this.props.resources, ['commentRequired', 'records', 0], {});
    delete settings.metadata;
    settings.paid = values.paid;
    settings.waived = values.waived;
    settings.transferredManually = values.transferredManually;
    settings.refunded = values.refunded;

    if (!settings.id) {
      this.props.mutator.commentRequired.POST(settings)
        .then(() => { this.callout.sendCallout({ message: this.props.stripes.intl.formatMessage({ id: 'ui-users.comment.message' }) }); });
    } else {
      this.props.mutator.recordId.replace(settings.id);
      this.props.mutator.commentRequired.PUT(settings)
        .then(() => { this.callout.sendCallout({ message: this.props.stripes.intl.formatMessage({ id: 'ui-users.comment.message' }) }); });
    }
  }

  render() {
    const settings = _.get(this.props.resources, ['commentRequired', 'records', 0], {});
    const initialValues = {
      paid: (settings.paid ? 'true' : 'false'),
      waived: (settings.waived ? 'true' : 'false'),
      refunded: (settings.refunded ? 'true' : 'false'),
      transferredManually: (settings.transferredManually ? 'true' : 'false'),
    };

    return (
      <div style={{ width: '100%' }}>
        <CommentRequiredForm
          {...this.props}
          initialValues={initialValues}
          onSubmit={(values) => { this.onSave(values); }}
        />
        <Callout ref={(ref) => { this.callout = ref; }} />
      </div>
    );
  }
}
export default CommentRequiredSettings;

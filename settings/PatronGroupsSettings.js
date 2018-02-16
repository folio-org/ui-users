/* eslint-disable react/prop-types */
import React from 'react';
import _ from 'lodash';
import { graphql, compose } from 'react-apollo';
import gql from 'graphql-tag';
import { Col } from 'react-flexbox-grid';

import Paneset from '@folio/stripes-components/lib/Paneset';
import ConfirmationModal from '@folio/stripes-components/lib/structures/ConfirmationModal';
import Pane from '@folio/stripes-components/lib/Pane';
import EditableList from '@folio/stripes-components/lib/structures/EditableList';
import Callout from '@folio/stripes-components/lib/Callout';

const UpdatedWrapper = props => <Col key={props.gloss} xs>{props.item.updated}</Col>;

const PatronGroupFragment = gql`
  fragment GroupFragment on Group {
    id
    group
    desc
    metadata {
      updatedDate
      updatedByUser {
        personal {
          firstName
          lastName
        }
      }
    }
  }
`;

const PatronGroups = gql`
  query {
    groups {
      ...GroupFragment
    }
  }
  ${PatronGroupFragment}
`;

const createGroup = gql`
  mutation createGroup($record: GroupInput!) {
    createGroup(record: $record) {
      ...GroupFragment
    }
  }
  ${PatronGroupFragment}
`;

const updateGroup = gql`
  mutation updateGroup($id: ID!, $record: GroupInput!) {
    updateGroup(id: $id, record: $record) {
      ...GroupFragment
    }
  }
  ${PatronGroupFragment}
`;

const deleteGroup = gql`
  mutation deleteGroup($id: ID!) {
    deleteGroup(id: $id)
  }
`;

class PatronGroupsSettings extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      confirming: false,
      type: {},
    };
  }

  parseUpdated = (group) => {
    const md = group.metadata;
    const usr = md.updatedByUser;
    const dateOptions = { year: 'numeric', month: 'numeric', day: 'numeric' };
    const date = md.updatedDate ? new Date(Date.parse(md.updatedDate)).toLocaleString(this.props.stripes.locale, dateOptions) : '';
    const last = usr.personal.lastName || '';
    const first = usr.personal.firstName || '';
    const maybeComma = first ? ', ' : '';
    return `${date} by ${last + maybeComma + first}`;
  }

  handleCreate = record => this.props.createGroup({ variables: { record: { group: record.group, desc: record.desc } } });

  handleUpdate = (record) => {
    const changed = _.pick(record, ['group', 'desc']);
    return this.props.updateGroup({ variables: { id: record.id, record: changed } });
  }

  handleDelete = id => this.props.deleteGroup({ variables: { id } });

  hideConfirm() {
    this.setState({
      confirming: false,
      type: {},
    });
  }

  onDeleteType() {
    console.log('ui-items - settings - onDeleteType called');
    const type = this.state.type;
    this.props.mutator.activeRecord.update({ id: type.id });
    // TODO: remove when back end PUT requests ignore read only properties
    // https://issues.folio.org/browse/RMB-92
    // eslint-disable-next-line no-param-reassign
    delete this.state.type.metadata;
    return this.props.mutator.groups.DELETE(type)
      .then(() => this.deletePatronResolve())
      .then(() => this.showCalloutMessage(type))
      .catch(() => this.deletePatronReject())
      .finally(() => this.hideConfirm());
  }

  showConfirm(typeId) {
    const type = this.props.data.groups.find(t => t.id === typeId);
    this.setState({
      confirming: true,
      type,
    });

    this.deletePatronPromise = new Promise((resolve, reject) => {
      this.deletePatronResolve = resolve;
      this.deletePatronReject = reject;
    });
    return this.deletePatronPromise;
  }


  render() {
    if (this.props.data.loading || !Array.isArray(this.props.data.groups)) return <div />;
    const listContent = this.props.data.groups.map(group => ({
      id: group.id,
      group: group.group,
      desc: group.desc,
      updated: this.parseUpdated(group),
    }));
    const modalHeading = 'Delete patron group?';
    const modalMessage = <span>The patron group <strong>{this.state.type.group}</strong> will be <strong>deleted</strong></span>;
    const confirmLabel = 'Delete';
    return (
      <Paneset>
        <Pane defaultWidth="fill" fluidContentWidth paneTitle="Patron Groups">
          <EditableList
            contentData={listContent}
            createButtonLabel="+ Add new"
            visibleFields={['group', 'desc']}
            itemTemplate={{ group: 'string', id: 'string', desc: 'string' }}
            actionSuppression={{ delete: () => true, edit: () => false }}
            additionalFields={{ updated: { gloss: 'Last updated', component: UpdatedWrapper } }}
            onUpdate={this.handleUpdate}
            onCreate={this.handleCreate}
            onDelete={this.showConfirm}
            isEmptyMessage="There are no patron groups"
            label="Patron Groups"
            nameKey="group"
          />
          <ConfirmationModal
            open={this.state.confirming}
            heading={modalHeading}
            message={modalMessage}
            onConfirm={this.handleDelete}
            onCancel={this.hideConfirm}
            confirmLabel={confirmLabel}
          />
          <Callout ref={(ref) => { this.callout = ref; }} />
        </Pane>
      </Paneset>
    );
  }
}

export default compose(
  graphql(PatronGroups),
  graphql(createGroup, { name: 'createGroup' }),
  graphql(updateGroup, { name: 'updateGroup' }),
  graphql(deleteGroup, { name: 'deleteGroup' }),
)(PatronGroupsSettings);

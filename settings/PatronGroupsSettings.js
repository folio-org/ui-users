/* eslint-disable react/prop-types */
import React from 'react';
import _ from 'lodash';
import { graphql, compose } from 'react-apollo';
import gql from 'graphql-tag';
import { Col } from 'react-flexbox-grid';

import Paneset from '@folio/stripes-components/lib/Paneset';
import Pane from '@folio/stripes-components/lib/Pane';
import EditableList from '@folio/stripes-components/lib/structures/EditableList';

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

  handleCreate = (record) => {
    return this.props.createGroup({ variables: { record: { group: record.group, desc: record.desc } } });
  }

  handleUpdate = (record) => {
    const changed = _.pick(record, ['group', 'desc']);
    return this.props.updateGroup({ variables: { id: record.id, record: changed } });
  }

  handleDelete = (id) => {
    return this.props.deleteGroup({ variables: { id } });
  }

  render() {
    if (this.props.data.loading || !Array.isArray(this.props.data.groups)) return <div />;
    const listContent = this.props.data.groups.map(group => ({
      id: group.id,
      group: group.group,
      desc: group.desc,
      updated: this.parseUpdated(group),
    }));
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
            onDelete={this.handleDelete}
            isEmptyMessage="There are no patron groups"
            label="Patron Groups"
            nameKey="group"
          />
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

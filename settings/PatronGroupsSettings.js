import React from 'react';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Col } from 'react-flexbox-grid';

import Paneset from '@folio/stripes-components/lib/Paneset';
import Pane from '@folio/stripes-components/lib/Pane';
import EditableList from '@folio/stripes-components/lib/structures/EditableList';

const UpdatedWrapper = props => <Col key={props.gloss} xs>{props.item.updated}</Col>;

const PatronGroups = gql`
  query {
    groups {
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

  render() {
    if (this.props.data.loading || !Array.isArray(this.props.data.groups)) return <div />;
    console.log(this.props.data);
    const listContent = this.props.data.groups.map(group => ({
      group: group.group,
      desc: group.desc,
      updated: this.parseUpdated(group),
    }));
    console.log(listContent);
    return (
      <Paneset>
        <Pane defaultWidth="fill" fluidContentWidth paneTitle="Patron Groups">
          <EditableList
            contentData={listContent}
            createButtonLabel="+ Add new"
            visibleFields={['group', 'desc']}
            itemTemplate={{ group: 'string', id: 'string', desc: 'string' }}
            additionalFields={{ updated: { gloss: 'Last updated', component: UpdatedWrapper } }}
            onUpdate={x => console.log(x)}
            onCreate={x => console.log(x)}
            onDelete={x => console.log(x)}
            isEmptyMessage="There are no patron groups"
            label="Patron Groups"
            nameKey="group"
          />
        </Pane>
      </Paneset>
    );
  }
}

export default graphql(PatronGroups)(PatronGroupsSettings);

import React from 'react';
import PropTypes from 'prop-types';
import ControlledVocab from '@folio/stripes-smart-components/lib/ControlledVocab';

import { RenderPatronGroupLastUpdated, RenderPatronGroupNumberOfUsers } from '../lib/RenderPatronGroup';

class PatronGroupsSettings extends React.Component {
  static propTypes = {
    stripes: PropTypes.shape({
      connect: PropTypes.func.isRequired,
    }).isRequired,
  };

  constructor(props) {
    super(props);
    this.connectedControlledVocab = props.stripes.connect(ControlledVocab);
    this.connectedPatronGroupLastUpdated = props.stripes.connect(RenderPatronGroupLastUpdated);
    this.connectedPatronGroupNumberOfUsers = props.stripes.connect(RenderPatronGroupNumberOfUsers);
  }

  render() {
    return (
      <this.connectedControlledVocab
        {...this.props}
        baseUrl="groups"
        records="usergroups"
        label="Patron Groups"
        visibleFields={['group', 'desc']}
        itemTemplate={{ group: 'string', id: 'string', desc: 'string' }}
        nameKey="group"
        additionalFields={[ {
          component: this.connectedPatronGroupLastUpdated,
          gloss: "Last Updated",
        }, {
          component: this.connectedPatronGroupNumberOfUsers,
          gloss: "# of Users",
        }]}
      />
    );
  }
}

export default PatronGroupsSettings;

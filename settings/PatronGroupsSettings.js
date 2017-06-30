import React, { PropTypes } from 'react';
import AuthorityList from '@folio/stripes-components/lib/AuthorityList';

class PatronGroupsSettings extends React.Component {
  static propTypes = {
    stripes: PropTypes.shape({
      connect: PropTypes.func.isRequired,
    }).isRequired,
  };

  constructor(props) {
    super(props);
    this.connectedAuthorityList = props.stripes.connect(AuthorityList);
  }

  render() {
    return (
      <this.connectedAuthorityList
        {...this.props}
        baseUrl="groups"
        records="usergroups"
        label="Patron Groups"
        visibleFields={['group', 'desc']}
        itemTemplate={{ group: 'string', id: 'string', desc: 'string' }}
        nameKey="group"
      />
    );
  }
}

export default PatronGroupsSettings;

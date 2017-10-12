import React from 'react';
import PropTypes from 'prop-types';
import ControlledVocab from '@folio/stripes-smart-components/lib/ControlledVocab';

class PatronGroupsSettings extends React.Component {
  static propTypes = {
    stripes: PropTypes.shape({
      connect: PropTypes.func.isRequired,
    }).isRequired,
  };

  constructor(props) {
    super(props);
    this.connectedControlledVocab = props.stripes.connect(ControlledVocab);
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
      />
    );
  }
}

export default PatronGroupsSettings;

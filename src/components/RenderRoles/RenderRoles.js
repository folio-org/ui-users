import _ from 'lodash';
import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import PropTypes from 'prop-types';
import {
  List,
  Accordion,
  Badge,
  Headline,
  Loading,
  TextLink,
} from '@folio/stripes/components';

import AffiliationsSelect from '../AffiliationsSelect/AffiliationsSelect';
import IfConsortium from '../IfConsortium';
import IfConsortiumPermission from '../IfConsortiumPermission';
import { affiliationsShape } from '../../shapes';
import { getRoleDetailPath } from '../util/util';

class RenderRoles extends React.Component {
  static propTypes = {
    accordionId: PropTypes.string,
    affiliations: affiliationsShape,
    expanded: PropTypes.bool,
    heading: PropTypes.node.isRequired,
    intl: PropTypes.shape({
      formatMessage: PropTypes.func.isRequired,
    }),
    isLoading: PropTypes.bool,
    listedRoles: PropTypes.arrayOf(PropTypes.object),
    onChangeAffiliation: PropTypes.func,
    onToggle: PropTypes.func,
    permToRead: PropTypes.string.isRequired,
    selectedAffiliation: PropTypes.string,
    stripes: PropTypes.shape({
      hasPerm: PropTypes.func.isRequired,
      config: PropTypes.shape({
        showPerms: PropTypes.bool,
        listInvisiblePerms: PropTypes.bool,
      }).isRequired,
    }).isRequired,
    isAffiliationsVisible: PropTypes.bool.isRequired,
  };

  static defaultProps = {
    onChangeAffiliation: _.noop,
    isLoading: false,
  }

  renderList() {
    const {
      listedRoles,
    } = this.props;
    const listFormatter = item => <li key={item.id}>
      <TextLink to={getRoleDetailPath(item.id)} target="_blank">{item.name}</TextLink>
    </li>;
    const noPermissionsFound = <FormattedMessage id="ui-users.roles.empty" />;

    return (
      <List
        items={(listedRoles || []).sort((a, b) => a.name.localeCompare(b.name))}
        itemFormatter={listFormatter}
        isEmptyMessage={noPermissionsFound}
      />
    );
  }

  render() {
    const {
      affiliations,
      accordionId,
      expanded,
      isLoading,
      onChangeAffiliation,
      onToggle,
      listedRoles,
      stripes,
      permToRead,
      selectedAffiliation,
      heading,
      isAffiliationsVisible,
    } = this.props;

    if (!stripes.hasPerm(permToRead)) { return null; }

    return (
      <Accordion
        open={expanded}
        id={accordionId}
        onToggle={onToggle}
        label={<Headline size="large" tag="h3">{heading}</Headline>}
        displayWhenClosed={
          isLoading ? <Loading /> : <Badge>{listedRoles.length}</Badge>
        }
      >
        <IfConsortium>
          <IfConsortiumPermission perm="consortia.user-tenants.collection.get">
            {Boolean(affiliations?.length) && isAffiliationsVisible && (
              <AffiliationsSelect
                affiliations={affiliations}
                onChange={onChangeAffiliation}
                isLoading={isLoading}
                value={selectedAffiliation}
              />
            )}
          </IfConsortiumPermission>
        </IfConsortium>

        {this.renderList()}
      </Accordion>
    );
  }
}

export default injectIntl(RenderRoles);

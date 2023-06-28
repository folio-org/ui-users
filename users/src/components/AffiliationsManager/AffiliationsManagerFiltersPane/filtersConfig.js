import { FormattedMessage } from 'react-intl';

const assignmentStatusConfig = {
  label: <FormattedMessage id="ui-users.affiliations.manager.filter.assignment" />,
  name: 'status',
  values: [
    {
      displayName: <FormattedMessage id="ui-users.affiliations.manager.filter.assignment.assigned" />,
      name: 'assigned',
    },
    {
      displayName: <FormattedMessage id="ui-users.affiliations.manager.filter.assignment.unassigned" />,
      name: 'unassigned',
    },
  ],
  filter(filtered, activeFilters, assignment) {
    const {
      [`${this.name}.${this.values[0].name}`]: filterAssigned,
      [`${this.name}.${this.values[1].name}`]: filterUnassigned,
    } = activeFilters;

    return filtered.filter(({ id }) => {
      const isAssigned = Boolean(assignment[id]);

      return (
        (filterUnassigned && !isAssigned && !filterAssigned)
        || (!filterUnassigned && isAssigned && filterAssigned)
        || (filterUnassigned && filterAssigned)
        || !Object.keys(activeFilters).some((key) => (key.startsWith(this.name)))
      );
    });
  },
};

const filtersConfig = [
  assignmentStatusConfig,
];

export default filtersConfig;

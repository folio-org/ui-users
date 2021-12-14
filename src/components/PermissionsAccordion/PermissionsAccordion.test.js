import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import '__mock__/currencyData.mock';
import '__mock__/stripesCore.mock';

import renderWithRouter from 'helpers/renderWithRouter';
import stripesFinalForm from '@folio/stripes/final-form';
import PermissionsAccordion from './PermissionsAccordion';
import {
  statusFilterConfig,
  permissionTypeFilterConfig,
} from './helpers/filtersConfig';

jest.unmock('@folio/stripes/components');

const handleSectionToggle = jest.fn();
const onSubmit = jest.fn();
const subPermissions = [
  {
    deprecated: false,
    description: 'Grants all permissions included in Agreements: Search & view agreements plus the ability to delete agreements. This does not include the ability to edit agreements, only to delete them',
    displayName: 'Agreements: Delete agreements',
    grantedTo: ['8fafcfdb-419c-483e-a698-d7f8f46ea694'],
    id: '026bc082-add6-4cdd-a4fd-a588439a57b6',
    moduleName: 'folio_agreements',
    moduleVersion: '8.1.1000825',
    mutable: false,
    permissionName: 'ui-agreements.agreements.delete',
    subPermissions: ['ui-agreements.agreements.view', 'erm.agreements.item.delete'],
    tags: [],
    visible: true,
  },
  {
    deprecated: false,
    description: 'Grants all permissions included in Agreements: Search & view agreements plus the ability to delete agreements. This does not include the ability to edit agreements, only to delete them',
    displayName: 'Agreements: Edit agreements',
    grantedTo: ['8fafcfdb-419c-483e-a698-d7f8f46ea694'],
    id: 'b52da718-7770-407a-af6d-668d258b2309',
    moduleName: 'folio_agreements',
    moduleVersion: '8.1.1000825',
    mutable: false,
    permissionName: 'ui-agreements.agreements.edit',
    subPermissions: ['ui-agreements.agreements.view', 'erm.agreements.item.delete'],
    tags: [],
    visible: true,
  }
];

const Form = ({ form, handleSubmit }) => (
  <form onSubmit={handleSubmit}>
    <PermissionsAccordion
      filtersConfig={[
        permissionTypeFilterConfig,
        statusFilterConfig,
      ]}
      expanded
      visibleColumns={[
        'selected',
        'permissionName',
        'type',
        'status',
      ]}
      headlineContent={<FormattedMessage id="ui-users.permissions.assignedPermissions" />}
      onToggle={handleSectionToggle}
      accordionId="permSection"
      permToRead="perms.permissions.get"
      permToDelete="perms.permissions.item.put"
      permToModify="perms.permissions.item.put"
      formName="permissionSetForm"
      permissionsField="subPermissions"
      form={form}
    />
  </form>
);

Form.propTypes = {
  form: PropTypes.object,
  handleSubmit: PropTypes.func.isRequired,
};

const WrappedForm = stripesFinalForm({
  navigationCheck: true,
  enableReinitialize: false,
})(Form);

const renderPermissionsAccordion = (props) => renderWithRouter(<WrappedForm {...props} onSubmit={onSubmit} initialValues={{ subPermissions }} />);

afterEach(() => jest.clearAllMocks());

describe('PermissionsAccordion', () => {
  test('renders', () => {
    const { debug } = renderPermissionsAccordion();
    debug();
  });
});


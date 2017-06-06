# Change history for ui-users

## IN PROGRESS

* The editMode boolean is now in a stripes-core local resource instead of a piece of React component state. This makes edit-mode persistent because it's in the Redux store -- so navigating away from an edit-user page to another app, then returning to the Users app, will remain in edit mode. Fixes the ui-users half of scenario 3 of STRIPES-362.
* Require stripes-components v0.10.1.

## [2.2.0](https://github.com/folio-org/ui-users/tree/v2.2.0) (2017-06-05)
[Full Changelog](https://github.com/folio-org/ui-users/compare/v2.1.0...v2.2.0)

* New users default to active=true, not only in the form but in the record that gets created. Fixes UI-46, and UI-44, and also UIU-2 (properly this time).
* Newly created permission sets are immediately selected. Related to UIU-1.
* The header for the permission set details pane now reads "Untitled" when applicable and never displays the permission set ID. Related to UIU-41.

## [2.1.0](https://github.com/folio-org/ui-users/tree/v2.1.0) (2017-06-01)
[Full Changelog](https://github.com/folio-org/ui-users/compare/v2.0.0...v2.1.0)

* User metadata extended in detailed view and form: add support for new middle name, phone, mobile phone, date-of-birth, date-enrolled, expiration-date, barcode, FOLIO record-number and external system ID fields. Fixes UIU-28.
* Use new `Datepicker` component on user form. Related to LIBAPP-87.
* Status of new users defaults to 'active'. Fixes UIU-2.
* Patron-group filters are driven from what is in the database. Fixes UIU-32.
* Change old snake-case fieldnames to new camel-case (e.g. `firstName` instead of `first_name`) to match what's used by mod-users v10.x.
* When adding permissions to user or a set, only "logical permissions" (those with `visible:true`) are displayed as available to add. (But when the `listInvisiblePerms` setting is true, all permissions are still listed, as before). Fixes UIU-30.
* Towards better support for infinite-scroll paging. Not yet complete. Towards STRIPES-361.
* Settings panes are sorted alphabetically. Fixes the ui-users part of STRIPES-358.
* Patron-groups no longer contain the unsupported `inUse` field. This means these records work correctly against mod-users v10.x, which rejects records containing unrecognised fields. Fixes UIU-43.
* Delete patron-group action is always available. Fixes UIU-42.
* When a new permission-set is created, it is highlighted. Fixes UIU-1.
* Get Okapi token information from new `okapi` prop rather than context.
* Upgrade dependencies: stripes-components v0.10.0, stripes-core v1.8.0.
* Remove unused `ModuleDescriptor.json`; move relevant information into `package.json`, whence we hope future tools will extract it.
* Add Okapi interface dependencies to `package.json`: users v10.0, circulation v1.0 and permissions v3.0.

## [2.0.0](https://github.com/folio-org/ui-users/tree/v2.0.0) (2017-05-11)
[Full Changelog](https://github.com/folio-org/ui-users/compare/v1.4.0...v2.0.0)

Version 2.0.0 of ui-users requires mod-users version 9.0.0.
Previous versions of ui-users are not compatible with version 9.0.0 of mod-users

* Align ui-users with mod-users version 9.0.0: User schema changes

## [1.4.0](https://github.com/folio-org/ui-users/tree/v1.4.0) (2017-05-09)
[Full Changelog](https://github.com/folio-org/ui-users/compare/v1.3.0...v1.4.0)

* Depend on v1.0.0 of stripes-connect.

## [1.3.0](https://github.com/folio-org/ui-users/tree/v1.3.0) (2017-05-08)
[Full Changelog](https://github.com/folio-org/ui-users/compare/v1.2.0...v1.3.0)

* Settings pages are now navigated using react-router, not manually maintained local state. Fixes STRIPES-339.
* Top-level settings page is now provided by `<Settings>` from stripes-components v0.7.0.
* Various permission-management facilities are now themselves controlled by the relevant permissions. Fixes LIBAPP-151
* Trying to view a user when you do not have the users.item.get permission no longer results in an unsuccessful HTTP request.
* Lots of rewriting of permissions handling, simplifying components and making them ESLint-clean.
* Include the `settings` are in the ESLint command involved by `yarn lint`.
* Render loan dates in locale-specific format. Fixes LIBAPP-179.
* No components now connect themselves: instead, their parents use curried connect. Fixes STRIPES-338.
* Rename the generic-sounding `<ListDropdown>` to the more specific `<PermissionList>`.
* Use params rather than path to express the query.
* Requires stripes-core v1.0.0 and stripes-components v0.7.0.

## [1.2.0](https://github.com/folio-org/ui-users/tree/v1.2.0) (2017-04-26)
[Full Changelog](https://github.com/folio-org/ui-users/compare/v1.1.0...v1.2.0)

* Many, many changes to client-side permission checking. Fixes STRIPES-326.
* Settings: `<Pane>` components in PermissionSetDetails.js and PatronGroupsSettings.js make use of the `fluidContentWidth` prop to resolve page cut-off issues.
* Settings: `index.js` sets a `defaultWidth` to its paneset.
* Upgrade dependency: stripes-components v0.6.1.
* Upgrade peer-dependency: stripes-core v1.0.0.

## [1.1.0](https://github.com/folio-org/ui-users/tree/v1.1.0) (2017-04-12)
[Full Changelog](https://github.com/folio-org/ui-users/compare/v1.0.0...v1.1.0)

* Add ability to manage permission sets (LIBAPP-83).
* Upgrade dependencies; stripes-core v0.6.0, stripes-connect v0.3.0, and stripes-components v0.6.0.

## [1.0.0](https://github.com/folio-org/ui-users/tree/v1.0.0) (2017-04-10)
[Full Changelog](https://github.com/folio-org/ui-users/compare/v0.0.2...v1.0.0)

* First version to have a documented change-log.
* Handles `id` field, rather then `_id`, as unique key of patron groups. Enables this module to interoperate with new versions of mod-users (since commit 022b8b8c) but of course makes it unable to run against older versions.
* Updates the permissions checked, to match what is used by folio-backend-auth v0.8.3.


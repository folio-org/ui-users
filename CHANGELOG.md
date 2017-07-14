# Change history for ui-users

## 2.8.0 IN PROGRESS

* Add [`<SRStatus>`](https://github.com/folio-org/stripes-components/tree/master/lib/SRStatus) component to main module page. After search is performed, screen readers will announce the number of results. Integrates STCOM-3.
* Add "Skip to Results" [`<FocusLink>`](https://github.com/folio-org/stripes-components/tree/master/lib/FocusLink) component to search input (accessibility feature - tab twice on input to see it appear after 'clear search' button. When it is focused, pressing the 'enter' key will focus the results list). Integrates STCOM-7.
* Add unique tag IDs to UI elements for automated testing, so far to main sections like panes and multi-column lists. STRIPES-300.
* Include create date and date updated fields in user view. Completes UIU-31.
* Dependencies for stripes-components raised to "1.3.0".
* Results list renders as block anchors to support right-click functionality. Part of STRIPES-409.
* Display user permissions only if interface "permissions" v4.0 is available. Fixes the new part of UIU-74.
* Add two high-level permissions to the `package.json`, and a new `yarn mkmd` rule to create a module-descriptor from this and other information in the package-file. Fixes UIU-94.
* Update search debounce time from 150ms to 350ms, Ameliorates UIU-77.
* Description field for permission-sets is not mandatory. Fixes UIU-93.
* When maintaining permissions sets, post only the IDs of subpermissions, not whole permissions. Fixes UIU-73.
* When a new record is created, navigate to it, and highlight it in the search-results if present. Fixes UIU-95.
* Interface dependency for user loans is upgraded from `loan-storage` 1.0 to `circulation` 1.0. Fixes UIU-100.
* Revise okapiInterfaces and permissionSets in `package.json`. Fixes UIU-105.
* Move patron-group and permissions settings source files down into their own subdirectories.
* Add repeatable address fieldgroup to user form and user details. Fixes UIU-29.
* When creating new permissions, it is possible to set their {{permissionName}}. Fixes UIU-98.
* `<PatronGroupsSettings>` uses generic `<EditableList>` instead of PG-specific `<PatronGroupsList>`, which we no longer need. Fixes UIU-48.
* Depends on v13.0 of the `users` interface for `totalRecords` metadata and `dateCreated` and `dateUpdated` fields. Fixes UIU-114.
* Use new %{name} syntax instead of old ${name} throughout. See STRPCONN-5.
* Prompt on navigation away from dirty User form. See UIU-112.
* Specify module name in settings second column. Part of STRPCOMP-1.
* Include label in permission-set editor pane-title. Part of STRPCOMP-1.
* Change title on loan history. Fixes UIU-119.
* Users created with no password are given an empty one. Fixes UIU-120.
* Fix `toUserAddress` converter. Fixes UIU-121.
* Eliminate all uses of `componentWillMount` to provide initial values to resources. Part of STRIPES-433.
* Add Address Type to User Associations. Completes UIU-80.
* Add Address Type CRUD. Completes UIU-79.
* Change some permission-names. Fixes the ui-users part of STRIPES-435.
* Move "New User" button from filter pane to results pane. Fixes UIU-125.
* New permission `settings.usergroups.all`. Fixes UIU-130.

## [2.7.0](https://github.com/folio-org/ui-users/tree/v2.7.0) (2017-06-14)
[Full Changelog](https://github.com/folio-org/ui-users/compare/v2.6.0...v2.7.0)

* View loan details with first loan action. Fixes UIU-87.
* Support reverse-sorting. Fixes UIU-81.
* Stable sorting: when moving from one sort criterion to another, the old one is retained as the secondary key. Fixes UIU-83.
* Remove non-functional search boxes from user details pane. Fixes UIU-76.
* Upgrade stripes-components dependency to v0.15.0, needed for stable sorting.

## [2.6.0](https://github.com/folio-org/ui-users/tree/v2.6.0) (2017-06-12)
[Full Changelog](https://github.com/folio-org/ui-users/compare/v2.5.0...v2.6.0)

* Display loans only if interface loan-storage v1.0 is available. Fixes UIU-74.
* Do not assign _any_ permissions to new user -- no longer needed for login, since stripes-core v1.13.0 uses the all-in-one call `/bl-users/login`. Fixes UIU-60.

## [2.5.0](https://github.com/folio-org/ui-users/tree/v2.5.0) (2017-06-09)
[Full Changelog](https://github.com/folio-org/ui-users/compare/v2.4.0...v2.5.0)

* Accept either total_records or totalRecords field in search-responses. Fixes UIU-68 (and so clears the way for MODUSERS-19).
* Mark five fields mandatory in users form (UIU-28)
* Validate preferred-contact setting (mandatory) (UIU-28)
* Bug-fix (patron-group setting, when set to "undefined")

## [2.4.0](https://github.com/folio-org/ui-users/tree/v2.4.0) (2017-06-08)
[Full Changelog](https://github.com/folio-org/ui-users/compare/v2.3.0...v2.4.0)

* Updated dependency version of stripes-components to 0.12.0
* Props added to results list to use infinite scroll capability (STRIPES-361)
* New field 'preferred contact'. Requires users interface v11.0  (UIU-28)
* Use `props.resources` to determine actual hit count

## [2.3.0](https://github.com/folio-org/ui-users/tree/v2.3.0) (2017-06-07)
[Full Changelog](https://github.com/folio-org/ui-users/compare/v2.2.0...v2.3.0)

* The editMode boolean is now in a stripes-core local resource instead of a piece of React component state. This makes edit-mode persistent because it's in the Redux store -- so navigating away from an edit-user page to another app, then returning to the Users app, will remain in edit mode. Fixes UIU-62.
* New users no longer get 'usergroups.collection.get' and 'module.trivial.enabled' permissions. Fixes UIU-61.
* Default to sorting by name (i.e. surname, first name). Fixes UIU-51.
* Make patron-group mandatory. Fixes UIU-45.
* Use patron-group name rather than description throughout (in facets, list, display, edit-form). Fixes UIU-56.
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

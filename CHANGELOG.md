# Change history for ui-users

## 2.11.0 (IN PROGRESS)

* Add and use new translation `ui-users.resultCount`. Allows us to exercise the use of placeholders. Fixes UIU-204.
* Modify translation support to handle pluralisation of record-count. Fixes UIU-206.
* Refactor `<Notes>` into a separate repository. See STUTILNOTE-2.
* Check correct permission for ability to add/remove perms to a permission-set. Fixes UIU-57.
* Fix actions menu on loans page. Fixes UIU-212.
* Link title to item from loans. Fixes UIU-234.
* Link barcode to item from loans. Fixes UIU-213.
* Remove return date column from open loans tab. Fixes UIU-225.
* Add borrower name to loans. Fixes UIU-215.
* Support bulk renew on loans. Fixes UIU-214.
* Display number of loans. Fixes UIU-218.
* Display count when loans section is collapsed. Fixes UIU-233.
* Display count when proxy section is collapsed. Fixes UIU-233.
* Rename "Proxy Permissions" section to "Proxy". Fixes UIU-236.
* Adjust loan page layout Fixes UIU-251.
* Path URLs, permission calls, and credentials now use UUID instead of username where appropriate. Fixes UIU-172.
* Expand/Collapse All button integrated for accordions on the user detail page. Fulfills STCOM-71.
* Change name of "User Status" filter to "Status". Fixes UIU-210.
* Change "Active" column in user list to "Status", and change values from tick-or-nothing to "Active" and "Inactive". Fixes UIU-211.
* Permissions menu sorted by displayName (but still be permissionName when `config.showPerms` is true). Fixes UIU-250.
* Fix renew date. Fixes UIU-252.
* `editable` prop added to `<RenderPermissions>` component to facilitate UIU-244.
* When `config.showPerms` is true, show the True Names of users' permissions as well as available permissions. Fixes UIU-262.
* Use `<ControlledVocab>` from stripes-smart-components instead of `<AuthorityList>` from stripes-components. See STSMACOM-6. Requires stripes-smart-components v1.0.1. Fixes UIU-267, UIU-270.
* Reinstate ability to add permissions to a permission-set. Fixes UIU-269.
* Use `<Badge>` from stripes-components. Fixes UIU-268.
* Use PropTypes, not React.PropTypes. Refs FOLIO-427.
* Apply `noOverflow` prop to results pane. Fixes STCOM-40.
* Sort Loans by Column Header. Fixes UIU-217.

## [2.10.1](https://github.com/folio-org/ui-users/tree/v2.10.1) (2017-09-05)
[Full Changelog](https://github.com/folio-org/ui-users/compare/v2.10.0...v2.10.1)

* Add wait time after create-user request in 'new_user' test. UIU-205

## [2.10.0](https://github.com/folio-org/ui-users/tree/v2.10.0) (2017-09-01)
[Full Changelog](https://github.com/folio-org/ui-users/compare/v2.9.0...v2.10.0)

* Update permissions namespace in package.json. Towards STRIPES-435.
* Correctly format column titles. Fixes UIU-176.
* Use "Source" in place of "Operator" on loan details. Fixes UIU-178.
* Add Time Stamp to Loan Dates. Fixes UIU-180.
* Show Operator name on loan action history. Fixes UIU-163.
* Username uniqueness check works again -- it had broken. Fixes UIU-183.
* Visible fieldname "user ID" changed to "username" throughout. Fixes UIU-169.
* Made the display of the create new user button conditional (UIS-71).
* Fetch up to 100 loan records rather than the default of 10. Fixes UIU-173.
* Displayed number of loans is now stable. Fixes UIU-184.
* Switch from props.data to props.resources. Fixes UIU-136.
* Better formatting of "Open Loans" and "Closed Loans" tabs. Fixes UIU-128.
* Use translations for some loan-related messages. Fixes UIU-186.
* Add password toggle. Fixes UIU-97.
* Turn off autocomplete for username and password. Fixes UIU-190.
* Add module test suites, carried over from ui-testing. FOLIO-800.
* Update stripes-components to 1.5.0.
* First pass at integrating `<Notes>`. See LIBAPP-188.
* The `settings.usergroups.all` permission is visible. Fixes UIU-130.
* Add item's status, barcode, and return-date to loan-details pane, and link item's barcode to item-details pane. Part of UIU-177.
* Add various settings-related permissions. Part of UIU-197.
* Version 1 of Select User Proxy. Fixes UIU-104.
* Add Item Status column to, and remove loan status from, loans display. Fixes UIU-175.
* Selected part of settings is consistently highlighted. Fixes UIU-182.
* Fixed a race-condition that sometimes caused an error when creating new users. UIU-195.
* Initial integration with notes. Fixes UIU-196.
* Upgrade dependencies to stripes-components 1.7.0, stripes-connect 2.7.0 and stripes-core 2.7.0.

## [2.9.0](https://github.com/folio-org/ui-users/tree/v2.9.0) (2017-08-03)
[Full Changelog](https://github.com/folio-org/ui-users/compare/v2.8.0...v2.9.0)

* Details Pane remains open while switching selected user. Fixes UIU-153.
* Add filterBy callback prop to `<Autocomplete>`. Fixes UIU-139.
* Add barcode column to Users list. Fixes UIU-123.
* Make barcode searchable. Fixes UIU-124.
* Make email-address searchable. Fixes UIU-146.
* Support sorting by barcode. Fixes UIU-151.
* Use new-style specification of action-names in ui-users. Fixes UIU-149.
* Change title in results pane. See comments in UIU-125.
* Show open- and closed-loans counts on the user-details pane. See UIU-128
* Show "Open Loans" and "Closed Loans" tabs on the loans-list panes. See UIU-128.
* Do not mention search-term in "No Results Found" message if there is none. Fixes UIU-158.
* Show Operator name on loan action history. Fixes UIU-163.
* Rename action names. Fixes UIU-161 and UIU-161.
* The clear-search button goes back to Users starting state. Fixes UIU-155.
* Explicitly reset component state in onClearSearch. Fixes UIU-167.
* Add searching for internal ID and External system ID. Fixes UIU-5.
* Display Loan Due Date. Upgrade `circulation` dependency to 2.1 and `loan-storage` to 3.1. Fixes UIU-171
* Sorting by patron-group uses group-name, not ID. Fixes UIU-101.
* Update stripes-components to 1.4.0.

## [2.8.0](https://github.com/folio-org/ui-users/tree/v2.8.0) (2017-07-17)
[Full Changelog](https://github.com/folio-org/ui-users/compare/v2.7.0...v2.8.0)

* Add [`<SRStatus>`](https://github.com/folio-org/stripes-components/tree/master/lib/SRStatus) component to main module page. After search is performed, screen readers will announce the number of results. Integrates STCOM-3.
* Add "Skip to Results" [`<FocusLink>`](https://github.com/folio-org/stripes-components/tree/master/lib/FocusLink) component to search input (accessibility feature - tab twice on input to see it appear after 'clear search' button. When it is focused, pressing the 'enter' key will focus the results list). Integrates STCOM-7.
* Add unique tag IDs to UI elements for automated testing, so far to main sections like panes and multi-column lists. STRIPES-300.
* Include create date and date updated fields in user view. Completes UIU-31.
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
* Connect to Loan Actions API. Fixes UIU-103.
* Support circulation interface v2.0. Fixes UIU-133.
* Release ui-users v2.8.0. Fixes UIU-137.
* Raised Stripes dependencies:
  * stripes-components from v0.15.0 to v1.3.0
  * stripes-connect from v2.2.1 to v2.4.0
  * stripes-core from v1.13.0 to v2.2.0

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

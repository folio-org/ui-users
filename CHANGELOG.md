# Change history for ui-users

## [2.15.3](https://github.com/folio-org/ui-users/tree/v2.15.3) (2018-09-24)
[Full Changelog](https://github.com/folio-org/ui-users/compare/v2.15.2...v2.15.3)

* Fix charge Manual Fee/Fine,Display fees/fines history,Display Fee/Fine Details,Pay Fee/Fine. Fix UIU-635, UIU-645.

## [2.15.2](https://github.com/folio-org/ui-users/tree/v2.15.2) (2018-09-14)
[Full Changelog](https://github.com/folio-org/ui-users/compare/v2.15.1...v2.15.2)

* Update to stripes-form 0.9.0. Refs STRIPES-555.

## [2.15.1](https://github.com/folio-org/ui-users/tree/v2.15.1) (2018-09-13)
[Full Changelog](https://github.com/folio-org/ui-users/compare/v2.15.0...v2.15.1)

* Update translations.

## [2.15.0](https://github.com/folio-org/ui-users/tree/v2.15.0) (2018-09-13)
[Full Changelog](https://github.com/folio-org/ui-users/compare/v2.13.0...v2.15.0)

* Fix duplicity message for settings. Fixes UIU-193, UIU-198, UIU-504, UIU-505, UIU-543.
* Remove Tax/Vat column for Manual Fees/Fines Table. Fixes UIU-577.
* Ensure the availability of data to Charge manual Fee/Fine. Fixes UIU-219.
* Add functions for link to fee/fine history and fee/fine details. Fixes UIU-238 and UIU-239.
* Support either `circulation` interface version 3.0 or 4.0. Part of UIU-627.
* Support either `loan-storage` interface version 4.0 or 5.0. Part of UIU-627.
* Automatically use default service point when a user is editing themselves. Fixes UIU-551.
* Optimize the search for Manual Fees/Fines Table. Fix UIU-198.
* Modify charge Manual Fee/Fine. Refs UIU-219, UIU-607.
* Implement functionality for Loan details and fix Display fees/fines history. Refs UIU-238.
* Implement bulk action modal and fix Display Fee/Fine Details. Refs UIU-239.
* Fix Cancel Fee/Fine. Fix UIU-450.
* Fix Pay Fee/Fine. Fix UIU-454.
* Fix Waive Fee/Fine. Fix UIU-455.
* Add missing files. Fix UIU-219, UIU-238.
* Anonymize closed loans on demand. Fixes UIU-463.
* Add badge counter to tags icon. Part of STSMACOM-113.


## 2.14.0

(Does not exist due to [a numbering error with patch-level `folioci` releases](https://issues.folio.org/browse/UIU-626?focusedCommentId=36089&page=com.atlassian.jira.plugin.system.issuetabpanels:comment-tabpanel#comment-36089).)


## [2.13.0](https://github.com/folio-org/ui-users/tree/v2.13.0) (2018-09-04)
[Full Changelog](https://github.com/folio-org/ui-users/compare/v2.12.0...v2.13.0)

* Refine user details view. Fixes UIU-324.
* Display permission count when section is collapsed on user form. Fixes UIU-331.
* Display permission count when section is collapsed on user details. Fixes UIU-332.
* Display proxy count when section is collapsed on user form. Fixes UIU-330.
* Add setting for show/hide profile picture. Fixes UIU-327.
* Seconds should not display in due date time. Fixes UIU-328.
* Display user loan count (regression). Fixes UIU-308.
* Use react-intl `<FormattedDate>` and `<FormattedTime>` for date/time formatting. Fixes UIU-342.
* Add loaders to loan counters. Fixes UIU-343.
* Make password required. Fixes UIU-344.
* Setup permissions for proxies. Fixes UIU-349.
* Make FOLIO number read only. Fixes UIU-348.
* Use consistent language for "no `<attribute>` found" messages. Fixes UX-115.
* Hide proxy section if user lacks sufficient permission to see it. Fixes UIU-363.
* Add Save button to user settings. Fixes UIU-354.
* Disable deletion of in-use patron groups. Fixes UIU-364.
* Remove Phone and Mobile phone as 'preferred contact' options. Fixes UIU-261.
* Sort dropdown menus on user-edit screen. Fixes UIU-366.
* Favor `<Link to...>` over `<a href...>`. Refs STRIPES-482.
* Unique URLs for open-, closed-loans pages. Toward UIU-143, UIU-230.
* `<Link>` instead of `<Button onclick...>` for Loans. Toward UIU-143, UIU-230.
* Unique URLs for loan-details pages. Fixes UIU-145.
* First section of user detail information is no longer collapsible. Fixes UIU-359.
* Lint the converters in the ui-users source. Fixes UIU-371.
* Lint the data-provider files in the ui-users source. Fixes UIU-372.
* Add createdBy and updatedBy to metadata. Fixes UIU-325.
* Consistent formatting for "No proxies/No sponsors" messages. Fixes UX-115.
* Refactor settings to use ConfigManager. Fixes UIU-376.
* Make SearchAndSort's show-single-row optional and on by default. Refs UIREQ-60, UICHKOUT-54, UIU-373, STSMACOM-52.
* Additional "No proxies/No sponsors" formatting. Refs UX-115.
* Rewire loan links from items to inventory. Fixes UIU-368.
* Relabel elements in user details Proxy section. Fixes UIU-370.
* Get fixed renewal period from loan policy. Fixes UIU-405, but XXX this issue does not exist.
* Get rolling renewal period from loan policy. Fixes UIU-415.
* Add renew button to loan details. Fixes UIU-395.
* Make perm set title required. Fixes UIU-412.
* Fix address validation. Fixes UIU-414.
* Add placeholder text to explain what's wrong when there is no "find-user" plugin. Fixes UIU-421.
* Pass packageInfo to SearchAndSort; it's simpler. Refs STSMACOM-64. Available after v2.12.1.
* Upgrade stripes-components dependency to v2.0.3. Fixes UIU-423.
* Modal users-in-users app can now search again, thanks to the STCOM-226 fix. Fixes UIU-426.
* Prevent renewal if new calculated due date is less than or equal to current due date. Fixes UIU-429.
* Handle renew from current due date. Fixes UIU-428.
* Add borrower name and patron group to loan details. Fixes UIU-406.
* Bump stripes-components dependency to v2.0.5. Makes filters work in nested apps. Fixes UIU-430.
* Pass `props.browseOnly` through to `<SearchAndSort>` to optionally disable user creation and editing. Refs UIPFU-6. Available from v2.12.2.
* Get alternate fixed renewal period from loan policy. Fixes UIU-433.
* Get alternate rolling renewal period from loan policy. Fixes UIU-434 and UIU-435.
* Remove `<Autocomplete>` - Use new default `country` field control for address fields. Fixes UIU-298.
* Change default display to not return a list of all users. Fixes UIU-399.
* Update new permission set detail record. Fixes UIU-410 and UIU-404.
* Deprecate `transitionToParams` in favor of `this.props.mutator.query.update`. Fixes UIU-418.
* Use correct time offset on open loans view. Fixes UIU-440.
* Fixed username validation in UserForm (UIU-422)
* Move item details link to the options menu. Refs UIU-407.
* Enter key should not submit the user edit form. Fixes UIU-394.
* Updated loans views to match requirements of LIBAPP-233.
* Externalized All The Strings. Refs UIU-416.
* Ugly hack: ask for more facet rows than we likely need. Refs MODUSERS-57.
* Bug fix: translate table-headers fixes proxy lookup. Fixes UIU-452.
* Match periodId and profileId values with the values on the server. Refs UICIRC-53.
* Update loan actions table after renew. Fixes UIU-457.
* Fix problem where creating a new user would display a blank page. Fixes UIU-443.
* Fix manually editing permission sets. Fixes UIU-472.
* Make username and password optional, though mutually dependent. Fixes UIU-389.
* Handle metadata field case insensitively. Fixes UIU-471 in concert with CIRCSTORE-43.
* `<IfInterface>` test should match dependency version in `package.json`. Refs UIU-471.
* Restore patron-group sort. Fixes UIU-481.
* Use new proxyFor schema instead of meta. Fixes UIU-495.
* Validate proxy relationship status. Fixes UIU-200 and UIU-201.
* Added ability to change due date of loans in loan listings and individual views. Fixes UIU-497.
* Update paths for relocated components. Refs STCOM-277.
* Use `cql.allIndexes=1` when no query is supplied, instead of a wildcard. Fixes UIU-541.
* Use new renew-by-barcode API for renew. Fixes UIU-538.
* Removed "Accrue-fees-to" functionality for proxy/sponsors. (There doesn't seem to be a Jira for this.)
* Adjust renew error messages. Fixes UIU-552.
* Lower-case search terms AND permission names when searching. Refs UIORG-76.
* Provide an id prop to `<ConfirmationModal>` to avoid it autogenerating one for us. Refs STCOM-317.
* Configure tags helper app in users. Part of STSMACOM-113.
* Include active users in every search. Fixes UIU-400.
* Fetch up to 40 patron groups for filters on the main page, and for editing users. Fixes UIU-600.
* Add metadata to user form. Fixes UIU-524.
* Shrink surface of test data deps. Fixes UIU-604.
* Relocate integration tests to platform-core. Refs UIU-605.
* Wire and translate Users app into German. Fixes UIU-202.
* Properly update open and closed loan counts as items are checked in and out. Fixes UIU-315.
* Fix problem with Settings > Users > Patron Groups. Fixes UIU-338.
* Sort patron-groups alphabetically in Edit pane. Fixes UIU-365.
* Fix problems with searching in User Search and Select Popup for proxy. Fixes UIU-378.
* Massage code to satisfy an erroneous ESLint error in `showSingleResult`. Fixes UIU-379.
* Add all data for loan details. Fixes UIU-409.
* Use CQL's `==` operator for exact matches. Fixes UIU-411.
* Resolve a problem where a change to filter support broke searching. Fixes UIU-470.
* Add sort-indicator in header of Closed Loans. Fixes UIU-493.
* Relocate language files. Fixes UIU-502.

## [2.12.0](https://github.com/folio-org/ui-users/tree/v2.12.0) (2017-11-28)
[Full Changelog](https://github.com/folio-org/ui-users/compare/v2.11.0...v2.12.0)

* Remove `<SearchAndSort>` component, which is now in `stripes-smart-components`. Fixes UIU-323, see also STSMACOM-21.
* Remove user-profile's "View Loans" button. Fixes UIU-317.
* Remove row-click handling on "Open Loans" page. Fixes UIU-316.
* Use the URL query parameter `query` rather than `search`. Depends on `stripes-smart-components` v.1.3.0. Fixes UIU-333.
* Set open loans table to be non-interactive. Refs STCOM-139, UIU-316.

## [2.11.0](https://github.com/folio-org/ui-users/tree/v2.11.0) (2017-11-22)
[Full Changelog](https://github.com/folio-org/ui-users/compare/v2.10.1...v2.11.0)

* UI improvements:
  * Link title to item from loans. Fixes UIU-234.
  * Link barcode to item from loans. Fixes UIU-213.
  * Remove return date column from open loans tab. Fixes UIU-225.
  * Add borrower name to loans. Fixes UIU-215.
  * Support bulk renew on loans. Fixes UIU-214.
  * Display number of loans. Fixes UIU-218.
  * Display count when loans section is collapsed. Fixes UIU-233.
  * Display count when proxy section is collapsed. Fixes UIU-232.
  * Rename "Proxy Permissions" section to "Proxy". Fixes UIU-236.
  * Adjust loan page layout. Fixes UIU-251.
  * Expand/Collapse All button integrated for accordions on the user detail page. Fulfills STCOM-71.
  * Change name of "User Status" filter to "Status". Fixes UIU-210.
  * Change "Active" column in user list to "Status", and change values from tick-or-nothing to "Active" and "Inactive". Fixes UIU-211.
  * Renewals now update the renew date. Fixes UIU-252.
  * `editable` prop added to `<RenderPermissions>` component: permissions section is now read only on the user record preview pane. Fixes UIU-244.
  * Sort Loans by Column Header. Fixes UIU-217.
  * Show loan's proxy borrower. Part of UIU-177.
  * Integrate confirmation modal for deletion of permission sets. Fulfills STCOM-66.
  * Change search label. Fixes UIU-140.
  * Sort addresses by primary field. Fixes UIU-296.
  * Add User Proxy Version 2. Fixes UIU-181, UIU-199, UIU-240 and UIU-271.
  * Refine user form. Fixes UIU-282.
  * Refine user form header. Fixes UIU-283.
  * Add permission assignment to user edit. Fixes UIU-241.
  * Make address component read-only on the user record preview pane. Fixes UIU-242.

* Bugfixes
  * When `config.showPerms` is true, show the True Names of users' permissions as well as available permissions. Fixes UIU-262.
  * Permissions menu sorted by displayName (but still by permissionName when `config.showPerms` is true). Applies lists to both of existing permissions, and of those available to add. Fixes UIU-250.
  * User permissions, permission-set sub-permissions and available permissions are now all sorted case-insensitively. Fixes UIU-273.
  * Check correct permission for ability to add/remove perms to a permission-set. Fixes UIU-57.
  * Reinstate ability to add permissions to a permission-set. Fixes UIU-269.
  * Fix race-condition where newly created user can be displayed before its perms exist, yielding an error. Fixes UIU-227.
  * Wrap title on loans page so Actions link is displayed. Fixes UIU-212.
  * Apply `noOverflow` prop to results pane. Fixes the irritating flicker of STCOM-40.

* Use of newly available WSAPIs:
  * Path URLs, permission calls, and credentials now use UUID instead of username where appropriate. Fixes UIU-172.
  * Rewire proxy selection with the new `proxiesfor` endpoint. Fixes UIU-292.

* Re-usable `<SearchAndSort>` component:
  * Break out core search/sort functionality into re-usable component. Fixes UIU-278.
  * Make various specific parts of functionality work with `<SearchAndSort>`:
    * Infinite scroll. Fixes UIU-284.
    * Full-record view. Fixes UIU-287.
    * Fix "Dismiss full record" button. Fixes UIU-288.
    * Editing. Fixes UIU-290.
    * User proxy/sponsor. Fixes UIU-293.
    * Notes. Fixes UIU-294.
    * Addresses. Fixes UIU-297.
  * Generalise `<SearchAndSort>` by moving all user-specific functionality out of it. Fixes UIU-299.
  * Where possible, move functionality from View and Edit components into generic `<SearchAndSort>`. Fixes UIU-303.

* Other refactoring
  * Rework the create user-with-creds-and-perms operation to use `stripes-connect` mutators. Fixes UIU-301.
  * All network communication is now done through `stripes-connect`, and `fetch` is unused. Fixes UIU-304.
  * Refactor `<Notes>` into a separate `stripes-smart-components` repository. See STUTILNOTE-2.
  * Use `<ControlledVocab>` from `stripes-smart-components` instead of `<AuthorityList>` from `stripes-components`. See STSMACOM-6. Requires `stripes-smart-components` v1.0.1. Fixes UIU-267, UIU-270.
  * Use `<Badge>` from `stripes-components`. Fixes UIU-268.
  * Use PropTypes, not React.PropTypes. Refs FOLIO-427.
  * Refactor permission sets. Fulfills UIU-231, UIU-276, and UIU-165.
  * Refactor permission sets to use `<EntryManager>`. Fixes UIU-300.
  * Refactor async user validator. Fixes UIU-302.
  * Switch to URL-transition via setting values in the anointed resource. See STRIPES-452.

* Translation
  * Add and use new translation `ui-users.resultCount`. Allows us to exercise the use of placeholders. Fixes UIU-204.
  * Modify translation support to handle pluralisation of record-count. Fixes UIU-206.

* Miscellaneous
  * Create test for changing a user's username. Fixes UIU-207.
  * Add `optionalDependencies` on find-user plugin. Fixes UIU-313.
  * Investigate problem setting password of newly created users. Fixes UIU-319.

* Update dependences on Stripes modules:
  * `stripes-components` from 1.8.0 to 1.9.0.
  * `stripes-form` from 0.8.0 to 0.8.1.
  * `stripes-smart-components` from 1.0.1 to 1.1.0
  * `stripes-connect` from 2.7.0 to 3.0.0-pre.1
  * `stripes-core` from 2.7.0 to 2.8.0,

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
* Handles `id` field, rather than `_id`, as unique key of patron groups. Enables this module to interoperate with new versions of mod-users (since commit 022b8b8c) but of course makes it unable to run against older versions.
* Updates the permissions checked, to match what is used by folio-backend-auth v0.8.3.

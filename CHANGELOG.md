# Change history for ui-users

## [1.3.0](https://github.com/folio-org/ui-users/tree/v1.2.0) (IN PROGRESS)
[Full Changelog](https://github.com/folio-org/ui-users/compare/v1.2.0...v1.3.0)

* Trying to view a user when you do not have the users.item.get permission no longer results in an unsuccessful HTTP request.
* Use params rather than path to express the query

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


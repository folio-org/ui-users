# Change history for ui-users

## [1.1.0](https://github.com/folio-org/ui-users/tree/v1.1.0) (IN PROGRESS)
[Full Changelog](https://github.com/folio-org/ui-users/compare/v1.0.0...v1.1.0)

* Add ability to manager permission sets (LIBAPP-83).
* Upgrade dependencies; stripes-core v0.5.0 and stripes-connect v0.3.0.

## [1.0.0](https://github.com/folio-org/ui-users/tree/v1.0.0) (2017-04-10)
[Full Changelog](https://github.com/folio-org/ui-users/compare/v0.0.2...v1.0.0)

* First version to have a documented change-log.
* Handles `id` field, rather then `_id`, as unique key of patron groups. Enables this module to interoperate with new versions of mod-users (since commit 022b8b8c) but of course makes it unable to run against older versions.
* Updates the permissions checked, to match what is used by folio-backend-auth v0.8.3.


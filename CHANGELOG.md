# Change history for ui-users

## 13.0.0 IN PROGRESS
* Collect coverage from unit tests. Refs UIU-3356.
* Modify translation string for search view: "User search -> Search & filter". Refs UIU-3231.
* *BREAKING* Use number generator for barcode. Refs UIU-2729.
* Change amount input type to number. Refs UIU-2836.
* Update jspdf(to v3.0.0) and jspdf-autotable(to v5.0.2) for security. Refs UIU-3347.
* Prevent error toast from occurring when user doesn't have `ui-users.roles.view` capability. Refs UIU-3350.
* Field "Date enrolled" showing 1 day earlier in View than Edit. Refs UIU-3264.
* "Affiliations" select in Role/Permission accordion should not be displayed on patron user details pane. Refs UIU-3314.
* Fixed sponsor notification dropdown showing incorrect values for pristine forms. Refs UIU-3260.
* Fix incorrect date display in `UserDetail` due to unspecified timezone. Refs UIU-3352.
* Add the ability for staff to take a patron's profile picture photo using a webcam. Refs UIU-3266.
* Ensure keycloak user updates are sent to `mod-users-keycloak` and non-keycloak user updates are sent to `mod-users`. Refs UIU-3360.
* Add missed subPermission `ui-users.roles.view` to `ui-users.roles.manage`. Refs UIU-3363.
* [Follow-up] Fix incorrect date display in `EditUserInfo` due to unspecified timezone. Refs UIU-3352.
* Fix `Expiration date` field value when non-default locale is applied. Refs UIU-3318.
* [Follow-up] Fix `Expiration date` field value when non-default locale is applied. Refs UIU-3318.
* Add 'users.collection.get' permission to user settings. Fixes UIU-3189.
* Replace TextField with MessageBanner for patron block warning. Refs UIU-3120.
* *BREAKING* Use the `circulation-bff-loans` endpoint instead of `circulation/loans` in `LoansListingContainer` and `LoanDetailContainer` to have all tokens for DCB item. Fixes UIU-3392.
* Update patron block message to support pluralization. Refs UIU-3394.
* Change fields order in `ExtendedInfo` and `RequestPreferencesView` components. Refs UIU-3122.
* Extended information - change order of fields, use MultiSelection for the departments field. Refs UIU-3123.
* Display "Unknown user" instead of dash in proxy borrower field. Refs UIU-3373.
* Make circulation-bff-loans dependency optional in folio_users UI module. Refs UIU-3409.
* Escape the `username` and `barcode` fields. Fixes UIU-2882.
* Remove addressTypeId prop from EditContactInfo and UserForm components to avoid address component issues. Refs UIU-3287.
* Migrate custom fields from mod-configuration to mod-settings. Refs UIU-3411.
* Open Loans page now shows useAtLocation column. Refs UIU-3405.
* Right-pane full-record display's Loans accordion now shows counts of Held and In Use use-at-location loans. Refs UIU-3406.
* Support `{{item.seriesStatements}}` in due-date receipt slips. Refs UIU-3416.
* Pass `hasDisplayInAccordionField` and `displayInAccordionOptions` props to `ViewCustomFieldsSettings` and `EditCustomFieldsSettings` to display `Display in accordion` field in settings. Refs UIU-3140.
* Add support for use circulation-bff for declare-item-lost. Refs UIU-3414.
* Remove empty lines in drop-down menus in Settings > Orders > Number generator options. Refs UIU-3424.
* AccountDetailsContainer - Show loading while data is loading to prevent page crash when visiting the Fee/fines details page via URL. Fixes UIU-3428.
* PermissionsModal to search in permissionName. Refs UIU-3436.
* Revert migration of custom fields title from mod-configuration to mod-settings. Ref UIU-3441.
* *BREAKING* Display custom fields in different accordions depending on the selected section. Refs UIU-3131.
* *BREAKING* Update the user record view page to display custom fields under the "User information", "Extended information", "Contact information", or default "Custom fields" accordions as configured in settings. Refs UIU-3129.
* Only show Keycloak user record confirmation when assigning roles to a non-Keycloak record. Refs UIU-3426.
* Add 'Minor' column to Patrons Pre-Registration List. Refs UIU-3425.
* *BREAKING* Update the user record view page to display custom fields under the Fees/fines, Loans, or Requests accordions as configured in settings. Refs UIU-3130.
* Fix User Edit workflow for making edits to non-Keycloak user. Previously Edit screen remained open. Now it properly returns to User Detail page with updated data. Refs UIU-3426.
* Pass `isCreateMode` prop to `EditCustomFieldsSection` components to ensure proper dirty and pristine form states. Refs UIU-3390.
* Fix user search pagination and total count display beyond 1000 records. Refs UIU-3387.
* Hide permissions and roles accordions on user create page. Refs UIU-3449.
* Add permission for circulation-storage.request-preferences.collection.get to ui-users.view to display request preferences. Refs UIU-3445.
* Avoid indirection through null item when loaned item is deleted. Fixes UIU-3457.
* In the list of a user's open loans, the "Use at location" includes service-point and (when relevant) exipiry date. Fixes UIU-3418.
* Added null check to allow roles to be selected for user when list is emptied. Fixes UIU-3465.
* Add translations for use-at-location actions for history list in loan detail pages. Fixes UIU-3420.
* Remove `DCB_VIRTUAL_USER` constant and update related tests to use user type directly. The last name will no longer be hardcoded to `DcbSystem`. Refs UIU-3477.
* Reset loans and requests data on mount in UserLoans and UserRequests. Refs UIU-3460.
* In a user's Loans accordion, the Held and In Use counts no long redundantly link to the Open Loans page. Fixes UIU-3475.
* Add the `isCreateMode` prop to the `EditFeesFines` component to prevent the button from being active when a new user page is opened and the fee fines custom field is present. Fixes UIU-3461.
* Add missing subPermissions for Financial transaction detail report. Refs UIU-3459.
* Replace `moment` with `dayjs`. Refs UIU-3334.
* Migrate tag flag from mod-configuration to mod-settings. Refs UIU-3412.
* Rename the `ui-users.settings.departments.create.edit.view` permission to avoid displaying the edit capability as a view. Fixes UIU-3403.
* Disable the submit button while the affiliations manager is processing. Refs UIU-3497.
* Optimize role fetching to load only selected tenant's roles instead of all tenants. Fixes UIU-3499.
* Add condition to check for non-empty servicePoints before showing handler in withServicePoints component. Fixes UIU-3503.
* *BREAKING* Replace `users/configurations/entry` endpoint with `users/settings/entries` for user settings. Refs UIU-3506.
* Increase the CSS specificity in the loans button group, ensuring it will always override the base .buttonGroup class regardless of CSS loading order. Fixes UIU-3505.
* Bump jspdf from ^3.0.0 (EOL) to ^4.0.0. Fixes UIU-3508.
* *BREAKING* Migrate `suppressEdit` setting from mod-configuration to mod-users and `custom_fields_label` setting to mod-settings. Remove "configuration" interface. Refs UIU-3404.
* Hide `AffiliationsSelect` when editing a patron/dcb/system user. Improve form submission handling in UserForm component. Fixes UIU-3374.
* Bump `jspdf` from `^4.0.0` to `^4.1.0` fixing CVE-2026-24133. Fixes UIU-3522.
* Filter out undefined roles in useUserAffiliationRoles to prevent errors during destructuring. Fixes UIU-3514.
* Use `ui-users.requests.all` instead of `ui-requests.all` to display request links. Refs UIU-3516.

## [12.1.16] (https://github.com/folio-org/ui-users/tree/v12.1.16) (2025-12-29)
[Full Changelog](https://github.com/folio-org/ui-users/compare/v12.1.15...v12.1.16)
* Optimize role fetching to load only selected tenant's roles instead of all tenants. Fixes UIU-3499.
* Add condition to check for non-empty servicePoints before showing handler in withServicePoints component. Do not show loading when saving a user record to prevent triggering the 'Are you sure' modal. Fixes UIU-3503.

## [12.1.15] (https://github.com/folio-org/ui-users/tree/v12.1.15) (2025-12-23)
[Full Changelog](https://github.com/folio-org/ui-users/compare/v12.1.14...v12.1.15)
* Remove UTC timezone from expiration date formatting in `UserInfo` and `EditUserInfo` components so that expiration is correct. Use `.format()` instead of `.format('L')` in `recalculatedDate` to preserve timezone information. Fixes UIU-3400.

## [12.1.14] (https://github.com/folio-org/ui-users/tree/v12.1.14) (2025-10-08)
[Full Changelog](https://github.com/folio-org/ui-users/compare/v12.1.13...v12.1.14)
* Add support for use circulation-bff for claim-item-returned. Refs UIU-3413.
* Add support for use circulation-bff for mark-as-missing. Refs UIU-3444.

## [12.1.13] (https://github.com/folio-org/ui-users/tree/v12.1.13) (2025-09-16)
[Full Changelog](https://github.com/folio-org/ui-users/compare/v12.1.12...v12.1.13)
* Avoid indirection through null item when loaned item is deleted. Fixes UIU-3457.

## [12.1.12] (https://github.com/folio-org/ui-users/tree/v12.1.12) (2025-09-12)
[Full Changelog](https://github.com/folio-org/ui-users/compare/v12.1.11...v12.1.12)
* Use the `circulation-bff-loans` endpoint instead of `circulation/loans` in `LoansListingContainer` and `LoanDetailContainer` to have all tokens for DCB item. Fixes UIU-3392.

## [12.1.11] (https://github.com/folio-org/ui-users/tree/v12.1.11) (2025-08-27)
[Full Changelog](https://github.com/folio-org/ui-users/compare/v12.1.10...v12.1.11)
* Add 'Minor' column to Patrons Pre-Registration List. Refs UIU-3425.

## [12.1.10] (https://github.com/folio-org/ui-users/tree/v12.1.10) (2025-08-20)
[Full Changelog](https://github.com/folio-org/ui-users/compare/v12.1.9...v12.1.10)
* Only show Keycloak user record confirmation when assigning roles to a non-Keycloak record. Refs UIU-3426.
* Fix User Edit workflow for making edits to non-Keycloak user. Previously Edit screen remained open. Now it properly returns to User Detail page with updated data. Refs UIU-3426.

## [12.1.9] (https://github.com/folio-org/ui-users/tree/v12.1.9) (2025-07-30)
[Full Changelog](https://github.com/folio-org/ui-users/compare/v12.1.8...v12.1.9)
* Add support for use circulation-bff for declare-item-lost. Refs UIU-3414.

## [12.1.8] (https://github.com/folio-org/ui-users/tree/v12.1.8) (2025-07-30)
[Full Changelog](https://github.com/folio-org/ui-users/compare/v12.1.7...v12.1.8)
* Add the ability for staff to take a patron's profile picture photo using a webcam. Refs UIU-3266.

## [12.1.7] (https://github.com/folio-org/ui-users/tree/v12.1.7) (2025-06-03)
[Full Changelog](https://github.com/folio-org/ui-users/compare/v12.1.6...v12.1.7)
* Refactor `updateKeycloakUser` to use `ky.put` instead of `api.put`, because updating current user data requires setting `x-okapi-tenant` to the current tenant. Fixes UIU-3383.

## [12.1.1] (https://github.com/folio-org/ui-users/tree/v12.1.1) (2025-03-26)
[Full Changelog](https://github.com/folio-org/ui-users/compare/v12.1.0...v12.1.1)

* Fetch all role records for each tenant in order to sort `assignedRoleIds` alphabetically by role name in UserEdit. Refs UIU-3355.

## [12.1.0](https://github.com/folio-org/ui-users/tree/v12.1.0) (2025-03-18)
[Full Changelog](https://github.com/folio-org/ui-users/compare/v12.0.0...v12.1.0)

* Fetch roles from all affiliations to set the baseline in `initialAssignedRoleIds` and add/subtract in `assignedRoleIds` so react-final-form can make a proper comparison. Refs UIU-3331.
* Refactor `updateUserRoles` to await all promises before closing the edit view. Refs UIU-3333.
* Rename user details actions buttons and change order. Refs UIU-3121.

## [12.0.0](https://github.com/folio-org/ui-users/tree/v12.0.0) (2025-03-13)
[Full Changelog](https://github.com/folio-org/ui-users/compare/v11.0.12...v12.0.0)

* `useUserTenantRoles` supplies `tenantId` in all its queries. Refs UIU-3279.
* Leverage API supported sorting of columns on pre-registrations records list. Refs UIU-3249.
* Fix issue with `Proxy borrower` field value. Refs UIU-3290.
* Remove duplicates from the keyboard shortcut modal. Refs UIU-3026.
* React v19: refactor away from default props for functional components. Refs. UIU-3141.
* Hide Create block button for user without permission. Refs UIU-3300.
* Add HTML page title to add/edit patron block page. Refs UIU-3302.
* Update fee/fine actions column UX for accessibility. Refs UIU-3027.
* Change import of `exportToCsv` from `stripes-util` to `stripes-components`. Refs UIU-3202.
* Provide `itemToString` to create unique `key` attributes. Refs UIU-3312.
* Return appropriate error message when item for manual fee/fine can't be found. Refs UIU-2701.
* *BREAKING* Add `pronouns` field to user edit form. Refs UIU-3119.
* Add `pronouns` field to user view form. Refs UIU-3118.
* Pronouns Field - add Character Limit Warning. Refs UIU-3324.
* Add ability to create/edit role assignments for all of a user's affiliations. Refs UIU-3179.
* Implement support for loans without item information. Refs UIU-2531.
* *BREAKING* Migrate stripes dependencies to their Sunflower versions. Refs UIU-3327.
* *BREAKING* Migrate react-intl to v7. Refs UIU-3328.
* New fields are included when printing a due-date receipt, e.g. `{{item.physicalDescriptions}}`. Fixes UIU-3332.
* Hide an affiliation accordion for system users. Refs UIU-3308.
* Ensure user detail page updates with latest roles after adding/removing roles. Refs UIU-3333.
* Add fallback / optional chaining guard for "Preferred email communications" `itemToString` prop for when `option` is `null` or `undefined`. Refs UIU-3335.
* When viewing the detail page for a reminder fee, show the returned date (if any) of the associated loan. Fixes UIU-3187.
* *BREAKING* Upgrade plugin-find-user to v8. Refs UIU-3342.

## [11.0.14](https://github.com/folio-org/ui-users/tree/v11.0.14) (2025-07-30)
[Full Changelog](https://github.com/folio-org/ui-users/compare/v11.0.13...v11.0.14)
* Add support for use circulation-bff for declare-item-lost. Refs UIU-3414.

## [11.0.13](https://github.com/folio-org/ui-users/tree/v11.0.13) (2025-05-29)
[Full Changelog](https://github.com/folio-org/ui-users/compare/v11.0.12...v11.0.13)
* Use the `circulation-bff-loans` endpoint instead of `circulation/loans` in `LoansListingContainer` and `LoanDetailContainer` to have all tokens for DCB item. Fixes UIU-3392.

## [11.0.12](https://github.com/folio-org/ui-users/tree/v11.0.12) (2025-04-10)
[Full Changelog](https://github.com/folio-org/ui-users/compare/v11.0.11...v11.0.12)

* Add the ability for staff to take a patron's profile picture photo using a webcam. Refs UIU-3266.

## [11.0.11](https://github.com/folio-org/ui-users/tree/v11.0.11) (2025-01-15)
[Full Changelog](https://github.com/folio-org/ui-users/compare/v11.0.10...v11.0.11)

* Rename permission after BE changes. Refs UIU-3309.
* Permission sets detail record view: Description text marked as heading. Refs UIU-2938.

## [11.0.10](https://github.com/folio-org/ui-users/tree/v11.0.10) (2025-01-10)
[Full Changelog](https://github.com/folio-org/ui-users/compare/v11.0.9...v11.0.10)

* Add sub permission `manual-block-templates.collection.get` to permission `Users: Can create, edit and remove patron blocks`. Refs UIU-3305.

## [11.0.9](https://github.com/folio-org/ui-users/tree/v11.0.9) (2024-12-13)
[Full Changelog](https://github.com/folio-org/ui-users/compare/v11.0.8...v11.0.9)

* Add permission to access users-keycloak delete method. Refs UIU-3282.
* Check if userId is present in withUserRoles HOC. Refs UIU-3273.
* Add missed permissions for endpoints used in withUserRoles HOC. UIU-3294.
* Add view/manage roles permissions. Refs UIU-3301.

## [11.0.8](https://github.com/folio-org/ui-users/tree/v11.0.8) (2024-12-10)
[Full Changelog](https://github.com/folio-org/ui-users/compare/v11.0.7...v11.0.8)

* Add missed `circulation-storage.loans.item.get`, `inventory.items.item.get` permissions. Refs UIU-3291.

## [11.0.7](https://github.com/folio-org/ui-users/tree/v11.0.7) (2024-11-30)
[Full Changelog](https://github.com/folio-org/ui-users/compare/v11.0.6...v11.0.7)

* Update permissions for mod-patron. Ref UIU-3259.
* Update permission after BE permission changes. Refs UIU-3288.

## [11.0.6](https://github.com/folio-org/ui-users/tree/v11.0.6) (2024-11-28)
[Full Changelog](https://github.com/folio-org/ui-users/compare/v11.0.5...v11.0.6)

* `useUserTenantRoles` supplies `tenantId` in all its queries. Refs UIU-3279.
* Leverage API supported sorting of columns on pre-registrations records list. Refs UIU-3249.
* Show all patron notice print jobs (not just ten random ones), in correct order. Fixes UIU-3269.

## [11.0.5](https://github.com/folio-org/ui-users/tree/v11.0.5) (2024-11-20)
[Full Changelog](https://github.com/folio-org/ui-users/compare/v11.0.3...v11.0.5)

* Review and cleanup Module Descriptors for ui-users. Refs UIU-3214.
* Change users interface to "16.3". Refs UIU-3275.
* Show all patron notice print jobs (not just ten random ones), in correct order. Fixes UIU-3269.

## [11.0.3](https://github.com/folio-org/ui-users/tree/v11.0.3) (2024-11-14)
[Full Changelog](https://github.com/folio-org/ui-users/compare/v11.0.2...v11.0.3)

* Correctly import from `dompurify`. Refs UIU-3267.

## [11.0.2](https://github.com/folio-org/ui-users/tree/v11.0.2) (2024-11-08)
[Full Changelog](https://github.com/folio-org/ui-users/compare/v11.0.1...v11.0.2)

* If keycloak user record doesn't exist, create it before resetting password. Refs UIU-3236.
* Conditionally use delete method of the `mod-users-keycloak` if `users-keycloak` interface is present in UserRecordContainer. Refs UIU-3234.
* Fix user edit without "Auth-Users" capability sets. Refs UIU-3243.

## [11.0.1](https://github.com/folio-org/ui-users/tree/v11.0.1) (2024-11-08)
[Full Changelog](https://github.com/folio-org/ui-users/compare/v11.0.0...v11.0.1)

* Process more item tokens in due date print. Refs UIU-3239.

## [11.0.0](https://github.com/folio-org/ui-users/tree/v11.0.0) (2024-10-31)
[Full Changelog](https://github.com/folio-org/ui-users/compare/v10.1.2...v11.0.0)

* UX consistency: Use Save & close button label stripes-component translation key. Refs UIU-3078.
* Fix two "triangle down" icons in select element of "Copy existing fee/fine owner table entries" modal. Refs UIU-2929.
* Fix incorrect translation key having count-disagreements in Pay fees/fines modal in Fees/Fines Page. Refs UIU-1097.
* Reading Room Access accordion in User record - Basic Layout. Refs UIU-3096.
* Trim input values and delete properties with empty string when user record save. Refs UIU-2049.
* Update username field validation to trim leading and trailing spaces. Refs UIU-3099.
* Fix "Total paid amount" value that set as "$NaN" on "Refund fee/fine" modal. Refs UIU-3094.
* Validate image url provided as external url for user profile picture. Refs UIU-3080.
* Import and use ProfilePicture Component from stripes/smart-components. Refs UIU-3104.
* Show Roles assigned to users. Refs UIU-3110.
* Add edit user roles accordion on edit role modal view. Refs UIU-3021.
* Wire up with API ability to assign/unassign user roles in UserForm. Refs UIU-3124.
* Fix filter issues in user roles modal. Refs UIU-3124.
* Suppress Settings > Users > Permission sets when `roles` interface is present. Refs UIU-3105.
* Sort user roles alphabetically in `EditUserRoles` and `UserRolesModal` components. Refs UIU-3145.
* Rename isDCBItem function name to isDcbItem. Refs UIU-3020.
* *BREAKING* Add new okapi interface reading-room-patron-permission. Create new permission 'Users: Can view reading room access'. Refs UIU-3116.
* Create new permission 'Users: Can view, and edit reading room access'. Refs UIU-3117.
* Include DCB in 'User Type' search filter group. Refs UIU-3016.
* Displaying Default Reading Room Access in User Records. Refs UIU-3114.
* Implement Reading Room Access functionality in user profile edit. Refs UIU-3115.
* Add HTML page titles for each page in Users Settings. Refs UIU-2935.
* Make dependency on mod-reading-rooms optional. Refs UIU-3146.
* Make Reading Room Filter case insensitive. Refs UIU-3150.
* Improve UX of Reading Room Access accordion selection box in user profile edit. Refs UIU-3151.
* Set Users date format in all date input fields as per Session Locale Settings. Refs UIU-2879.
* Make unblocked fee-fine actions if item is claimed returned and loan is closed. Refs UIU-3125.
* Add the possibility to use "pay" and "waive" fee/fine permissions separately. Refs UIU-3109.
* Use showing/hiding approach for fee/fine action buttons. Refs UIU-3156.
* Support sorting for each column in the Reading Room Access accordion in User Profile Edit. Refs UIU-3132.
* Add the 'Preferred email communication' field in the Contact information accordion of the user profile. Refs UIU-3152.
* Add the 'Print Library Card' action in the Action Menu of User app. Refs UIU-3159.
* Export user details for library card printing. Refs UIU-3163.
* Export profile picture for library card printing. Refs UIU-3160.
* Bump up users okapi interface to 16.2. Refs UIU-3170.
* Fix wrong format of user expiration date in User Edit. Refs UIU-3169.
* Filter options on user input in "Preferred email communications" field in User Edit. Refs UIU-3173.
* Export user details CSV file enhancements. Refs UIU-3175.
* Improve User Profile Picture quality. Refs UIU-3177.
* Update expiration date format in export user details. Refs UIU-3174.
* Success message toast for user details export for library card printing. Refs UIU-3171.
* The interface used for adding patron/staff notes to loans is now optional, and the relevant code guarded with `<IfInterface>`. Fixes UIU-3182.
* Fix date selection in "Expiration Date" Field after clearing expiration date field. Refs UIU-3176.
* Populate the 'Address Type' Field in UserEdit and UserInfo Screen on user creation via edge module. Refs UIU-3180.
* Mark check box column header as non interactive. Refs UIU-2940.
* Populate 'State/Prov./Region', 'Zip/Postal Code', 'Country' Fields on user creation via edge module. Refs UIU-3188.
* Fix issue when slash character in item barcode creates 404 error when adding fee/fine at check in. Refs UIU-3193.
* Fix skipped test cases in LoanDetails.test.js and OwnerSettings.test.js. Refs UIU-3085.
* Leverage `users-keycloak` interface endpoints for user data when available.
* Fix problem with `Reset password email sent` , application points to  bl-users endpoint, even if `users-keycloak` interface provided. Refs UIU-3031.
* Add `users-keycloak` permissions. Refs UIU-3068.
* Omit permissions accordions and queries when `roles` interface is present. Refs UIU-3061, UIU-3062.
* Retrieve user's central-tenant permission from `users-keycloak` endpoints when available. Refs UIU-3054.
* Revert conditional use of the `users-keycloak` interface in UserRecordContainer. Refs UIU-3102.
* Open loans: Print Due date receipt for single open loans. Refs UIU-3208.
* Open loans: Print Due date receipt for multiple open loans. Refs UIU-3209.
* Update `notes` to `v4.0`. Refs UIU-3229.
* Loan details: Print Due date receipt. Refs UIU-3210.
* Open loans: `isDcbItem()` must tolerate sparse data. Refs UIU-3230.
* *BREAKING* Add new okapi interface staging-users. Add action button for searching patrons pre registration records. Refs UIU-3219.
* Display patrons pre registration records results. Refs UIU-3222
* Create new permission 'Users: Can view patron preregistration data'. Refs UIU-3221.
* Omit `assignedRoleIds` field on edit user. Refs UIU-3233.
* Review existing FOLIO user records on duplicates view. Refs UIU-3224.
* Create new permission 'Users: Can merge patron preregistration data'. Refs UIU-3237.
* Confirmation dialog when JIT AuthUser creation is required. Refs UIU-3192.
*  "borrower.patronGroup" print patron group's name based on id. Refs UIU-3228.
* Rename permission names of permissions "Users: Can view reading room access" and "Users: Can view, and edit reading room access".
* Create new user record from preregistration data when no matching folio user is found. Refs UIU-3223.
* Update permission name after Review and cleanup Module Descriptor for ui-checkout. Refs UIU-3216.
* Integrate action to merge preregistration patron record with existing user record. Refs UIU-3225.
* Update translations for pre registrations value. Refs UIU-3241.
* Display a message to a user without permission on the “Patron preregistration record results” page. Refs UIU-3242.
* Display preregistration data appropriately. Refs UIU-3247.

## [10.1.2](https://github.com/folio-org/ui-users/tree/v10.1.2) (2024-09-05)
[Full Changelog](https://github.com/folio-org/ui-users/compare/v10.1.1...v10.1.2)

* Use keywords CQL field for keyword user search. Refs UIU-3184.

## [10.1.1](https://github.com/folio-org/ui-users/tree/v10.1.1) (2024-05-07)
[Full Changelog](https://github.com/folio-org/ui-users/compare/v10.1.0...v10.1.1)

* Allow override for reminder fees with renewal blocked. Refs UICIRC-1077.

## [10.1.0](https://github.com/folio-org/ui-users/tree/v10.1.0) (2024-03-20)
[Full Changelog](https://github.com/folio-org/ui-users/compare/v10.0.4...v10.1.0)

* Also support `feesfines` interface version `19.0`. Refs UIU-2960.
* Disable validation for shadow user. Refs UIU-3000.
* Disable open loan actions for virtual patron. Refs UIU-2964.
* Fix problem with Date field in User app reports does not populate when a first entry was cleared. Refs UIU-2991.
* Hide all actionable buttons on user details pane for DCB Virtual user. Refs UIU-2987.
* Open loan page modifications for a virtual patron. Refs UIU-2988.
* Display item title and barcode as text when the item is dcb virtual item. Refs UIU-2966.
* Fix wrong date in Cash-Drawer-Reconciliation-Report.pdf. Refs UIU-3010.
* Conditionally hide actions on closed loan records for DCB Circulation. Refs UIU-2989.
* Refactor CSS away from `color()` function. Refs UIU-3013.
* Add `reminderFee` to loan action map. Fixes UIU-3014.
* Create new permission 'Users: Can view profile pictures'. Refs UIU-3018.
* Format currency values as currencies, not numbers. Refs UIU-2026.
* Show country name in user address instead of country id. Refs UIU-2976.
* Add patron notice print jobs to action menu. Refs UIU-3029.
* Update sub permissions of permission 'Users: Can view user profiles'. Refs UIU-3038.
* Create new permission 'Users: Can view, edit, and delete profile pictures'. Refs UIU-3025.
* UserInformation in UserDetails to display profile picture. Refs UIU-3011.
* User Record View to display thumbnail image in the absence of profile picture. Refs UIU-3024.
* Enable effective call number column sorting in Open Loans screen. Refs UIU-3002.
* User Information in User Edit to display profile picture and update button set. Refs UIU-3005.
* Update request header for pay several Fees/fines. Refs UIU-3040.
* Use correct field for display remaining in list. Refs UIU-3049.
* Link externally hosted image as user profile picture. Refs UIU-2975.
* Show loading icon until profile picture loads on user detail screen. Refs - UIU-3043.
* Show loading icon until profile picture loads on user edit screen. Refs - UIU-3044.
* Delete profile picture. Refs UIU-3004.
* Changing user type confirmation modal for ECS-enabled environment. Refs UIU-2969.
* Non case-sensitive sorting of title column in Open Loans Screen. Refs UIU-2983.
* Upload Local File for user profile picture. Refs UIU-2974.
* Don't allow to display or upload a profile picture to a shadow account. Refs UIU-3045.
* Compress selected local file before uploading to server as profile picture. Refs UIU-3064.
* ECS - Conceal elements that are not relevant for "Shadow" and "Patron" users. Refs UIU-3056.
* Reset rotation when profile picture upload is canceled. Refs UIU-3071.
* Restrict profile picture upload exceeding max file size from profile picture configuration. Refs UIU-3047.
* Profile Pictures - basic error handling. Refs UIU-3070.
* Add optional chaining in `AddServicePointModal` in order to safely access `assignedServicePoints` from props. Refs UIU-3069.
* Fix lint issues. Refs UIU-3072.

## [10.0.4](https://github.com/folio-org/ui-users/tree/v10.0.4) (2023-11-10)
[Full Changelog](https://github.com/folio-org/ui-users/compare/v10.0.3...v10.0.4)

* Correctly handle optional `X-Okapi-token` request header. Refs UIU-2977.
* Fix bug with Edit form Expand/collapse all shortcuts not working. Refs UIU-2959.
* Update patron groups retrieval in user search to hold `maxUnpagedResourceCount`. Refs UIU-2973.
* Update resourceData and queryParams in `UserSearchContainer.js` to escape special characters in tags filter. Refs. UIU-2995.
* Lost item fees not suspended when item is claimed returned from the ellipses in action menu. Refs UIU-2993.

## [10.0.3](https://github.com/folio-org/ui-users/tree/v10.0.3) (2023-10-23)
[Full Changelog](https://github.com/folio-org/ui-users/compare/v10.0.1...v10.0.3)

* Pass location.search parameter through history search. Refs UIU-2971.

## [10.0.1](https://github.com/folio-org/ui-users/tree/v10.0.1) (2023-10-18)
[Full Changelog](https://github.com/folio-org/ui-users/compare/v10.0.0...v10.0.1)

* Don't display affiliations of users with types `patron` or `dcb`. Refs UIU-2967.
* Make the `username` field required for users with the `staff` type in ECS mode. Refs UIU-2970.

## [10.0.0](https://github.com/folio-org/ui-users/tree/v10.0.0) (2023-10-13)
[Full Changelog](https://github.com/folio-org/ui-users/compare/v9.0.3...v10.0.0)

* Add STATUS FILTER to LOST ITEMS REQUIRING ACTUAL COST processing page. Refs UIU-2748.
* Add "Status" column to LOST ITEMS REQUIRING ACTUAL COST processing page. Refs UIU-2772.
* Add "Lost items requiring actual cost" to Actions dropdown in User details record. Refs UIU-2810.
* Add "Fee/fine details" to LOST ITEMS REQUIRING ACTUAL COST processing page. Refs UIU-2773.
* Fix ability to remove all service points. Fixes UIU-2819.
* Add close button to "Lost items requiring actual cost" page. Refs UIU-2813.
* Fix paths to `StripesContext`. Fixes UIU-2834.
* Support `feesfines` interface version `18.0`. Refs UIU-2825.
* View a users affiliations accordion in the details pane. refs UIU-2821.
* Update Jest from v26 to v29. Refs UIU-2820.
* Get rid of blinking list on lost items page. Refs UIU-2831.
* configure Jest to leverage multi-core CPUs in CI. Refs UIU-2842.
* Add actual cost details to lost items requiring actual cost processing page. Refs UIU-2774.
* Display `expirationDate` based on the current timezone. Refs UIU-2839.
* Assign/unassign users affiliations. Refs UIU-2801.
* View affiliation associated permissions. Refs UIU-2800.
* Confirmation modal for manual anonymization. Refs UIU-1631.
* Fix translations. Refs UIU-2854.
* Fixed bug with certain accordions not closing in edit view. Refs UIU-2811.
* Users: Implement search by middle name. Refs UIU-2860.
* Notify patron checkbox not checked correctly when fee/fine owner has default notice. Refs UIU-2823.
* Show success and Error toasts when Assign/unassign a users affiliations. Refs UIU-2852.
* "ui-users.settings.customfields.view" permission insufficient to view custom fields on user settings. Refs UIU-2863.
* Align affiliation assignment with stripes-core updates (switch active affiliation). Refs UIU-2855.
* Create Jest/RTL test for UserEdit.js. Refs UIU-2426
* Also support `circulation` `14.0`. Refs UIU-2858.
* Import `@testing-library` deps from `jest-config-stripes`. Refs UIU-2866.
* Also support `request-storage` `6.0`. Refs UIU-2875.
* New permissions for adding Patron Info and Staff Info to loans. Fixes UIU-2865.
* In Loan Details record, add buttons for adding patron info and staff info. Fixes UIU-2816.
* In Loan Details record, display of patron info. Fixes UIU-2817.
* In Loan Details record, display of staff info. Fixes UIU-2818.
* Create tests for adding patron/staff info. Fixes UIU-2868.
* Add/Edit a users permissions for associated affiliation(s). Refs UIU-2805.
* New permission(s) to view all Users settings in UI. Refs UIU-2784.
* Unassigning banner should not be displayed at top of "Assign / Unassign affiliation" modal. Refs UIU-2876.
* Add user access to all feefines-related entries in settings if user has "...all feefines-related entries" perm. Refs UIU-2881.
* Do not publish CI artifacts (e.g. test coverage) to NPM.
* Make Limit menu visible if user has "ui-users.settings.limits.all" permission. Refs UIU-2880.
* In loan history, older staff notes should NOT be marked as "SUPERSEDED". Fixes UIU-2891.
* Create Jest/RTL test for BlockTemplateForm.js. Refs UIU-2402.
* create Jest/RTL test for BlockTemplates.js. Refs UIU-2379.
* Users with view-only access to user permissions and access to edit user records get error message when saving a user record. Refs UIU-2885.
* Use new WSAPI for adding patron/staff notes to loans. Fixes UIU-2893. **Note.** The new requirement of the `add-info` interface is a breaking change.
* Modify add-patron/staff-info permission to use new subpermission. Fixes UIU-2895.
* Move view/assign affiliation permissions from `ui-users` to `ui-consortia-settings`. Refs UIU-2897.
* Handle sparse data in "Overdue loans report". Fixes UIU-2901.
* Update translations text for permission.settings.manual-charges.all. Fixes UIU-2908.
* Rename user setting permissions disaplay name and update their visibility. Refs UIU-2907.
* Cleanup User Settings permissions – Part 1. Refs UIU-2906
* Prevent editing of shared settings from outside "Consortium manager". Refs UIU-2914.
* User settings > Fee/fine section: Disable editing for users with "Setting (Users): View all settings" permission. Refs UIU-2904.
* Add info about reminder fees to loan details screen. Refs UIU-2591.
* Add info about reminder fees to loan history. Refs UIU-2590.
* Replace `word-wrap` (unmaintained) with `@aashutoshrathi/word-wrap`, a fork, to mitigate CVE-2023-26115.
* Convert primary search listing to use prev/next pagination vs load-more pagination. Refs UIU-2870.
* Add permisson check to edit Patron block conditions in user settings. Refs UIU-2911.
* Add permissions check to edit Limits in user settings. Refs. UIU-2912.
* Restrict edit of Patron Block Templates in settings based on permissions check. UIU-2913.
* User settings > Comment required: Disable editing for users with "Setting (Users): View all settings" permission. Refs UIU-2905.
* Add permission checks to address types, patron groups pages to restrict edit. Refs. UIU-2902.
* Hebis: Modify "Overdue Loans Report" to include reminder fee information. Refs. UIU-2588.
* Display assigned users accordion on Permission set. Refs UIU-2872.
* Add support for `request-storage` version `6.0` for `<UserRequests>`. Refs UIU-2920.
* Add permisison checks to restrict edit on Manual charges settings page. Ref. UIU-2903.
* Clean up setting.transfertypes permissions. Refs UIU-2919.
* Add permission check to restrict edit of transfer account page on user settings. Refs UIU-2910.
* Leverage cookie-based authentication in all API requests. Refs UIU-2746.
* Assign/unassign users from Permission set. Refs UIU-2873.
* Add serach filters to path while navigating back to user preview screen, when cancelling user edit. Refs. UIU-2928
* ECS - Check username uniqueness when editing. Refs UIU-2889.
* Update Node.js to v18 in GitHub Actions. Refs. UIU-2927.
* Add PULL_REQUEST_TEMPLATE.md file to the repository. Refs. UIU-2918.
* Adjust `loans.staffInfoDialogBody` translation. Refs. UIU-2922.
* *BREAKING* Upgrade React to v18. Refs-UIU-2921.
* ECS - Do not display shadow users in search results. Refs UIU-2933.
* User can't pay the fee/fine. Refs UIU-2930.
* Sort proxies and sponsors by user display name. Refs UIU-2799.
* Add dropdown to specify user type: Patron or Staff. Refs UIU-2936.
* *BREAKING* bump `react-intl` to `v6.4.4`. Refs UIU-2946.
* Generate "Create request" url for users without barcode. Refs UIU-2869.
* Add auto focus to textarea on staff and patron info modal. Fixes UIU-2932.
* ECS - Filter users by "User Type". Refs UIU-2943.
* Users App: Consume {{FormattedDate}} and {{FormattedTime}} via stripes-component. Refs UIU-1860.
* ECS - Prevent editing of specific shadow user data. Refs UIU-2951.
* Relabel "Users: Can create new user" to "Users: Can create and edit users". Refs UIU-2955.
* Assign/unassign a users affiliations adjustments. Refs UIU-2942.
* ECS - Prevent editing of specific shadow user data. Refs UIU-2951.
* Fix user can not renew the loan through the override. Refs UIU-2948.

## [9.0.3](https://github.com/folio-org/ui-users/tree/v9.0.3) (2023-03-31)
[Full Changelog](https://github.com/folio-org/ui-users/compare/v9.0.2...v9.0.3)

* A result is not displayed in list of permissions after clicking on the 'Search' button. Refs UIU-2835.

## [9.0.2](https://github.com/folio-org/ui-users/tree/v9.0.2) (2023-03-29)
[Full Changelog](https://github.com/folio-org/ui-users/compare/v9.0.1...v9.0.2)

* Fix permission error when viewing fees/fines for payment. Refs UIU-2824.

## [9.0.1](https://github.com/folio-org/ui-users/tree/v9.0.1) (2023-03-28)
[Full Changelog](https://github.com/folio-org/ui-users/compare/v9.0.0...v9.0.1)

* Fix problem with remaining amount (not shown correct value after filling the payment amount). Refs UIU-2812.
* Correctly handle removing all permissions from given user. Fixes UIU-2822.

## [9.0.0](https://github.com/folio-org/ui-users/tree/v9.0.0) (2023-02-20)
[Full Changelog](https://github.com/folio-org/ui-users/compare/v8.1.0...v9.0.0)

* Implement modal windows for BILL ACTUAL COST and DO NOT BILL. Refs UIU-2714.
* create Jest/RTL test for UserDetail.js. Refs UIU-2421
* Fix problem with displaying suspended claim returned fees/fines. Refs UIU-2726.
* Adjust permissions in order to see the link to open request queue. Fixes UIU-2661.
* Fix systems error when attempting to create a new fee/fine if logged in user isn't logged into a service point. Refs UIU-2728.
* Disable 'Claimed return' button after click to prevent multiple submissions. Refs UIU-2732.
* Cover Actual cost functionality by jest/RTL tests. Refs UIU-2727.
* Fix problem with Fee/Fine list loading. Refs UIU-2735.
* Refactor code for disable 'Declare lost' button after click to prevent multiple submissions. Refs UIU-2736.
* Implement searching for "Lost items requiring actual cost" page. Refs UIU-1866.
* Implement "Bill actual cost" functionality. Refs UIU-1863.
* Add new interface version to "request-storage". Refs UIU-2749.
* Create/Edit Patron Block: Move Save & close button to the footer pane. Refs UIU-1698.
* In Settings > Users > Patron Blocks > Conditions, mark "Message to be displayed" as required. Refs UIU-2487.
* Enable dependabot. Refs UIU-2747, FOLIO-3664.
* Suppress delete of users stored in a configuration entry. Refs UIU-2738.
* Remove BigTest infrastructure including tests, deps, config. Refs UIU-2745.
* Add support for `request-storage` version `5.0` for `<UserRequests>`. Refs UIU-2765.
* Implement "Do not bill actual cost" functionality. Refs UIU-2705.
* *BREAKING* Upgrade to `@folio/stripes` `v8`. Refs UIU-2761.
* *BREAKING* Upgrade `react-redux` to `v8`. Refs UIU-2775.
* Create Jest/RTL test for UserDetailFullscreen.js. Refs UIU-2429.
* Add support for checkbox custom field filter. Fixes UIU-2759.
* Use `updateUser` from `@folio/stripes-core` to update service-point data. Refs UIU-2788.
* Show correct service points when navigating among users. Refs UIU-2790.
* Make unavailable "Refund" option for cancelled fee/fine that was already refunded. Refs UIU-2700.
* Fix problem with additional information comment that can't be added after a page reload. Refs UIU-2794.
* Allow proxy/sponsor lists to be emptied completely. Refs UIU-2804.
* Show an error if the proxy record is corrupt, instead of an NPE. Refs UIU-2803.
* Create Jest/RTL test for LoanDetails.js. Refs UIU-2428.

## [8.2.0](https://github.com/folio-org/ui-users/tree/v8.2.0) (2022-10-24)
[Full Changelog](https://github.com/folio-org/ui-users/compare/v8.1.0...v8.2.0)

* Spread out the fields on the new Fee/Fine modal. Fixes UIU-2620.
* Accurately count open-loans when there are > 1000. Refs UIU-2631.
* Fine detail page throws an error if item is missing. Refs UIU-2505.
* After new fee/fine charged at Check-in, unable to get to Users app. Refs UIU-2626.
* "Remaining amount" doesn't have the correct value when the field "Payment amount" is emptied. Refs UIU-2644.
* Support `notes` interface version `3.0`. Refs UIU-2647.
* Confirm button is not disabled after the click and each click on this button sends the request to the server. Refs UIU-2645.
* When formatting names, correctly treat empty-strings as missing. Refs UIU-2610.
* Additional updates to Pop-up note Refs UIU-2653
* Modify error message when a Fee/Fine Owner enters a Fee/Fine Type that is duplicated by "Shared" Fee/Fine Owner. Refs UIU-2560.
* Correctly import from `stripes/core` not `stripes-core`. Refs UIU-2642.
* Create permission for "Lost items requiring actual costs" processing page. Refs UIU-2491.
* Add decimal places for "Fees/fines incurred" column on "Loan History" page. Refs UIU-2236.
* Add selected actual service points to "Financial Transaction Detail Report" title line. Refs UIU-2666.
* Fix issue with Qindex select automatically triggering the search on change. Refs UIU-2665.
* create Jest/RTL test for NoteEditPage.js. Refs UIU-2424
* Clear Fee/Fine Type error message after changing owner. Refs UIU-2670.
* Bump `users` interface to version `16.0`. Refs UIU-2648.
* Update `permUserId` before updating permissions. Fixes UIU-2672.
* Fix broken link to item in export fees fines report. Refs UIU-2540.
* Make visible loan history for deleted users. UIU-2659.
* Leverage `yarn.lock`. UIU-2688.
* List of items for lost items requiring actual cost. Refs UIU-1382.
* Lost items requiring ACTUAL COST: Implement additional information in 'Instance' column. Refs UIU-1871.
* Lost items requiring ACTUAL COST: Implement additional information in 'Patron' column. Refs UIU-1870.
* Add permissions for lost items page. Refs UIU-2690.
* Fix sorting by "Patron" column on the "Lost items requiring actual cost" page. Refs UIU-2691.
* A long Instance title climbs out of popover boundaries on the "Lost items requiring actual cost" page. Refs UIU-2693.
* Fix validation regression on user form. Fixes UIU-2696.
* Remove password validation from `<UserForm>`. Fixes UIU-2697.

## [8.1.0](https://github.com/folio-org/ui-users/tree/v8.1.0) (2022-06-27)
[Full Changelog](https://github.com/folio-org/ui-users/compare/v8.0.0...v8.1.0)

* Increase limit for servicePoints query in `<AccountDetailsContainer>`. Fixes UIU-2544.
* Replace `onChange` with `onClick` when checkbox is clicked on MCL row. Fixes UIU-2543.
* Correctly import from `stripes-components` via `@folio/stripes`. Refs UIU-2173.
* Missing interface dependency: tags. Fixes UIU-2557.
* Error message "Enter comment" appears erroneously when entering New Staff Info on Fee/Fine Details. Refs UIU-2569.
* Edit User Record: Using Enter key should Open Add Service points when focus is on the Add Service points button. Refs UIU-1256.
* Fix inaccurate request counts in various open loan views & modals. Fixes UIU-2570, UIU-2574.
* Users manipulating permissions sets need access to all permissions. Refs UIU-2563.
* Provide missing Fee/fine settings permissions. Refs UIU-2572.
* Don't show fee/fine actions for users without permissions. Fixes UIU-2467.
* Increase record limit for manual-block-templates and add different path for get. Refs UIU-2577.
* Open/Closed Loans toggle: Screenreader does not read which toggle option is active. Refs UIU-1986.
* Remove react-hot-loader. Refs UIU-2567.
* Guard against missing loan item record. FIXES UIU-2578.
* Update permissions for linking to fine details in `<LoanDetails>`. Refs UIU-2481.
* Add loans anonymized message with count of loans not anonymized. Refs UIU-2246.
* Remove unused `usersPerGroup` manifest from `<PatronGroupsSettings>`. Fixes UIU-2602.
* Search results with a single hit should automatically open the detail view. Fixes UIU-2601.
* Create Jest/RTL test for ActionsDropdown.js. Refs UIU-2331
* Create Jest/RTL test for PasswordControl. Refs UIU-2300.
* Create Jest/RTL test for CustomFieldsSettings. Refs UIU-2386.
* Create Jest/RTL test for NoteCreatePage.js. Refs UIU-2423.
* Fix Patron blocks settings order. Refs UIU-2448.
* Update NodeJS to Active LTS. Refs UIU-2607.
* Use single formatted message for successfully callout message. Refs UIU-1657.
* Create Jest/RTL test for DepartmentsNameEdit.js. Refs UIU-2326.
* Fee/fine amount unexpectedly resets on manual charge form. Refs UIU-2600.
* Allow fee/fine to be cancelled if remaining balance equals billed amount. Refs UIU-2609.
* Unpin `moment` from `~2.24.0` and move it to peer. Refs UIU-1900.
* Create Jest/RTL test for OpenLoansSubHeader.js. Refs UIU-2340.
* create Jest/RTL test for ClosedLoans.js. Refs UIU-2345
* Get rid of console error if there is no `renewals`. Refs UIU-2603.
* create Jest/RTL test for src/components/Accounts/Filters. Refs UIU-2356.
* Handle time zone issues in user info date displays. Fixes UIU-2623.
* User should be directed to the last open page when working in more than one browser. Refs UIU-2605.
* create Jest/RTL test for NoteCreatePage.js. Refs UIU-2423.

## [8.0.0](https://github.com/folio-org/ui-users/tree/v8.0.0) (2022-03-17)
[Full Changelog](https://github.com/folio-org/ui-users/compare/v7.1.0...v8.0.0)

* *BREAKING* Require okapi interface `permissions` `5.5` for permission-assignment permissions. Refs UIU-2549.
* Happy St. Patrick's Day

## [7.1.0](https://github.com/folio-org/ui-users/tree/v7.1.0) (2022-03-03)
[Full Changelog](https://github.com/folio-org/ui-users/compare/v7.0.1...v7.1.0)

* Correctly show fee/fine for users without `ui-users.accounts` permission. Refs UIU-2446.
* Create Jest/RTL test for `RequestFeeFineBlockButtons`. Refs UIU-2287.
* Restrict `loans.all` permissions. Refs UIU-2256.
* Create Jest/RTL test for `withProxy`. Refs UIU-2315.
* Fix the oldest manual Patron block is always removed first. Refs UIU-2442.
* Do not label fees without loans as "Anonymized". Refs UIU-2449.
* Fix FeeFineAction and FeeFineCharge notice templates not appearing in Manual Charges settings. Refs UIU-2452.
* Fix the issue when fee/fine details doesn't open up in loans. Refs UIU-2459.
* Fix the issue when fee/fine is partially paid, then refunded, User Details show the full amount of the fee/fine as refunded. Refs UIU-2455.
* Fix the issue when a fee/fine is refunded due to a CLAIMED RETURNED, the refund amount does not appear in User Details. Refs UIU-2469.
* Correctly check permissions for accounts routes. Refs UIU-2474.
* Search operates on custom fields. Refs UIU-2165.
* Refactor from `<SafeHTMLMessage>` to `<FormattedMessage>`. Refs UIU-2179.
* Reset offset when sort values change. Fixes UIU-2466.
* Prompt if changing permissions will remove those with `visible: false`. Refs UIU-2409.
* Unassign all permissions from a user with one click. Refs UIU-2477.
* Use supported `uuid`. Refs UIU-2488.
* Do not push to history if the url didn't change. Fixes UIU-2490.
* Also support `circulation` `12.0`. Refs UIU-2480.
* Also support `request-storage` `4.0` (TLR). Refs UIU-2495, UIU-2480.
* Fix problems with permissions for claim returned, renewals. Refs UIU-2256.
* Settings > Users > change focus. Refs UIU-2036.
* Add custom fields filters. Refs UIU-2170.
* Properly show service point name in fee/fine details. Fixes UIU-2473.
* Suppress edit of users stored in a configuration entry. Refs UIU-2499.
* Also support `circulation` `13.0`. Refs UIU-2483.
* Fix unexpected increase of fee/fine remaining balance. Refs UIU-2506.
* Correct calculation for expiration date. Refs UIU-2498.
* Preserve invisible permissions during edit. Fixes UIU-2075.
* Column selector dropdown does not match column headings. Refs UIU-2504.
* Fee/Fine Type not showing/saving for first manual fee/fine created. Refs UIU-2508.
* Add Jest/RTL tests for `CommentModal` business logic in `FeeFineActions` component. Refs UIU-2515.
* Add `limit` clauses to `withRenew` queries to enable retrieval of more than 10 records. Refs UIU-2520.
* Accessibility: Document has multiple static elements with the same ID attribute. Refs UIU-1688.
* Preserve search filters during user edit. Fixes UIU-2484.
* Retrieve up to 50 proxies/sponsors. Refs UIU-2510.
* Open Loans List: Form does not include label. Refs UIU-1638.
* Accessibility: Headings must not be empty. Refs UIU-1695.
* Prevent duplication of permissions in `<PermissionsModal>` and related logic. Fixes UIU-2486, UIU-2496.
* Add Service Point modal: Ensure every form element has label. Refs UIU-1699.
* Create/Edit Patron Blocks: Required fields are not using the right prop and cannot be read by screenreader. Refs UIU-1688.
* Display preferred name in the search result. Refs UIU-2500.
* Display preferred name in the header and body of the user record. Refs UIU-2501.
* Display preferred name in the top of the edit view of the user record. Refs UIU-2502.
* Newly Created Address Record Should be In Focus. Refs UIU-1161.
* Keyboard Navigation: Accessing open loans/closed loans list : Initial focus should be on an element on the page. Refs UIU-1257.
* Accessibility: Form elements must have labels. Refs UIU-1686.

## [7.0.1](https://github.com/folio-org/ui-users/tree/v7.0.1) (2021-10-07)
[Full Changelog](https://github.com/folio-org/ui-users/compare/v6.1.0...v7.0.1)

* Update local babel config to handle new JSX transform. Refs UIU-2190.
* Delete user with check for open transactions. Refs UIU-1971.
* Prevent fetching resource delUser Refs UIU-2191.
* Delete user through UI: change dialog text for no open transactions. Refs UIU-2192.
* Delete user confirmation message. Refs UIU-2193.
* Comment icon is missing again on Fee/Fine History page. Refs UIU-2185.
* Add `resourceShouldRefresh` to `permissions` resource to refresh permissions. Fixes UIU-2183.
* Add modal for `Financial transactions detail report`. Refs UIU-1960.
* The `date picker` for report modals is cut off and user is not able select date. Refs UIU-2204.
* Shared manual fees/fines not showing up for new fee/fine owner. Refs UIU-2208.
* Create `Financial transactions detail report`. Refs UIU-1962.
* Add translations for Custom fields. Refs UIU-2210.
* Error window when opening or saving user data. Fixes UIU-2212.
* Omit empty `username` during user creation. Fixes UIU-2214.
* Fix `Total owed amount`/`Total paid amount` on `Fee/Fine Details`. Refs UIU-2211.
* Whitespace should not mark loan-action forms dirty. Refs UIU-2227.
* Default notice not sent to patron when Transfer done in one of the three ways. Refs UIU-2215.
* Hide Department label in User's Detail and Edit views if there are no depts set up in Settings. Refs UIU-2012.
* Disable renewals for inactive users. Fixes UIU-2229.
* Fix Export of fees/fines. Refs UIU-2209.
* `Financial transactions detail report:` date with empty value columns says "Unix Epoch". Refs UIU-2239.
* Make sure users module builds with `babel-plugin-lodash` present. Fixes UIU-2228.
* Show dates in local time when generating CSV reports. Fixes UIU-2224.
* Fix user Departments value is not visible in the user view. Fixes UIU-2238.
* Filter out non existing service points. Fixes UIU-2245.
* Fix hyperlink in `Financial transactions detail report`. Refs UIU-2217.
* Fix hyperlink with missing `Patron barcode`. Refs UIU-2242.
* Fix `Invalid date` for `Financial transaction detail report`. Refs UIU-2251.
* Support `feesfines` interface version `17.0`. Refs UIU-2248.
* Update sub permissions in `ui-users.edituserservicepoints` permission set. Fixes UIU-2244.
* Replace `babel-eslint` with `@babel/eslint-parser`; import global babel config. Refs UIU-2253, UIU-2254.
* Automatic fees/fines are appearing in New Fee/Fine `Fee/fine type` drop-down. Refs UIU-2411.
* Remove unused permission set. Fixes UIU-2247.
* Don't choke when editing minimal user object. Fixes UIU-2435.
* Patron groups displayed as Patron block LIMITS are not in same 'case' as actual Patron groups. Fixes UIU-1763.
* Change setting "Patron block templates" to "Templates". Refs UIU-2412.
* Add Contributors field to account request. Refs UIU-2203.
* Increment stripes to v7. Refs UIU-2250.
* Create Jest/RTL test for BulkRenewedLoansList. Refs UIU-2259.
* Fix issue when `refund` button became inactive before the user was returned entire amount of money. Refs UIU-2438.
* Display `contributors name` consistent with other modules. Refs UIU-2440.
* Create Jest/RTL test for `OpenLoans`. Refs UIU-2314.
* Create Jest/RTL test for `contactTypes`. Refs UIU-2368.
* Create Jest/RTL test for `withMarkAsMissing`. Refs UIU-2265.
* create Jest/RTL test for `PermissionSetForm.js` . Refs UIU-2407.
* Create Jest/RTL test for `ActionsBar`. Refs UIU-2301.
* Fix issue User Information page 'Patron block' accordion should be open if patron block exists and closed if not. Refs UIU-1996.
* Create Jest/RTL test for `LimitsSettings`. Refs UIU-2392.
* Create Jest/RTL test for `PermissionsModal`. Refs UIU-2365.
* Create Jest/RTL test for `ModalContent`. Refs UIU-2284.
* Create Jest/RTL test for `filtersConfig`. Refs UIU-2354.
* Create Jest/RTL test for `FeeFineReport`. Refs UIU-2294.
* Create Jest/RTL test for `refundTransferClaimReturned`. Refs UIU-2332.
* Create Jest/RTL test for `PatronBlockMessage`. Refs UIU-2296.
* Create Jest/RTL test for `PermissionLabel`. Refs UIU-2330.
* Create Jest/RTL test for `PermissionSets`. Refs UIU-2383.
* Create Jest/RTL test for `RenderPermissions`. Refs UIU-2267.
* Create Jest/RTL test for `PermissionSetDetails`. Refs UIU-2394.
* Create Jest/RTL test for `PermissionsList`. Refs UIU-2374.
* Create Jest/RTL test for `ProxyPermissions`. Refs UIU-2275.
* Create Jest/RTL test for `UserPermissions`. Refs UIU-2303.
* Create Jest/RTL test for `Owners`. Refs UIU-2408.
* Create Jest/RTL test for `Modals`. Refs UIU-2323.
* Create Jest/RTL test for `BulkClaimReturnedModal`. Refs UIU-2317.
* Create Jest/RTL test for `PatronBlockModalWithOverrideModal`. Refs UIU-2370.
* Create Jest/RTL test for `PatronBlockModal`. Refs UIU-2278.
* Create Jest/RTL test for `OverrideModal`. Refs UIU-2358.
* Create Jest/RTL test for `OwnerSettings`. Refs UIU-2406.
* Create Jest/RTL test for `PaymentSettings`. Refs UIU-2389.
* Create Jest/RTL test for `FeeFineSettings`. Refs UIU-2378.
* Create Jest/RTL test for `ActionModal`. Refs UIU-2286.
* Create Jest/RTL test for `ErrorModal`. Refs UIU-2318.
* Create Jest/RTL test for `WithCopyModal`. Refs UIU-2268.
* Create Jest/RTL test for `CancellationModal`. Refs UIU-2342.
* Create Jest/RTL test for `CommentModal`. Refs UIU-2280.
* Create Jest/RTL test for `ResetPasswordModal`. Refs UIU-2359.
* Create Jest/RTL test for `CreatePasswordModal`. Refs UIU-2355.
* Create Jest/RTL test for `CreateResetPasswordControl`. Refs UIU-2262.
* Create Jest/RTL test for `CheckboxColumn`. Refs UIU-2261.
* Create Jest/RTL test for `RefundsReportModal`. Refs UIU-2308.
* Create Jest/RTL test for `WarningModal`. Refs UIU-2336.
* Create Jest/RTL test for `CopyModal`. Refs UIU-2385.
* Create Jest/RTL test for `PatronBlock`. Refs UIU-2337.
* Create Jest/RTL test for `ContributorsView`. Refs UIU-2367.
* Create Jest/RTL test for `patronBlocks`. Refs UIU-2290.
* Create Jest/RTL test for `ProxyItem`. Refs UIU-2274.
* Create Jest/RTL test for `isOverridePossible`. Refs UIU-2293.
* Create Jest/RTL test for `CsvReport`. Refs UIU-2291.
* Create Jest/RTL test for `asyncValidateField`. Refs UIU-2271.
* Create Jest/RTL test for `PatronGroupNumberOfUsers`. Refs UIU-2272.
* Create Jest/RTL test for `EditProxy`. Refs UIU-2285.
* Create Jest/RTL test for `AddServicePointModal`. Refs UIU-2266.
* Create Jest/RTL test for `OpenLoansWithStaticData`. Refs UIU-2263.
* Create Jest/RTL test for `ChargeForm`. Refs UIU-2260.
* Create Jest/RTL test for `withDeclareLost`. Refs UIU-2277.
* Create Jest/RTL test for `BulkRenewInfo`. Refs UIU-2262.
* Create Jest/RTL test for `BulkRenewalDialog`. Refs UIU-2309.
* Create Jest/RTL test for `BulkOverrideDialog`. Refs UIU-2295.
* Create Jest/RTL test for `ChargeForm`. Refs UIU-2260.
* Create Jest/RTL test for `BulkOverrideLoansList`. Refs UIU-2328.
* Create Jest/RTL test for `BulkOverrideInfo`. Refs UIU-2320.
* Create Jest/RTL test for `Menu`. Refs UIU-2357.
* Create Jest/RTL test for `memoize`. Refs UIU-2338.
* Create Jest/RTL test for `withServicePoints`. Refs UIU-2279.
* Create Jest/RTL test for `ErrorPane`. Refs UIU-2339.
* Create Jest/RTL test for `BulkOverrideInfo`. Refs UIU-2320.
* Create Jest/RTL test for `UserAddresses`. Refs UIU-2305.
* Create Jest/RTL test for `ConditionsForm`. Refs UIU-2382.
* Create Jest/RTL test for `Conditions`. Refs UIU-2405.
* Create Jest/RTL test for `getListPresentation`. Refs UIU-2298.
* Create Jest/RTL test for `getListDataFormatter`. Refs UIU-2351.
* Create Jest/RTL test for `UserInfo`. Refs UIU-2351.
* Create Jest/RTL test for `LimitsForm`. Refs UIU-2391.
* Create Jest/RTL test for `Limits`. Refs UIU-2399.
* Create Jest/RTL test for `UserRequests`. Refs UIU-2306.
* Create Jest/RTL test for `HelperApp`. Refs UIU-2310.
* Create Jest/RTL test for `constants`. Refs UIU-2316.
* Create Jest/RTL test for `getInitialFiltersState`. Refs UIU-2324.
* Create Jest/RTL test for `SearchForm`. Refs UIU-2329.
* Create Jest/RTL test for `Label`. Refs UIU-2327.
* Create Jest/RTL test for `getProxySponsorWarning`. Refs UIU-2321.
* Create Jest/RTL test for `constants`. Refs UIU-2325.
* Create Jest/RTL test for `EditUserInfo`. Refs UIU-2292.
* Create Jest/RTL test for `settings`. Refs UIU-2344.
* Create Jest/RTL test for `util`. Refs UIU-2304.
* Create Jest/RTL test for `UserAccounts`. Refs UIU-2346.
* Create Jest/RTL test for `UserServicePoints`. Refs UIU-2335.
* Create Jest/RTL test for `LoanActionDialog`. Refs UIU-2302.
* Create Jest/RTL test for `withFormValues`. Refs UIU-2349.
* Create Jest/RTL test for `EditContactInfo`. Refs UIU-2343.
* Create Jest/RTL test for `EditExtendedInfo`. Refs UIU-2299.
* Create Jest/RTL test for `RefundReport`. Refs UIU-2350.
* Create Jest/RTL test for `accountFunctions`. Refs UIU-2334.
* Create Jest/RTL test for `loanActionMap`. Refs UIU-2333.
* Create Jest/RTL test for `OpenLoansControl`. Refs UIU-2347.
* Create Jest/RTL test for `CommentRequiredForm`. Refs UIU-2381.
* Create Jest/RTL test for `PatronBlockForm`. Refs UIU-2353.
* Create Jest/RTL test for `PatronBlockLayer`. Refs UIU-2361.
* Create Jest/RTL test for `withClaimReturned`. Refs UIU-2352.
* Create Jest/RTL test for `navigationHandlers`. Refs UIU-2369.
* Create Jest/RTL test for `ItemInfo`. Refs UIU-2363.

## [6.1.0](https://github.com/folio-org/ui-users/tree/v6.1.0) (2021-06-18)
[Full Changelog](https://github.com/folio-org/ui-users/compare/v6.0.0...v6.1.0)

* Configure Jest/RTL. Refs UIU-2112.
* Show user-readable message when user is not found. Fixes UIU-2081.
* Fix Custom Fields error message by adding a missing permission. Fixes UIU-2104.
* Add changes to indicate clickable for cursor. Refs UIU-2052.
* Migrate from string notation to column mapping for PatronBlock. Refs UIU-2091.
* Add Cash Drawer Reconciliaton report & Financial transactions detail report permissions to reports. Refs UIU-2088.
* Add new fee/fine reports as options to User Actions drop-down. Refs UIU-2083.
* Show claimed returned report only if user has necessary permission. Refs UIU-1884.
* Fix Note Edit Page - doesn't return to record page after click on `Save&Close`. Fixes UIU-2087.
* Fix Notify patron box behavior for New fee/fine when default patron notice is set. Refs UIU-2111.
* Close "New fee/fine" page after fee/fine created. Refs UIU-2117.
* Fix disabling "Save & close" button for Manual patron block. Refs UIU-2123.
* Fix the possibility of create manual patron block with expiration date of today. Refs UIU-2122.
* Fix permission error for "Refunds to Process Manually" report. Refs UIU-2126.
* Also support `circulation` `10.0`. Refs UIU-2135.
* Show the "Refunds to process manually" report conditionally based on permissions. Refs UIU-2125.
* Fetch some search container routes conditionally based on permissions. Refs UIU-2132.
* Handle search of ASTified translation values. Refs UIU-2142.
* Fix optional dependencies to be actually optional and add a few. UIU-2140.
* Include missing `limit` clause in request-count query. Refs UIU-2143.
* Replace local KeyboardShortcutsModal component with import. Refs UIU-2151.
* Clean up prop-types that generate bogus console warnings. Refs UIU-2158.
* Provide useful `aria-label` values to loan action (ellipses) menues. Refs UIU-1635.
* Allow a user to assign an existing permission set to a permission set. Refs UIU-1630.
* Add permissions type filter to users settings permissions sets. Refs UIU-2164.
* Avoid querying for an empty list of loan policies. Refs UIU-2163.
* Show `Pop-up on User` and `Pop-up on Checkout` fields to Notes forms. Refs UIU-2155.
* Show loading indicator on Loans details screen. Fixes UIU-2120.
* Add type column to users settings permissions sets. Refs UIU-2167.
* Add modal for 'Cash drawer reconciliation report'. Refs UIU-1959.
* Provide `key` when rendering list elements. Refs UIU-2168.
* Create 'Cash drawer reconciliation report' in PDF format. Refs UIU-2084.
* Create 'Cash drawer reconciliation report' in CSV format. Refs UIU-1961.
* Migrate to `renew-by-barcode`. Refs UIU-2096.
* Move Tenant/Bursar exports to Users/Transfer criteria. Refs UIU-2098.
* Add possible for enter correct values for Fee/Fine amount. Refs UIU-2156.
* Added `NotePopupModal` to User Details page. Refs UIU-2008.
* Fix selecting current fee fine type. Refs UIU-2157.
* Fix validation error with END DATE for `Cash drawer reconciliation report` modal. Refs UIU-2175.
* Handle empty report data in `CashDrawerReconciliationReportCSV`. Refs UIU-2184.
* Fee/fine owners not available for selection on Transfer Fee/Fine modal. Refs UIU-2174.
* Save the patron expiration with the time set to 23:59:59. Refs UIU-2182.
* Compile translations to AST. Refs UIU-2115.

## [6.0.6](https://github.com/folio-org/ui-users/tree/v6.0.6) (2021-06-17)
[Full Changelog](https://github.com/folio-org/ui-users/compare/v6.0.5...v6.0.6)

* Restore missing "Claimed returned" report button. Refs UIU-2188.

## [6.0.5](https://github.com/folio-org/ui-users/tree/v6.0.5) (2021-04-29)
[Full Changelog](https://github.com/folio-org/ui-users/compare/v6.0.4...v6.0.5)

* Import `react` because we are building without new JSX transforms. Refs UIU-2081.

## [6.0.4](https://github.com/folio-org/ui-users/tree/v6.0.4) (2021-04-27)
[Full Changelog](https://github.com/folio-org/ui-users/compare/v6.0.3...v6.0.4)

* Show user-readable message when user is not found. Fixes UIU-2081.

## [6.0.3](https://github.com/folio-org/ui-users/tree/v6.0.3) (2021-04-23)
[Full Changelog](https://github.com/folio-org/ui-users/compare/v6.0.2...v6.0.3)

* Include missing `limit` clause in request-count query. Refs UIU-2143.
* Fetch some search container routes conditionally based on permissions. Refs UIU-2132.
* Show the "Refunds to process manually" report conditionally based on permissions. Refs UIU-2125.

## [6.0.2](https://github.com/folio-org/ui-users/tree/v6.0.2) (2021-04-22)
[Full Changelog](https://github.com/folio-org/ui-users/compare/v6.0.1...v6.0.2)

* Close "New fee/fine" page after fee/fine created. Refs UIU-2117.
* Fix the possibility of create manual patron block with expiration date of today. Refs UIU-2122.
* Outstanding balance displays incorrectly on closed fee/fines pane. UIU-2085.

## [6.0.1](https://github.com/folio-org/ui-users/tree/v6.0.1) (2021-04-19)
[Full Changelog](https://github.com/folio-org/ui-users/compare/v6.0.0...v6.0.1)

* Configure Jest/RTL. Refs UIU-2112.
* Lock stripes-cli to ~2.1.1, and thus stripes-webpack to ~1.1.0. Refs UIU-2137.
* Fix Custom Fields error message by adding a missing permission. Fixes UIU-2104.
* Fix Notify patron box behavior for New fee/fine when default patron notice is set. Refs UIU-2111.
* Fix disabling "Save & close" button for Manual patron block. Refs UIU-2123.
* Fix permission error for "Refunds to Process Manually" report. Refs UIU-2126.

## [6.0.0](https://github.com/folio-org/ui-users/tree/v6.0.0) (2021-03-18)
[Full Changelog](https://github.com/folio-org/ui-users/compare/v5.0.9...v6.0.0)

* Add create request, create fee/fine and create block options to the actions menu. Refs UIU-775.
* Fix bug showing duplicated service points in add service point dialog. Fixes UIU-1892.
* Add report icon for report menu items. Refs UIU-1505.
* Allow search by username. Refs UIU-1707.
* Use more efficient queries for `accounts` records. Refs UIU-1913.
* Relocate the username/password in the create/edit and detail view screens. Refs UIU-1035.
* Allow search by last name. Refs UIU-1706.
* Add user's fees/fines permissions. Refs UIU-1918.
* Allow cancel fee/fine as error only if any 'actions' has not been applied. Refs UIU-1894.
* Allow search by barcode. Refs UIU-1708.
* Work with multiple and single `refund` action. Refs UIU-1897.
* Show the number of open requests in `LoanActionDialog`. Refs UIU-1890.
* Remove optional `action` fields if no value was setted. Refs UIU-1773.
* Show the number of open requests in the Claim returned bulk action modal. Refs UIU-1891.
* Add column 'Expiration date offset (days)' to patron group table. Refs UIU-1908.
* On `Create Fee/fine` page `ConfirmationModal` shows again. Refs UIU-1933.
* Fix incorrect display of the header for `Contributors` column in `Overdue loans report`. Fixes UIU-1937.
* Fix filtering by tags. Fixes UITAG-34.
* Manual patron block not fully going away after expired. Refs UIU-1943.
* Manual patron block expiration date changing when patron block viewed. Refs UIU-1942.
* Case-insensitive sort of filter options. Refs UIIN-1948.
* Increment `@folio/stripes` to `^5.0.2`. Refs UIU-1932, UIU-1935.
* Allow override for not loanable items when loan policy is not recognised. Fixes UIU-1930.
* Show correct number of due date changes. Fixes UIU-1952.
* Add "Users: User loans anonymize" permission. Refs UIU-1535.
* Refund fees/fines: Report of refunds to process manually. Refs UIU-1164.
* New Fee/Fine page not listing Fee/Fine Types for selected Fee/Fine Owner. Refs UIU-1968.
* `Limits` not refreshing when `Patron group` added, modified or deleted. Refs UIU-1944.
* Validate 'Expiration date offset (days)' of patron groups. Refs UIU-1951.
* Create manual patron block templates in settings. Refs UIU-1909.
* Show an error message, not a spinner, when a loan is missing. Refs UIU-1045.
* Populate expiration date based on pre-defined offset for patron group. Refs UIU-1907.
* Remove "Users: User loan edit" permission.
* Add "Users: User loans change due date" permission.
* Show correct source of fee/fine in payment 'action' for 'Charge & pay now'. Refs UIU-1981.
* Change `limit=100` to `limit=2000` across the board; patrons have more than 100 things. All. The. Time. Refs UIU-1987.
* Fix the selection of service points from the `Add service points` popup to display in the user record. Fixes UIU-1912.
* Retrieve up to 10k tags instead of 10. Refs UIU-2003
* Increment `notes` interface to `2.0`
* Refactor to avoid deprecated props to `<Dropdown>`. Refs UIU-2007, STCOM-791.
* Use patron block templates to populate fields in create block screen. Refs UIU-1910.
* Hitting 'Charge only' button multiple times results in more than one fee/fine being created. Refs UIU-1993.
* Set informative message when error declaring item lost. Fixes UIU-2004.
* Change 'Reason for cancellation' to 'Additional information for staff' on Cancel Fee/Fine page. Refs UIU-1999.
* Add fee/fine owner column to refund report. Refs UIU-2016.
* Increment `react-redux` to `v7`, `redux-form` to `v8`. Refs UIU-2017, STRIPES=721.
* Accessibility: Invalid ARIA attribute. Refs UIU-1685.
* Wrong error message appears when required field not selected on Pay/Waive/Transfer modal. Refs UIU-1991.
* Create fees/fines EXPORT spreadsheet for single patron and add EXPORT option to Fees/Fines History. Refs UIU-1955, UIU-1958.
* Add 'User: Can override patron blocks' permission. Refs UIU-2025.
* Add 'User: Can override item blocks' permission. Refs UIU-2019.
* Add Fee/fine owner as criteria for 'Refunds to process manually report'. Refs UIU-2013.
* Add EXPORT option to User Information. Refs UIU-1957.
* Add EXPORT option to fees/fines Details. Refs UIU-1956.
* Change Overdue loans and Claims reports icons in action menu. Refs UIU-2030.
* Add plus-sign to create buttons in action menu and switch button order. Refs UIU-2031.
* Calculate new expiration date not only from today. Refs UIU-2046.
* Unable to select today's date for refund report. Refs UIU-2033.
* Increment `@folio/stripes-cli` to `v2`. Refs UIU-2047.
* Inconsistent behavior of payment action when transaction info is blank. Refs UIU-2048.
* Fix wrong value on reset data for Refunds to process manually report (CSV). Refs UIU-2050.
* Add app dropdown menu. Refs UIU-1915.
* Add Modal with Shortcut Keys List. Refs UIU-1916.
* Add Callout for Refund report. Refs UIU-2035.
* Allow 0 as valid entry for Patron Block Limits. Refs UIU-1998.
* Add "Save and close" button should be active immediately on refund report criteria modal. Refs UIU-2034.
* Expiration date modal opens every time when editing a user. Refs UIU-2059.
* Rewording for text on expiration date modal. Refs UIU-2058.
* Patron blocks: Allow for override of Renewing when logged in user has credentials. Refs UIU-1954.
* Loan Details no longer displays Fines incurred. Refs UIU-2045.
* Fix eslint error in `LoanDetails.js`. Refs UIU-2068.
* Improve fetching account data by making sure fetch happens only once. Fixes UIU-2063.
* Update `@folio/plugin-find-user` for compatibility with `@folio/stripes` `v6`.
* Fix behavior of Confirm button when `Mark as missing` option is selected in `Resolve claim` menu. Fixes UIU-2077.

## [5.0.9](https://github.com/folio-org/ui-users/tree/v5.0.9) (2020-12-10)
[Full Changelog](https://github.com/folio-org/ui-users/compare/v5.0.8...v5.0.9)

* Change `limit=100` to `limit=2000` across the board; patrons have more than 100 things. All. The. Time. Refs UIU-1987.

## [5.0.8](https://github.com/folio-org/ui-users/tree/v5.0.8) (2020-11-25)
[Full Changelog](https://github.com/folio-org/ui-users/compare/v5.0.7...v5.0.8)

* Disable `Charge & pay` button. Refs UIU-1980.

## [5.0.7](https://github.com/folio-org/ui-users/tree/v5.0.7) (2020-11-24)
[Full Changelog](https://github.com/folio-org/ui-users/compare/v5.0.6...v5.0.7)

* Fix empty payments select. Refs UIU-1975.

## [5.0.6](https://github.com/folio-org/ui-users/tree/v5.0.6) (2020-11-17)
[Full Changelog](https://github.com/folio-org/ui-users/compare/v5.0.5...v5.0.6)

* New Fee/Fine page not listing Fee/Fine Types for selected Fee/Fine Owner. Refs UIU-1968.

## [5.0.5](https://github.com/folio-org/ui-users/tree/v5.0.5) (2020-11-13)
[Full Changelog](https://github.com/folio-org/ui-users/compare/v5.0.4...v5.0.5)

* Qualify queries to `feefineactions`, `feefines` from "Open fee/fine" page. Refs UIU-1895.
* Use more efficient queries for `accounts` records. Refs UIU-1913.
* Fix filtering by tags. Fixes UITAG-34.
* Show correct number of due date changes. Fixes UIU-1952.
* Allow cancel fee/fine as error only if any 'actions' has not been applied. Refs UIU-1894.

## [5.0.4](https://github.com/folio-org/ui-users/tree/v5.0.4) (2020-11-09)
[Full Changelog](https://github.com/folio-org/ui-users/compare/v5.0.3...v5.0.4)

* Fix bug showing duplicated service points in add service point dialog. Fixes UIU-1892.
* On `Create Fee/fine` page `ConfirmationModal` shows again. Refs UIU-1933.
* Fix incorrect display of the header for `Contributors` column in `Overdue loans report`. Fixes UIU-1937.
* Manual patron block not fully going away after expired. Refs UIU-1943.
* Manual patron block expiration date changing when patron block viewed. Refs UIU-1942.
* Case-insensitive sort of filter options. Refs UIIN-1948.
* Increment `@folio/stripes` to `^5.0.2`. Refs UIU-1932, UIU-1935.

## [5.0.3](https://github.com/folio-org/ui-users/tree/v5.0.3) (2020-10-27)
[Full Changelog](https://github.com/folio-org/ui-users/compare/v5.0.2...v5.0.3)

* Add user's fees/fines permissions. Refs UIU-1918.

## [5.0.2](https://github.com/folio-org/ui-users/tree/v5.0.2) (2020-10-27)
[Full Changelog](https://github.com/folio-org/ui-users/compare/v5.0.1...v5.0.2)

* Use correct `dateFormat` for `<Datepicker>`. Refs UIU-1896.

## [5.0.1](https://github.com/folio-org/ui-users/tree/v5.0.1) (2020-10-15)
[Full Changelog](https://github.com/folio-org/ui-users/compare/v5.0.0...v5.0.1)

* Update plugins to `stripes v5`-compatible versions. Refs UIU-1901.

## [5.0.0](https://github.com/folio-org/ui-users/tree/v5.0.0) (2020-10-14)
[Full Changelog](https://github.com/folio-org/ui-users/compare/v4.0.0...v5.0.0)

* modified the lost date display to include aged to lost status. Fixes UIU-1804.
* Fixing breaking tests.
* Adding fix for UIU-1801.  Removing temporary fixes to tests.
* Temporary fix for broken tests relating to UIU-1801.  Does not resolve that issue.
* changed user search to filter based on tag name rather than ID.  Fixes UIU-1750
* Trim email address in user record to remove blanks. Fixes UIU-1528.
* `withRenew` should include in-transit items when calculating the open-request-count. Fixes UIU-1254.
* Restore `CommandList`, `HasCommand` wrappers now that they don't leak memory. Refs UIU-1457.
* Retrieve up to 200 patron groups when setting Fee/Fine limits. Refs UIU-1715.
* Use `==` for more efficient queries. Refs PERF-62.
* Increment `@folio/plugin-find-user` to `v3.0.0` for `@folio/stripes` `v4.0` compatibility.
* Refresh Fine incurred field when item declared lost. Fixes UIU-1669.
* Add validation to integer values for patron block limits. Refs UIU-1675.
* Increase limits for `ChargeFeesFines`. Refs UIU-1722.
* Fix Custom Fields related error toast notification in User Details page. Fixes UIU-1736.
* Generate overdue loans report via pagination. Fixes UIU-1747.
* Prevent declaring an item lost if it is already lost. Fixes UIU-1714.
* Add `servicePointId` property when overriding a loan. Refs UIU-1712.
* Change capitalization of sections in User Information. Refs UIU-1754.
* Fix buttons layout in `Warning modal`. Refs UIU-1756.
* Change `-` to `Default` if default notice exists at Fee/Fine: Manual Charges. Refs UIU-1755.
* `Fee/fines details` not always include `Service Point` as `Created at`. Refs UIU-1725.
* Add permission to anonymize manually closed loans. Fixes UIU-1757.
* Include tag-related permissions in `ui-users.edit` permission. Refs UITAG-29.
* Increment `@folio/stripes` to `v5.0`, `react-router` to `v5.2`.
* Support ability to search by Preferred first name. Refs UIU-1767.
* Handle display of loan details for `Aged to lost`, and for unknown statuses as well. Refs UIU-1791.
* Settings > Users > Departments CRUD. Refs UIU-1211.
* Reorder volume/enum/chron fields in loans export (CSV). Refs UIU-1504.
* Use item id instead of barcode for links to `ui-requests` module. Fixes UIU-1727.
* Add departments to User crate/edit/view pages. Refs UIU-1224.
* Enable renewal override for Aged to lost items. Refs UIU-1464.
* Handle Aged to lost items in bulk due date change. Refs UIU-1495.
* Include Aged to lost in loan details action history. Refs UIU-1803.
* Add permissions for Departments CRUD. Refs UIU-1778.
* Add missing permission `departments.collection.get` permission. Fixes UIU-1812.
* Prevent UI crashing when loading loan with deleted item. Fixes UIU-1819.
* Remove user count from patron groups. Fixes UIU-1562.
* Assign user permissions more efficiently. Fixes UIU-1369.
* Filter out blank actions on loan details UI. Fixes UIU-1820.
* Increment `react-intl` to `v5` for `@folio/stripes` `v5` compatibility. Refs STRIPES-694.
* Only set `servicePointUserId` when it's present. Fixes UIU-1849.
* Modify default columns and MCL columnWidths on Loans Listing. Fixes UIU-1844
* Refactoring of `pay`, `waive` fee/fine single actions. Refs UIU-1793.
* Refactoring of `error` fee/fine single action. Refs UIU-1796.
* Refactoring of `transfer` fee/fine single action. Refs UIU-1795.
* Clean up invalid fee/fine type-popover code.
* Consistent spacing around barcode link.
* Refactoring of `charge & pay` fee/fine form. Refs UIU-1836.
* Correctly handle permissions modal display over edit pane. Fixes UIU-1857.
* Adding of `refund` fee/fine single action. Refs UIU-1850.
* Refactor actions for single list item. Refs UIU-1797.
* Search translations of permission names. Refs UIU-1859.
* Hide the Overdue loans report option when user doesn't have view loans permissions. Refs UIU-1858.
* Allow renewal override if due date isn't changed. Refs UIU-1853.
* Make the assigned service points for the user have been checked in the Add service points modal. Fixes UIU-1560.
* Add Departments filter. Refs UIU-1355.
* Always show the `Title` field for a loan, even if it is empty. Fixes UIU-1573.

## [4.0.0](https://github.com/folio-org/ui-users/tree/v4.0.0) (2020-06-17)
[Full Changelog](https://github.com/folio-org/ui-users/compare/v3.0.0...v4.0.0)

* Stripping asterisks out of user searches.  Fixes UIU-681
* Support `login` `v7.0` (some unused endpoints were removed). Refs UIU-1663, UIU-1672.
* Support `users-bl` `v6.0` (some unused endpoints were removed). Refs STCOR-436, STRIPES-685.
* Change Pay/Waive/Transfer/Cancel Fee/Fine Owner by Service Point name where the transaction took place. Refs. UIU-1399.
* Change Fee/Fine Owner by Service Point name where the transaction took place. Refs. UIU-1398.
* Support `loan-storage` interface version 7.0. UIU-1598.
* Add posibility to view/create/edit custom fields on user record. UIU-1279.
* Increase limit of service points in the Associated Service Points dropdown at Settings --> Users --> Fee/Fine Owners. Refs UIU-1540.
* Fix ability to mark user as inactive. Fixes UIU-913.
* Add permission and permission check to claim an item returned. Refs UIU-1266.
* Create Patron Blocks Conditions Table in Settings -> Users. Refs UIU-1272.
* Fix bug preventing closed loans list from loading properly when an item has been deleted. Fixes UIU-1411.
* Fix import path to stripes util. Fixes UIU-1515.
* Use localized permission names. Refs UIU-488.
* Create Patron Blocks Limits Table in Settings -> Users. Refs UIU-1167.
* Add `Load more` button at the end of the result list. Fixes UIU-1532.
* Increase limit of patron fee/fines, owners and patron groups. Refs UIU-1585.
* Build filter string by using ids instead of names. Fixes UIU-1596.
* Add UI to mark claimed returned items as missing. Refs UIU-1216.
* Fix routing loop caused by incorrect Custom Fields routing. Refs UIU-1594.
* Settings > Users > Create/Edit Permission set. Refs UIU-1587.
* Add `Closed loan` translation. Part of UIU-1603.
* Pass current `servicePointId` to `declare-item-lost`. Part of UIU-1203.
* Preserve filters after user is edited. Fixes UIU-1604.
* Remove hardcoded ids from Parton Block Conditions page. Refs UIU-1609.
* Settings > Users > Fee/Fine > Comment | Move Save button to the footer. Refs UIU-1589.
* Pin `moment` at `~2.24.0`. Refs STRIPES-678.
* Add possibility to create system user from already existing account. Refs UIU-1503.
* Provide `search` explicitly to `history.push`. Fixes UIU-1620.
* Settings > Users > Fee/Fine pages > replace black asterisk with red asterisk. Refs UIU-1611.
* Match the protocol of the current page in images pulled from remote sites. Refs UIU-496.
* Correctly configure fee/fines and profile-pictures permissions. Refs UIU-1574.
* Increment `stripes` to `v4.0`, `react-intl` to `v4.5`, `react-intl-safe-html` to `v2.0`. Refs STRIPES-672.
* Fix `Reset all` button for filters and query. Fixes UIU-1628.
* Display count of claim returned items. Refs UIU-1215.
* Sort user permissions in alphabetical order on create/edit screen. Refs UIU-1353.
* Fix memory leak in `UserAccounts.js` discovered by @mkuklis.
* UI updates to the Permissions modal. Refs UIU-1466.
* Add permission and permission check for mark a claimed item missing. Refs UIU-1268.
* Prevent the renewal of claimed returned items. Refs UIU-1261.
* Adds `checkedInFoundByLibrary` and `checkedInReturnedByPatron` to loan action map. Fixes UIU-1643.
* Display the correct link for create/reset password. Refs UIU-1608.
* Add a bulk claim returned function. Refs UIU-1627.
* Format action message for claim returned checkin. Refs UIU-1218.
* Add resolve claim to loan details screen. Refs UIU-1524.
* Capitalize user status when displayed. Fixes UIU-1523.
* Permissions -> Users: Create/reset password send. Refs UIU-1337.
* Prevent change due date for claimed returned items. Refs UIU-1260.
* Bring back `Declare lost` button. Fixes UIU-1662.
* Use the app logo as a profile placeholder. Yep, it's kinda hacky. Refs UIU-496.
* Fee/Fine Details is not refreshing, which may result in user entering duplicate actions. Fixes UIU-1644.
* Protect loan action history page from CQL null query errors. Fixes UIU-1652.
* Fix the arrangement of elements inside the `SafeHTMLMessage` component. Fixes UIU-1660.
* Fix Patron Group, Status, and Preferred contact fields, are not read a required by screen reader. Refs UIU-1642.
* Check for an empty loan to protect from generating incorrect CQL. Fixes UIU-1653.
* Add checks for multiple okapi interfaces on user's details screen. Fixes UIU-1600.
* Display automated patron blocks on User Information page. Refs UIU-1273.
* On user-edit screen, show "send reset password link" whenever username is present. Refs UIU-1672.
* Display automated patron blocks on renewing in loans context. Refs UIU-1276.
* Do not create an empty-string password when adding a username to a user. Refs UIU-1671.
* Fix incorrect display of the date in the `Return date` field. Refs UIU-1204.
* Add `delete` request to patron block limits. Refs UIU-1675.
* Validate duplicate proxy/sponsor. Fixes UIU-925.
* Prefer `aria-label` to `ariaLabel` per React documentation.
* Apply default pane max-width value on the edit page. Refs UIU-1649.
* Change user form pane title. UIU-1649.
* Add preferred first name field on user record. Refs UIU-1649.

## [3.0.0](https://github.com/folio-org/ui-users/tree/v3.0.0) (2020-03-17)
[Full Changelog](https://github.com/folio-org/ui-users/compare/v2.26.0...v3.0.0)

* Add default settings for user status and preferred contact in new user creation. Refs UIU-1385.
* Fix navigation paths on cancel button click on loan details, open and closed loan lists pages. Refs UIU-1377.
* Prevent loan details opening upon click in loans action menu without selecting link. Fixes UIU-1359.
* Display correct user block on the edit form. Fixes UIU-1397.
* Clear previous item data when open a new fee/fine form page. Fixes UIU-1410.
* Add record last updated and created back to manual patron block. Fixes UIU-1420.
* Go back to user's accounts when clicking on cancel or `x` from fee/fine form. Fixes UIU-1412.
* Reset patronBlocks before refetching. Fixes UIU-1430 and UIU-1431.
* Fix bug with wrong displaying of address type. Refs UIU-1404
* Passing `notify` field to BE, when fee/fine is paying. Refs UIU-1413.
* Display `Overdue fine policy` and `Lost item fee policy` on the `Loan Details` page. Refs UIU-1246.
* Replace "Fee/Fine History: Can create, edit and remove accounts" permission with "Users: Can create, edit and remove fees/fines" one for restricting access to the accounts history. Refs UIU-1384.
* Fix page crash when a multiple fee/fine payment is made. Refs UIU-1413.
* Refactor open and closed loans lists to use <Dropdown /> from stripes-components
* Omit 'notify' field upon creating fee/fine in order to prevent backend error. Fixes UIU-1438.
* Refresh list of loans after anonymization. Fixes UIU-1046.
* Add UI to mark items Declared lost. Refs UIU-1202.
* Omit `comments`, `patronInfo` fields, when fee/fine is paying, to prevent backend error. Fixes UIU-1413.
* Don't update state in `withRenew` when unmounted. Fixes UIU-1450.
* Update circulation okapiInterface to version `9.0`. Part of UIU-1440.
* Disable `autoComplete` in user's search box. Refs UIU-1426.
* Correctly sort "Active" column. Refs UIU-1406.
* Filter Users by Tags. Refs UIU-1448.
* Replace deprecated babel dependencies. Refs UIU-1461, STCOR-381.
* Fix a bug keeping fee/fine payment modals open after submission. Fixes UIU-1417.
* Mark fields as required when filling in the username or password. Fixes UIU-1350.
* Enable override for renewal of declared lost items. Refs UIU-1208.
* Add more granular call number fields to loans exports. Refs. UIU-1358.
* Show edit button only if user has "Can edit user profile" permission. Fixes UIU-1435.
* Send `Notify Patron` checkbox value to backend in the Confirm fee/fine cancellation modal. Refs UIU-1483.
* Add UI to mark items Claim returned. Refs UIU-1213.
* Execute loan renew in sequence. Fixes UIU-1299.
* Fix active/inactive state for Save button. Fixes UIU-1194.
* Display `effective call number prefix`, `call number`, `call number suffix`, `enumeration`, `chronology`, `volume` in loans contexts. Refs UIU-1347, UIU-1391.
* Prevent change due date for declared lost items. Refs UIU-1207.
* Tweak text for declared lost modal. Refs UIU-1444.
* Update eslint to >= 6.2.1 or eslint-util >= 1.4.1. Refs UIU-1446.
* Add 'Custom Fields' under User Settings to give circulation managers ability to add more fields to records. Refs UIU-1441
* Validate presence of `user.personal` before accessing it. Fixes UIU-1510.
* Add link to Overdue Fine Policy and Lost Item Fee Policy on Fee/Fine Details page. Refs UIU-1247.
* Provide permissions to custom fields. Refs UIU-1521.
* Fix bug with assign and unassign permissions to users. Refs UIU-1518.
* Default charge and action notices not saved on manual fee/fine charge settings. Refs UIU-1486.
* Update to `@folio/stripes` `v3.0.0` compatible version of `plugin-find-user`.
* Happy St. Patrick's day! 🍀 🍀 🍀

## [2.26.0](https://github.com/folio-org/ui-users/tree/v2.26.0) (2019-12-05)
[Full Changelog](https://github.com/folio-org/ui-users/compare/v2.25.3...v2.26.0)

* Prevent manual anonymization of closed loans with fees/fines. Refs UIU-1083.
* Update sponsor and proxy labels. Refs UIU-1018.
* Implement permission assigment by batch. Refs UIU-1249
* Fix the mechanism for the accumulation of overdue loans in CSV report. Refs UIU-1286.
* Implement view loans permission. Refs UIU-1175.
* Refactor Routing. Switch to using SearchAndSortQuery. UIU-897
* Resolve bug updating a user just after creation. Fixes UIU-1314.
* Implement edit loan permission. Refs UIU-1177.
* Retrieve up to max available amount of overdue loans instead of 10 for CSV report. Refs UIU-1297.
* Implement loans renew permission. Refs UIU-1176.
* Retrieve up to 100k of requested user loans instead of 100. Refs UIU-1292.
* Implement loans renew through override permission. Refs UIU-1184.
* Add service points to user. Refs UIU-1334.
* Warn, but do not invalidate, when a proxy relationship is expired for any reason. Refs UIU-820.
* Show requests information when user has view loans permission only. Refs UIU-1184.
* Use a more efficient query when searching for an item by barcode to attach a fee/fine. Refs UIU-1380.
* Use user's id instead of a barcode when navigating to requests module. Refs UIU-1370.
* Restore display of "invisible" permissions. Refs UIU-1372.
* Rename "Loans: All permissions" permission to "Users: User loans view, edit, renew (all)". Refs UIU-1344.
* Add `autoFocus` prop to `<SearchField>`. Refs UIU-1248.
* Implement declare items lost permission. Refs UIU-1265.

## [2.25.3](https://github.com/folio-org/ui-users/tree/v2.25.3) (2019-09-26)
[Full Changelog](https://github.com/folio-org/ui-users/compare/v2.25.2...v2.25.3)

* Dedupe loan policy list before retrieving it. Refs CHAL-30.
* Retrieve up to 1000 loans instead of 100. LIBRARIANS LOVE BOOKS! Refs CHAL-29.
* Correctly display checkboxes in the add-servicepoint modal. Refs UIU-1240.
* Retrieve requests-against-patron in batches for a shorter querystring. Refs CHAL-30.
* Fix additional information for patron. Fixes UIU-1221.

## [2.25.2](https://github.com/folio-org/ui-users/tree/v2.25.2) (2019-09-23)
[Full Changelog](https://github.com/folio-org/ui-users/compare/v2.25.1...v2.25.2)

* Provide `rowUpdater` to MCLs. Fixes UIIN-1178, UIU-1237.

## [2.25.1](https://github.com/folio-org/ui-users/tree/v2.25.1) (2019-09-11)
[Full Changelog](https://github.com/folio-org/ui-users/compare/v2.25.0...v2.25.1)

* Update stripes to v2.10.1 to ensure we get a bug fix it provides.

## [2.25.0](https://github.com/folio-org/ui-users/tree/v2.25.0) (2019-09-11)
[Full Changelog](https://github.com/folio-org/ui-users/compare/v2.24.1...v2.25.0)

* Implement exporting of only overdue loans for overdue loans report. Refs UIU-1121.
* Implement footer with _Save & close_ and _Cancel_ buttons on the edit user form. Refs STCOM-429.
* Finish implementing patron notices. Refs UIU-1113, UIU-1114, UIU-1115.
* Clean up duplicate code. Refs UIU-932.
* Add patron notes. Refs UIU-1112.
* replace deprecated `<SegmentedControl>` component.
* Show all reasons when a loan renewal fails. Refs UIU-1129.
* Pass correct props to `<AppIcon>`. Refs UIU-1163
* Add new permissions modal component. Refs UIU-629, UIU-631.
* Update `<PaneFooter>`: support arbitrary rendering of the content on two sides. Refs STCOM-521.
* Update integration tests for new MCL. Refs STCOM-363, UIU-1206.
* Don't fail a proxy relationship due to an empty account expiration date. Fixes UIU-820.
* Add UX Consistency on FF history and charge manual FF. Refs UIU-1101.
* Add UX Consistency on FF Details. Refs UIU-1103.
* Fix Shared Fee/Fine Owner showing up as "ghost" . Fixes UIU-1104.
* Fix "Shared" Fee/Fine Owner not allowed to have associated Service Points. Fixes UIU-1084.

## [2.24.1](https://github.com/folio-org/ui-users/tree/v2.24.1) (2019-07-26)
[Full Changelog](https://github.com/folio-org/ui-users/compare/v2.24.0...v2.24.1)

* Retrieve up to 10k permissions, up from the current limit of 1k. Fixes UIU-1134.
* Modify permission for patron blocks. Refs UIU-728.

## [2.24.0](https://github.com/folio-org/ui-users/tree/v2.24.0) (2019-07-24)
[Full Changelog](https://github.com/folio-org/ui-users/compare/v2.23.0...v2.24.0)

* Allow some loan-renewal failures to be overridden. Refs UIU-1017.
* Remove unnecessary settings. Refs UIORG-150.
* Handle "Active/Inactive" hard-code issue for the search filter. Fixes UIU-894.
* Better search string construction won't accidentally match `*`. Fixes UIU-1086.
* Fix sort patron blocks. Fixes UIU-868.
* Fix Payment Status from "Charge and pay now". Fixes UIU-931.
* Fix UX Consistency owners. Fixes UIU-1050.
* Handle address type validation issue after adding permission to user. Fixes UIU-912.
* Add missing permissions. Fixes UIU-1088.
* Accommodate changes in the shape of `/loan-storage/loan-history` data. Refs UIU-1092.
* Fix expiration date for sponsor and proxy. Fixes UIU-924.
* Update tests to cover changes in due date modal in stripes-smart-components. Refs UIU-1070.
* Extend overdue loans report with fine/fee field. Refs UIU-987.
* Optimize fee/fine settings and BigTest.
* Create BigTest Payment methods. Refs UIU-998.
* Create BigTest Refund reasons. Refs UIU-999.
* Create BigTest Waive reasons. Refs UIU-1001.
* Update `login` API to `v6.0`. Refs UIU-1099.
* Create BigTest for CRUD patron blocks. Refs UIU-1003.

## [2.23.0](https://github.com/folio-org/ui-users/tree/v2.23.0) (2019-06-12)
[Full Changelog](https://github.com/folio-org/ui-users/compare/v2.22.0...v2.23.0)

* Retrieve 1000 service points by default. Fixes UIU-1053.
* Create BigTest for display Fee/Fine History. Ref UIU-1005.
* Provide "Add all permissions" button. Fixes UIU-1055.
* Disallow duplicate barcode in users. Part of UIU-1039.
* Fix display fee/fine history and payments.
* Fix sort patron blocks. Fix UIU-868.
* Fix notify patron to charge manual and pay modal. Fix UIU-953.
* Fix comment column size. Fix UIU-954.
* Add "Loan policy name" and "Loan ID" fields to Overdue loans report. Ref UIU-985
* Add ability to search by first and last name. Part of UIU-1068.
* Fix displaying patron block pop-up for Renewal. Fix UIU-1062.
* Fix field label for manual charges settings. Fix UIU-950.
* Fix default Fee/Fine Owner Desk. Fix UIU-948.
* Fix ability to edit users with "can edit users permission". Fixes UIU-1066.
* Fixes fees/fines.
* Fix UX Consistency for New Fee/Fine. Fix UIU-1052.

## [2.22.0](https://github.com/folio-org/ui-users/tree/v2.22.0) (2019-05-10)
[Full Changelog](https://github.com/folio-org/ui-users/compare/v2.21.0...v2.22.0)

* Suppress error on user-details pane when permissions record is missing. Fixes UIU-507.
* Correct proxy-user query. Fixes UIU-952.
* UX Consistency Fixes for New Fee/Fine (aka Charge Manual Fee/Fine). Ref. UIU-903.
* Fix cannot delete Fee/Fine Owner message. Ref UIU-841.
* Show explanation when renewal fails for any reason. Fixes UIU-971.
* UX Consistency Fixes for Fees/Fines History (aka Open/Closed/All Fees/Fines). Ref UIU-904.
* Fix Decimal places not appearing on Manual Charges table. Fix UIU-843.
* Fix FF History issue when attempting second all fees/fines pay/waive from within ALL tab. Fix UIU-813.
* Fix display in Check-Out when the patron has more than one block. Fix UIU-804
* Fix comment snippet missing from Fee/Fine History. Fix UIU-955.
* Fix comment count wrong on Fee/Fine History. Fix UIU-957.
* UX Consistency Fixes for Patron Blocks on Renewals pop-up. Ref UIU-947
* Fix Fee/Fines Details "Created at". Fix UIU-927.
* Fix "All actions" permission to see Patron Block details. Fix UIU-866.
* Fix Patron block pop-up for Renewals. Fix UIU-959.
* UX Consistency Fixes for Patron Blocks: User Information changes. Ref UIU-902.
* Fix FF Details/History. Fixes UIU-968, UIU-961.
* Fix Pay and Waive FF fixes. Fix UIU-958.
* Use strict matching for user-ids when retrieving blocks. Fixes UIU-956.
* Send singular label in `labelSingular` prop. Fixes UIU-806.
* Correctly set `sort` field. Refs UIU-869.
* UX Consistency Fixes for Patron Blocks. Ref uiu-933.
* Fix incorrect payment status. Fix UIU-931.
* Fix spacing issue on User Information Fee/Fine section display. Fix UIU-946.
* Add test to comments settings section. Ref UIU-996.
* Add user status indication.
* Add overdue loans report. Part of UIU-983.
* Add test to owners settings section. Ref UIU-997.
* Create BigTest for Transfer accounts Settings. Ref UIU-1000.
* Fix "Shared" Fee/Fine Owner. Fix UIU-989.
* Fix "Last Updated" column. Fix UIU-960.
* Add test to Transfer fee/fine modal. Ref UIU-1016.

## [2.21.0](https://github.com/folio-org/ui-users/tree/v2.21.0) (2019-03-15)
[Full Changelog](https://github.com/folio-org/ui-users/compare/v2.20.0...v2.21.0)

* Support login v5, bl-users v4 in parallel with previous releases.
* Add "all actions" permission from Closed Loans. Fix UIU-867.
* Update integration tests to accommodate MCL aria changes. Fixes UIU-880.
* Don't pass `appIcon` to `<Pane>`.
* Use static column labels, not their aliases, as keys to CQL sort table. Refs UIU-479, UIU-864, STSMACOM-93.
* Provide unique ID for find-user plugin. Refs UIU-884.
* Update circulation OKAPI interface to v6.0. Refs UICIRC-164.
* Add user information Fee/Fine section display fields. Fix UIU-688.
* Add new fields to payment modal. Fix UIU-803.
* Fix delete Fee/Fine Owner message. Fix UIU-841.
* Fix payment confirmation. Fix UIU-842.
* Fix Fee/Fine Owner box larger. Fix UIU-844.
* Fix display consistent message. Fix UIU-846.
* Fix prompted to copy Manual Charges. Fix UIU-858.
* Fix labels on Pay and Waive modals. Fix UIU-845.
* Update circulation v7.0 and request-storage v3.0 OKAPI interfaces. Part of UIU-889.
* Use packageInfo passed via props if present. Part of ERM-72.
* Add feature "Notify patron of new manual fee/fine charge". Fix UIU-710.
* Add feature "Notify patron of fee/fine payment received". Fix UIU-711.
* Add feature "Charge notice and action notice options to manual fee/fine settings screen". Fix UIU-713.
* Add CRUD Fee/Fine Transfer Accounts Settings. Ref UIU-544.
* Support "Open - In transit" status. Fixes UIU-682.
* Display "Additional Information for Patron" on Fee/Fine Details. Ref UIU-901.
* Fix translate. Ref UIU-713, UIU-845.

## [2.20.0](https://github.com/folio-org/ui-users/tree/v2.20.0) (2019-01-25)
[Full Changelog](https://github.com/folio-org/ui-users/compare/v2.19.0...v2.20.0)

* Fix Pay and Waive Fee/Fine. Fix UIU-856.
* Fix Patron Block accordion. Fix UIU-810.
* Upgrade to stripes v2.0.0.
* Introduce overrides. Refs UIU-786.

## [2.19.0](https://github.com/folio-org/ui-users/tree/v2.19.0) (2019-01-07)
[Full Changelog](https://github.com/folio-org/ui-users/compare/v2.18.0...v2.19.0)

* Implement specify payment methods for each Fee/Fine Owner. Ref UIU-612.
* Implement confirmation modal for waive and pay. Ref UIU-697, UIU-698.
* Add Success Toast for pay an waive modal. Fix UIU-770.
* Add feature enforce manual patron blocks. Ref UIU-675. Fix UIU-784,UIU-789, UIU-790.
* Modify styles on charge. Ref UIU-708,UIU-687.
* Fix manual patron blocks. Ref UIU-674. Fix UIU-792.
* Fix permissions. Refs UIU-584, UIU-673, Fixes UIU-787, UIU-788.
* Fix Fees/Fines History scroll bar. Fix UIU-761.
* Fix Multiple fee/fine waive and pay. Fixes UIU-767, UIU-781, UIU-766.
* Fix minor errors for pay and waive. Fix UIU-769.
* Fix associated service points. Fix UIU-771.
* Fix Fees/Fines Details link. Ref UIU-643, Fixes UIU-667, UIU-665, UIU-720.
* Fix order for fee fine details. Fixes UIU-475, UIU-476.
* Fix consistency error with Cancel Fee/Fine modal. Ref UIU-707.
* Fix consistency errors with Waive and pay Fee/Fine modal. Ref UIU-705, UIU-706.


## [2.18.0](https://github.com/folio-org/ui-users/tree/v2.18.0) (2018-12-17)
[Full Changelog](https://github.com/folio-org/ui-users/compare/v2.17.0...v2.18.0)

* Create permission for renewing loans. Fixes UIU-625.
* Adjust accordion headline sizes for correct a11y and visual hierarchy
* Load proxies/sponsors on initial load. Fixes UIU-661.
* Restore element id for password-toggle to simplify testing. Refs UITEST-55.
* Add permissions for renewing loans. Fixes UIU-686.
* Specify a sort field to `<ControlledVocab>` for entries without a `name` field. Refs STSMACOM-139.
* Show `active` column in find-user popup. Refs STCOM-385.
* Fix minor "Pay Fee/Fine" bugs. Fix UIU-454
* Fix minor "Waive Fee/Fine" bugs. Fix UIU-455.
* Fix minor "Fees/Fines History" bugs. Fix UIU-238, UIU-641.
* Fix change to Fees/Fines Details link to Loan Details. Fix UIU-643.
* Fix "Fee/Fine History" page not refreshing. Fix UIU-645.
* Fix Transaction Information field in Pay Fee/Fine modal. Fix UIU-646.
* Fix Fine Incurred no longer displays after it is paid. Fix UIU-665.
* Implement default Fee/Fine Owner for user. Ref UIU-610.
* Implement associate Fee/Fine Owners to one or more Service Points. Ref UIU-611.
* Implement permission for CRUD Manual Patron Block. Ref UIU-674.
* Provide `totalCount` to loan MCLs.
* Support circulation v5.0, requiring service-point information on loans. Refs UIU-717.
* Format the `active` attribute as `Status` on the find-proxy modal. Fixes UIU-726.
* Add loan policy name to loan details view. Fixes UIU-715.
* Refresh action details after renew. Fixes UIU-714.
* Set expired user status to inactive. Fixes UIU-729.
* Fix relationship created message. Fixes UIU-730.
* Add sort by name to initial query resource. Fixes UIU-733.
* Link to a user's requests. Fixes UIU-677.
* Bring back handleSubmit when using submit button. Fixes UIU-743.
* Fix permission menu after reopening. Fixes UIU-739.
* Apply internationalization to all hardcoded strings for Settings. Fixes UIU-691.
* Pass `userBarcode` to new requests. Fixes UIU-690. Refs UIREQ-146.
* Optimize code for Manual Fees/Fines Table. Fix UIU-198.
* Modify associated service points for . Ref UIU-611.
* Create permission "Settings (Users): Can create, edit and remove fee/fine settings". Ref UIU-584.
* Create permission "Fees/Fines: All Actions permissions". Ref UIU-673.
* Implement CRUD Manual Patron Block. Ref UIU-674.
* Create permission "Patron blocks: All permissions". Ref UIU-728.
* Hide metadata accordion for new records. Fixes UIU-700.
* Provide `renderToOverlay` to `<MultiSelection>` to avoid clipping. Fixes STSMACOM-149.
* Request queue link should include only open requests. Fixes UIU-716.
* Prohibit adding user as a proxy or sponsor for themselves. Fixes UIU-734.
* Fix minor errors of fee/fine history and details. Fixes UI-238, UIU-239.
* Hide request buttons and disable request links when user doesn't have permissions. Fixes UIU-757.
* Resolve fixes of fees/fines. Fixes UIU-762,UIU-763,UIU-765,UIU-766,UIU-769.
* Add feature enforce manual patron blocks. Ref UIU-675.
* Implement pane-header dropdown menu on detail records. Refs UIU-754.
* Attempt to use a shared Nightmare instance to generage code-coverage data. Refs UIU-570, UIU-777.
* Correctly initialize `<MultiSelection>` in the Settings > Users > Owners pane. Fixes UIU-752.
* Correctly show unsaved-changes dialog when the edit pane is closed. Fixes UIU-749.
* Hotkeys proof of concept. Refs STCOM-383, UIU-743, UIU-745.
* Implement new internationalization patterns based on `<FormattedMessage>` instead of `injectIntl` and `formatMessage()`. Refs UIU-679, UIU-736, UIU-740.
* Show "Reset password" modal from edit-users pane. Refs UIU-735, UIU-522.
* Link to request queue from loan-details pane. Fixes UIU-722.
* Add BigTest testing infrastructure. Refs UIU-678.
* Show check in service point's location field in loan details. Refs UIU-485.

## [2.17.0](https://github.com/folio-org/ui-users/tree/v2.17.0) (2018-10-5)
[Full Changelog](https://github.com/folio-org/ui-users/compare/v2.16.0...v2.17.0)

* Depend on `@folio/stripes`. (Part of FOLIO-1547)
* Update imports for components moved from `stripes-components` to `stripes-smart-components`. (Part of FOLIO-1547)

## [2.16.0](https://github.com/folio-org/ui-users/tree/v2.16.0) (2018-09-27)
[Full Changelog](https://github.com/folio-org/ui-users/compare/v2.11.0...v2.16.0)

* Update `stripes-form` dependency to v1.0.0
* Fix charge Manual Fee/Fine,Display fees/fines history,Display Fee/Fine Details,Pay Fee/Fine. Fix UIU-635, UIU-645.
* Update tags counter when tags are being added or removed. Fixes UIU-660.
* Update closed loans counter after anonymization. Fixes UIU-647.
* Move files into src directory
* Remove notes helper app

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

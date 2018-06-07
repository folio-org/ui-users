# ui-users

Copyright (C) 2016-2018 The Open Library Foundation

This software is distributed under the terms of the Apache License,
Version 2.0. See the file "[LICENSE](LICENSE)" for more information.

## Introduction

The Users UI Module, or `ui-users`, is a Stripes UI module used for searching, sorting, filtering, viewing, editing and creating users. (A "Stripes UI module" is an NPM module that adheres to certain conventions that allow it to function within the [Stripes UI framework](https://github.com/folio-org/stripes-core/blob/master/README.md) that is part of FOLIO.)

The Users UI module is important because it is the first user-facing module to have undergone development. FOLIO has several [server-side modules](https://dev.folio.org/source-code/#server-side) that run under Okapi (mod-auth, mod-configuration, mod-metadata, mod-files, etc.), but mod-users is the only one that has a corresponding UI component. Accordingly, the Users UI module serves as a testbed for new Stripes functionality and a place to shake down those parts of the UI design that will be shared between all FOLIO applications.

## Installation

First, a Stripes UI development server needs to be running. See the [quick start](https://github.com/folio-org/stripes-core/blob/master/doc/quick-start.md) instructions, which explain how to run it using packages from the FOLIO NPM repository or use some parts from local in-development versions.

The "ui-users" module is already enabled by that default configuration.

The other parts that are needed are the Okapi gateway, various server-side modules (including mod-users), and sample data. Ways to achieve that are described in [Running a complete FOLIO system](https://github.com/folio-org/ui-okapi-console/blob/master/doc/running-a-complete-system.md).

(At some point, this process will be dramatically streamlined; but at present, this software is primarily for developers to work on, rather than for users to use.)

## Testing

If you are doing development from git checkouts, you can use `npm test` or `yarn test` to run a regression-test suite, provided that:

1. You have `ui-testing` checked out next to `ui-users`.
2. Your `ui-users` checkout is `yarn link`ed into `ui-testing`.
3. You are running a Stripes server on localhost:3000.

(Most developers' environments meet these requirements.)

## Additional information

Other [modules](https://dev.folio.org/source-code/#client-side).

See project [UIU](https://issues.folio.org/browse/UIU)
at the [FOLIO issue tracker](https://dev.folio.org/guidelines/issue-tracker).

Other FOLIO Developer documentation is at [dev.folio.org](https://dev.folio.org/)

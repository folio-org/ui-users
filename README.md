# ui-users

Copyright (C) 2016-2020 The Open Library Foundation

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

## Build and serve

To build and serve `ui-users` in isolation for development purposes, run the "start" package script.
```
$ yarn start
```

The default configuration assumes an Okapi instance is running on http://localhost:9130 with tenant "diku".  The options `--okapi` and `--tenant` can be provided to match your environment.
```
$ yarn start --okapi http://localhost:9130 --tenant diku
```

See the [serve](https://github.com/folio-org/stripes-cli/blob/master/doc/commands.md#serve-command) command reference in `stripes-cli` for a list of available options.  Note: Stripes-cli options can be persisted in [configuration file](https://github.com/folio-org/stripes-cli/blob/master/doc/user-guide.md#configuration) for convenience.


## Tests

Integration tests require a running Okapi.  The default configuration expects Okapi running on http://localhost:9130 with tenant "diku".  To build and run integration tests for `ui-users` with these defaults, run the `test-int` script.
```
$ yarn test-int
```

To view tests while they are run, provide the `--show` option.
```
$ yarn test-int --show
```

To skip the build step and run integration tests against a build that is already running, provide the URL.
```
$ yarn test-int --url https://folio-testing.dev.folio.org/
```

As a convenience, `--local` can be used in place of `--url http://localhost:3000` for running tests a development server that has already been started.
```
$ yarn test-int --local
```

## Additional information

Other [modules](https://dev.folio.org/source-code/#client-side).

See project [UIU](https://issues.folio.org/browse/UIU)
at the [FOLIO issue tracker](https://dev.folio.org/guidelines/issue-tracker).

Other FOLIO Developer documentation is at [dev.folio.org](https://dev.folio.org/)

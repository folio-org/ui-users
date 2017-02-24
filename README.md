# ui-users

Copyright (C) 2017 The Open Library Foundation

This software is distributed under the terms of the Apache License,
Version 2.0. See the file "[LICENSE](LICENSE)" for more information.

## Introduction

The Users UI Module, or `ui-users`, is a Stripes UI module used for searching, sorting, filtering, viewing, editing and creating users. (A "Stripes UI module" is an NPM module that adheres to certain conventions that allow it to function within the [Stripes UI framework](https://github.com/folio-org/stripes-core/blob/master/README.md) that is part of FOLIO.)

The Users UI module is important because it is the first user-facing module to have undergone development. FOLIO has several [server-side modules](http://dev.folio.org/source-code/#server-side) that run under Okapi (mod-auth, mod-configuration, mod-metadata, mod-files, etc.), but mod-users is the only one that has a corresponding UI component. Accordingly, the Users UI module serves as a testbed for new Stripes functionality and a place to shake down those parts of the UI design that will be shared between all FOLIO applications.

## Installation

First, you will need Stripes running. See the [quick start](https://github.com/folio-org/stripes-core/blob/master/doc/quick-start.md) instructions, which explain how to run it using packages from the FOLIO NPM repository or use some parts from local in-development versions.

You will then need to build and install Okapi and the server-side Users module as described in [Running a complete FOLIO system](https://github.com/folio-org/ui-okapi-console/blob/master/doc/running-a-complete-system.md), and install the Users UI module as [described](https://github.com/folio-org/ui-okapi-console/blob/master/doc/running-a-complete-system.md#set-up-the-module-tenant-and-users) further down that same document.

(At some point, this process will be dramatically streamlined; but at present, this software is primarily for developers to work on, rather then for users to use.)


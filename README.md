node-packmod
============

Pack your node_modules as *.tgz files for version control and easy deploys

Why?
----

Because commiting the `node_modules` into source control sucks. It kills
diffs and makes code reviews shitty.

Installation
------------

`npm install -g packmod`

Usage
-----

From a command prompt, run `packmod` from your project's root directory.

You'll see a new `.modules` that contains gzipped tarballs of your
dependencies. When deploying, you'll probably need a script that installs
your modules from the `.modules` directory. npm natively supports
installing them:

```
npm install .modules/mkdirp-v0.3.5.tgz
```

TODO
----

* add support for tagged versions
* add support for modules installed from a repo url
* tests
* refactoring


node-pac
============

[![Gitter](https://badges.gitter.im/mikefrey/node-pac.svg)](https://gitter.im/mikefrey/node-pac)

Pack your node_modules as *.tgz files for version control and easy deploys

Why?
----

Because commiting the `node_modules` into source control sucks. It kills
diffs and makes code reviews difficult.

Read more in my [blog post](http://www.codinginthecrease.com/news_article/show/307636).

Installation
------------

`npm install -g pac`

Usage
-----

```
  Usage: pac [options] [packageName ...]

  Options:

    -h, --help             output usage information
    -i, install            Install packages
    -P, --production       Install/Pack production packages
    -s, --strategy [type]  Uses specified strategy [npm|bower] to install/pack
                           packages. Default is "npm".
    -v, --verbose          Logs out verbose log messages

  Examples:

    $ pac -P install
    $ pac grunt
    $ pac -s bower install
    $ pac -s bower angular
```

From a command prompt, run `pac` from your project's root directory.

You'll see a new `.modules` directory that contains gzipped tarballs of your
dependencies. When deploying, you can use pac to install the modules:

```
mkdir -p node_modules
pac install
npm rebuild
```

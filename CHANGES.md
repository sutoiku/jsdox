0.4.10
------

* don't crash because argv is missing with debug on (psq)
* analyzer: include constructor params in class information (psq)
* add support for nested params (anselmstordeur)

0.4.9
------

* fix the error that occurs when a class has no methods (gaborsar)

0.4.8
------

* fix for subdirectories with an empty parent (gaborsar)

0.4.7
------

* Process descriptions for @link tags (nicksay)

0.4.6
------

* Add options to sort the index differently (nicksay)
* Add support for @namespace and @interface tags (nicksay)

0.4.5
------

* Require the latest version of JSDoc3 Parser (nicksay)

0.4.4
------

* fix undefined "argv" when using in programatic context (boneskull)

0.4.3
------

* Index generation for your generated documentation with -i (vdeturckheim)
* Recursive generation of documentation with -r (ie: documentation for subdirectories is generated too) (vdeturckheim)
* Respectful recursive generation with --rr (ie: the documentation for dir1/dir2/file.js will be in output_dir/dir1/dir/file.md) (vdeturckheim)
* Use JSCS to check code formatting (mrjoelkemp, psq)
* normalizing headers to pound format (boneskull)
* use alternate horizontal rules so you don't get them confused with headers (boneskull)
* adding types to members (boneskull)
* types display monospace (boneskull)
* classes prefixed with "Class:" (boneskull)
* `@example` tag support for `@module` and `@function` (boneskull)
* separate `@author` from `@license` (boneskull)



0.4.2
------

* move `analyze` and `generatedMD` in their own module (mrjoelkemp)
* more tests (mrjoelkemp)
* `-A` option was ignored and became the default; fixed so it is no longer the default (boneskull)
* fixed issue wherein description of `@return` would become `@description` of function (duplicated) if not set for `@return` (boneskull)
* removed redundant `jshint-config.json` (boneskull)
* fixed `.jshintrc` (boneskull)
* fixed inability to find configuration file (boneskull)
* added `.editorconfig` so my editor doesn't blast trailing spaces in `.mustache` files (boneskull)
* `@example` tag support (boneskull)
* `@property` tag support (boneskull)
* `@private` tag support (boneskull)
* added types for class members (boneskull)
* correctly test for `@private` (mlms13)

0.4.1
------

* fix typo in `printHelp()` (psq)

0.4.0
------

* Add missing `templateDir` option in help output (psq)
* More CLI Tests (mrjoelkemp)
* Support for `@requires` and `@member` (lemori)
* New `--templateDir` option (lemori)
* More tests: CLI, Travis Integration, JSHint integration (mrjoelkemp)
* Travis badge (psq)

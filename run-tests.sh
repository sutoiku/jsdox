#!/bin/bash

jshint --config jshint-config.json \
    jsdox.js \
    bin/* \
    test/* \
    fixtures/* \
&& node_modules/.bin/mocha;

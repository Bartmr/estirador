#!/usr/bin/env bash

set -e

rm -rf dist
mkdir -p dist/libs/shared/src
cp -f -R ../../libs/shared/src dist/libs/shared

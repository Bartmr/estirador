#!/usr/bin/env bash

set -e

docker-compose -f infrastructure/docker-compose.yml -f infrastructure/docker-compose.dev.yml up

#!/bin/bash

set -e

GITHUB_REF="${1}"

[ -z "${GITHUB_REF}" ] && echo "Error setting branch name.  No input given." && exit 1

case ${GITHUB_REF} in
  $([[ "$GITHUB_REF" =~ ^refs/heads/dependabot/.* ]] && echo ${GITHUB_REF}))
    echo ${GITHUB_REF##*/*-} | md5sum | head -c 10 | sed 's/^/x/'
    ;;
  $([[ "$GITHUB_REF" =~ ^refs/.*/snyk-* ]] && echo ${GITHUB_REF}))
    echo ${GITHUB_REF##*/*-} | head -c 10 | sed 's/^/s/'
    ;;
  *)
    echo ${GITHUB_REF#refs/heads/}
    ;;
esac
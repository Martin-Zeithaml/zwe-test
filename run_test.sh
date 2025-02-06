#!/bin/sh

. ./zowe.env

ZWE_CFG="${ZWE_RUNTIME}/bin/utils/configmgr"
unset FILE

if [ "${1}" = "-p" ]; then
    echo "${ZWE_RUNTIME}/bin/zwe"
    exit
fi

if [ "${1}" = "-x" ]; then
    rm -rf ./logs/*
    shift
fi

if [ -z "${1}" ]; then
    FILE="./test.js"
else
    FILE="${1}"
fi

"${ZWE_CFG}" -script "${FILE}"

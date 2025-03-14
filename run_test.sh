#!/bin/sh

if  [ -z "${ZWET_ZOWE_RUNTIME_DIRECTORY}" ]; then
    . ./zwe-test.conf
    if  [ -z "${ZWET_ZOWE_RUNTIME_DIRECTORY}" ]; then
        echo "Environment variable 'ZWET_ZOWE_RUNTIME_DIRECTORY' not set."
        echo "Update 'zwe-test.conf' or set environment variable ZWET_ZOWE_RUNTIME_DIRECTORY=/path/to/zowe/runtime"
        exit 1
    fi
fi

# Make it absolute path
currentDirectory=$(pwd)
cd "${ZWET_ZOWE_RUNTIME_DIRECTORY}"
zoweRuntimeAbsolutePath=$(pwd)
cd "${currentDirectory}"

export ZWET_ZOWE_RUNTIME_DIRECTORY="${zoweRuntimeAbsolutePath}"

# Check/read symbolic link or create new one
SYM_LINK='./lib/.zwe-test-zowe.runtimeDirectory'
if [ -e "${SYM_LINK}" ]; then
    if [ -L "${SYM_LINK}" ]; then
        if [ "$(readlink ${SYM_LINK})" != "${zoweRuntimeAbsolutePath}" ]; then
            echo "'${SYM_LINK}' is a soft link but does not point to '${zoweRuntimeAbsolutePath}'. Please move it out of the way and re-run this script."
            exit 2
        else
            echo "'${SYM_LINK}' exists and points to ${zoweRuntimeAbsolutePath}"
        fi
    else
        echo "${SYM_LINK} exists but is not a symbolic link. Remove it and re-run this script."
        exit 3
    fi
else
    echo "Linking '${zoweRuntimeAbsolutePath}' to '${SYM_LINK}'"
    ln -s "${zoweRuntimeAbsolutePath}" "${SYM_LINK}"
fi

ZWET_CONFIGMGR="${zoweRuntimeAbsolutePath}/bin/utils/configmgr"
unset FILE

if [ "${1}" = "-p" ]; then
    echo "${zoweRuntimeAbsolutePath}/bin/zwe"
    exit
fi

if [ -z "${1}" ]; then
    FILE="./test.js"
else
    FILE="${1}"
fi

"${ZWET_CONFIGMGR}" -script "${FILE}"

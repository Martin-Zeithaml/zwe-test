#!/bin/sh

EXAMPLE_ZOWE='example-zowe.yaml'

if  [ -z "${ZWET_ZOWE_RUNTIME_DIRECTORY}" ]; then
    . ./zwe-test.conf
    if  [ -z "${ZWET_ZOWE_RUNTIME_DIRECTORY}" ]; then
        echo "Environment variable 'ZWET_ZOWE_RUNTIME_DIRECTORY' not set."
        echo "Update 'zwe-test.conf' or set environment variable ZWET_ZOWE_RUNTIME_DIRECTORY=/path/to/zowe/runtime"
        exit 1
    fi
    if [ ! -d "${ZWET_ZOWE_RUNTIME_DIRECTORY}" ]; then
        echo "'${ZWET_ZOWE_RUNTIME_DIRECTORY}' is not a valid directory"
        exit 1
    fi
    if [ ! -f "${ZWET_ZOWE_RUNTIME_DIRECTORY}/${EXAMPLE_ZOWE}" ]; then
        echo "Warning: file '${EXAMPLE_ZOWE}' not found in '${ZWET_ZOWE_RUNTIME_DIRECTORY}'"
    fi
fi

# Make it absolute path
currentDirectory=$(pwd)
cd "${ZWET_ZOWE_RUNTIME_DIRECTORY}"
zoweRuntimeAbsolutePath=$(pwd)
cd "${currentDirectory}"

export ZWET_ZOWE_RUNTIME_DIRECTORY="${zoweRuntimeAbsolutePath}"

# Create symbolic link
SYM_LINK='./lib/.zwe-test-zowe.runtimeDirectory'
echo "Linking '${zoweRuntimeAbsolutePath}' to '${SYM_LINK}'"
ln -fs "${zoweRuntimeAbsolutePath}" "${SYM_LINK}"

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

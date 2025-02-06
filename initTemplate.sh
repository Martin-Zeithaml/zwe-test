#!/bin/sh

if [ "$1" = "--help" ]; then
    echo "Mandatory parameter: /ideally/absolute/path/to/zowe/runtime"
    exit 0
fi

if [ -z "$1" ]; then
    echo "Missing parameter: /ideally/absolute/path/to/zowe/runtime"
    exit 1
fi

zoweRuntime="${1}"
currentDirectory=$(pwd)
cd "${zoweRuntime}"
zoweRuntime=$(pwd)
cd "${currentDirectory}"

allFiles="lib/ds.js lib/misc.js lib/print.js zowe.env test.js"
for f in $allFiles; do
    echo "Changing ${f}"
    cat "${f}" | awk -v zr="${zoweRuntime}" '{ gsub(/@RUNTIME@/, zr); print } ' > "${f}.tmp" && mv "${f}.tmp" "${f}"
done

failed=
for f in $allFiles; do
    result=$(cat "${f}" | grep "${zoweRuntime}" 1>/dev/null 2>/dev/null)
    if [ ! -z "${result}"]; then
        echo "Verifying ${f} [Error]"
        failed=true
    else
        echo "Verifying ${f} [OK]"
    fi
done

if [ -n "${failed}" ]; then
    echo "Something went wrong"
    echo "Review the ouptut above"
    exit 1
else
    echo "I am not needed, deleting myself"
    rm ./initTemplate.sh
fi

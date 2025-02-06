export const EMPTY = [ " " ];

export const CONFIG_MGR_FALSE = [
    "zowe:",
    "  useConfigmgr: false"
]

export const SMALL_CONFIG = [
    "zowe:",
    "  setup:",
    "    dataset:",
    `      prefix: ZOWE.TEST`,
    "  useConfigmgr: true",
    "node:",
    "  home: /dev/null"
]

export const RUNTIME_DEV_NULL = [
    "zowe:",
    "  runtimeDirectory: /dev/null",
];

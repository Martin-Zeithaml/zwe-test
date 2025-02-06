const ANSI = 0;
const DIFF = 1;
const NONE = 2;

const COLORS = ANSI;

const _RED =        ["\u001b[31m", '- ', ''];
const _GREEN =      ["\u001b[32m", '+ ', ''];
const _YELLOW =     ["\u001b[33m", '  ', ''];
const _BLUE =       ["\u001b[34m", '  ', ''];
const _MAGENTA =    ["\u001b[35m", '! ', ''];
const _CYAN =       ["\u001b[36m", '  ', ''];
const _WHITE =      ["\u001b[37m", '  ', ''];
const _RESET =      ["\u001b[0m",  '',   ''];

export const RED = _RED[COLORS];
export const GREEN = _GREEN[COLORS];
export const YELLOW = _YELLOW[COLORS];
export const BLUE = _BLUE[COLORS];
export const MAGENTA = _MAGENTA[COLORS];
export const CYAN = _CYAN[COLORS];
export const WHITE = _WHITE[COLORS];
export const RESET = _RESET[COLORS];

export function decorate(str, spaces = 4, nlBefore = true, nlAfter = true, capsLock = true) {
    let stringToReturn = '';
    let strUpper = capsLock == true ? str.toUpperCase() : str;
    let line = '';
    stringToReturn += '..::|[ ';
    for (let i = 0; i < strUpper.length; i++) {
        if (str[i] == ' ')
            stringToReturn += '    ';
        else {
            stringToReturn += strUpper[i] + ' '
        }
    }
    stringToReturn += ']|::..';
    line = ' '.repeat(spaces) + '-'.repeat(stringToReturn.length);
    stringToReturn = ' '.repeat(spaces) + stringToReturn;
    stringToReturn = stringToReturn + '\n' + line;
    if (nlBefore)
        stringToReturn = '\n' + stringToReturn;
    if (nlAfter) 
        stringToReturn += '\n';
    return stringToReturn;
}

export function formatMsg(severity, printMsg, counter, info, rest) {
    const SEVERITY = [ GREEN, CYAN, RED ];
    const COLOR = SEVERITY[severity];
    const colonRest = rest == '' ? '' : `: ${rest}`;
    const finalString = COLOR + `[${counter}][${info.padEnd(32)}]${colonRest}` + RESET
    if (printMsg) {
        console.log(finalString);
    }
    return finalString;
}

export function debug(routine, parameters, color) {
    if (color == undefined)
        color = MAGENTA;
    if (routine) {
        console.log(color + `[${routine}]: ${parameters}` + RESET);
    } else {
        console.log(color + parameters + RESET);
    }

}

export function escapeDollar(str) {
    if (str === null || str === undefined)
      return undefined;
    return str.replace(/[$]/g, '\\$&');
}

function addFileOrParmlib(isConfig, ...args) {
    let config = '';
    let add = '';
    for (let arg in args) {
        // To simplify the code, startsWith . or / is file
        if (args[arg].startsWith('.') || args[arg].startsWith('/')) {
            if (isConfig) {
                add = `FILE(${escapeDollar(args[arg])})`
            } else {
                add = `FILE(${args[arg]})`;
            }
        } else {
            if (isConfig) {
                add = `PARMLIB(${escapeDollar(args[arg])})`
            } else {
                add = `PARMLIB(${args[arg]})`;
            }
        }
        if (config) {
            config += ':' + add;
        } else {
            config = add;
        }
    }
    return config
}

export function wrap(...args) {
    return addFileOrParmlib(false, ...args);
}

export function wrapAndEscape(...args) {
    return addFileOrParmlib(true, ...args);
}
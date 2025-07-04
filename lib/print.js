import * as env from './env';

const COLOR_OPTIONS = [ 'ANSI', 'DIFF', 'NONE' ];

const _RED =        ["\u001b[31m", '- ', ''];
const _GREEN =      ["\u001b[32m", '+ ', ''];
const _YELLOW =     ["\u001b[33m", '  ', ''];
const _BLUE =       ["\u001b[34m", '  ', ''];
const _MAGENTA =    ["\u001b[35m", '! ', ''];
const _CYAN =       ["\u001b[36m", '  ', ''];
const _WHITE =      ["\u001b[37m", '  ', ''];
const _RESET =      ["\u001b[0m",  '',   ''];

const COLOR_INDEX = COLOR_OPTIONS.indexOf(env.getenvWithDefaults('ZWET_COLORS', COLOR_OPTIONS, false));

export const RED = _RED[COLOR_INDEX];
export const GREEN = _GREEN[COLOR_INDEX];
export const YELLOW = _YELLOW[COLOR_INDEX];
export const BLUE = _BLUE[COLOR_INDEX];
export const MAGENTA = _MAGENTA[COLOR_INDEX];
export const CYAN = _CYAN[COLOR_INDEX];
export const WHITE = _WHITE[COLOR_INDEX];
export const RESET = _RESET[COLOR_INDEX];

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

function simpleYamlLineSyntax(str) {
    if (str.indexOf(':') == -1) {
        return `${YELLOW}${str}${RESET}`
    } else {
        return `${CYAN}${str.replace(':',`${WHITE}:${YELLOW}`)}${RESET}`
    }
}

export function simpleYamlSyntax(input) {
    const inputArray = input.split("\n");
    let output = '';
    for (let i = 0; i < inputArray.length; i++) {
        if (i == 0) {
            output = simpleYamlLineSyntax(inputArray[i]);
        } else {
            output += "\n" + simpleYamlLineSyntax(inputArray[i]);
        }
    }
    return output;
}

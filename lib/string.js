export function escapeDollar(str) {
    if (str === null || str === undefined)
      return undefined;
    return str.replace(/[$]/g, '\\$&');
}

export function resolveTemplate(templateString, data) {
  const template = new Function('return `' + templateString + '`;');
  return template.call(data);
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

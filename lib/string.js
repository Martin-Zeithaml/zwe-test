export function escapeDollar(str) {
    if (str === null || str === undefined)
      return undefined;
    return str.replace(/[$]/g, '\\$&');
}

export function resolveTemplate(templateString, data) {
  const template = new Function('return `' + templateString + '`;');
  return template.call(data);
}

function addFileOrParmlib(escape, ...args) {
  let config = '';
  let wrappedConfigItem = '';
  for (let arg in args) {
      // To simplify the code, startsWith . or / is FILE
      const configItem = escape ? escapeDollar(args[arg]) : args[arg];
      const configType = (args[arg].startsWith('.') || args[arg].startsWith('/')) ? ':FILE' : ':PARMLIB';
      wrappedConfigItem = `${configType}(${configItem})`;
      config += wrappedConfigItem;
  }
  // Do not return first ':'
  return config.substring(1);
}

export function wrap(...args) {
  return addFileOrParmlib(false, ...args);
}

export function wrapAndEscape(...args) {
  return addFileOrParmlib(true, ...args);
}

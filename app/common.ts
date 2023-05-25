export const LOG = (...args: any[]) => process.env.DEBUG && console.log(`[${new Date().toISOString()}] `, ...args);

export function guessType(value) {
  const number = /^-?\d*\.?\d*$/;
  const boolean = /(true|false)/;

  if (number.test(value)) {
      return Number;
  }

  if (boolean.test(value)) {
      return JSON.parse;
  }

  return ((v) => v);
}

export function convert(value, type) {
  const typemap = {
      'number': Number,
      'boolean': Boolean,
      'string': String,
  };
  const converter = typemap[type] || guessType(value);
  return converter(value);
}

// /:hash/:path
// hash is 64 chars long
export function splitHashAndPath(url: string) {
  const hash = url.slice(1, 65);
  const path = url.slice(66);

  return { hash, path };
}

export function set(target, path, value) {
  const segments = path.split('.');
  const property = segments.pop();

  let segment: string;

  while (segment = segments.shift()) {
    if (target[segment] === undefined) {
      target[segment] = {};
    }

    target = target[segment];
  }

  target[property] = value;
}

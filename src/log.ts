import process from 'node:process';

export const LOG = (...args: any[]) => process.env.DEBUG && console.log(`[${new Date().toISOString().slice(0, 19)}] `, ...args);

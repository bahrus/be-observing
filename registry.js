// @ts-check

/**
 * @typedef {{args: Array<any>, f: {[key: string]: any}, target: Element, r: any}} AggEvent
 * @typedef {(e: AggEvent) => void} AggHandler
 */

/** @type {Map<string, AggHandler>} */
const handlers = new Map();

/**
 * Register a named aggregator/handler for use in be-observing expressions.
 * @param {string} name
 * @param {AggHandler} handler
 */
export function register(name, handler) {
    handlers.set(name, handler);
}

/**
 * Get a registered handler by name.
 * @param {string} name
 * @returns {AggHandler | undefined}
 */
export function get(name) {
    return handlers.get(name);
}

// Built-in aggregators
register('&&', e => { e.r = e.args.reduce((acc, arg) => acc && arg); });
register('||', e => { e.r = e.args.reduce((acc, arg) => acc || arg); });
register('+', e => { e.r = e.args.reduce((acc, arg) => acc + Number(arg), 0); });
register('*', e => { e.r = e.args.reduce((acc, arg) => acc * Number(arg), 1); });
register('{}', e => { e.r = e.f; });
register('||!', e => { e.r = e.args.reduce((acc, arg) => acc || !arg); });
register('&&!', e => { e.r = e.args.reduce((acc, arg) => acc && !arg); });

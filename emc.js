// @ts-check
import { BeHive, seed, MountObserver } from 'be-hive/be-hive.js';
import {Registry} from 'be-hive/Registry.js';
import {aggs} from 'be-hive/aggEvt.js';
import { w as bw } from 'be-hive/w.js';
/** @import {EMC, EventListenerOrFn} from './ts-refs/trans-render/be/types' */
/** @import {Actions, PAP,  AP} from './ts-refs/be-observing/types' */;
/** @import {CSSQuery} from './ts-refs/trans-render/types.js' */

const dependencyPart = String.raw `(?<dependencyPart>.*)`;
//const ofDependencyPart = String.raw `of ${dependencyPart}`;
const ofDependencies = String.raw `^(o|O)f ${dependencyPart}`;

const ofDependenciesAndSetProp = String.raw `${ofDependencies} and set (?<localPropToSet>.*)`;

const toAggregator = String.raw `${ofDependencies} and set to (?<aggKey>.*)`;

/**
 * @type {Array<[string, string]>}
 */
const dssArrayKeys = [['dependencyPart', 'remoteSpecifiers']];
/**
 * @type {Partial<EMC<any, AP>>}
 */
export const emc = {
    base: 'be-observing',
    map: {
        '0.0': {
            instanceOf: 'Object$entences',
            objValMapsTo: '.',
            regExpExts: {
                parsedStatements: [
                    {
                        regExp: toAggregator,
                        defaultVals: {
                        },
                        dssArrayKeys
                    },
                    {
                        regExp: ofDependenciesAndSetProp,
                        defaultVals: {
                            aggKey: '&&'
                        },
                        dssArrayKeys
                    },
                    {
                        regExp: ofDependencies,
                        defaultVals:{
                            aggKey: '&&'
                        },
                        dssArrayKeys
                    }

                ]
            }
        }
    },
    enhPropKey: 'beobserving',
    importEnh: async () => {
        const {Beobserving} = await import('./be-observing.js');
        return Beobserving;
    },
    ws:[],
    mapWSTo: 'ws'
}

const mose = seed(emc);
MountObserver.synthesize(document, BeHive, mose);

for(const key in aggs){
    Registry.register(emc, key, aggs[key]);
}

/**
 * 
 * @param {string} handlerName 
 * @param {EventListenerOrFn} handler 
 */
export function register(handlerName, handler){
    Registry.register(emc, handlerName, handler);
}

/**
 * 
 * @param {CSSQuery} q 
 */
export function w(q){
    return bw(q, emc.ws);
}
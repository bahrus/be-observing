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
const dependencies = String.raw `^${dependencyPart}`;

const dependenciesAndSetPropToAgg = String.raw `${dependencies} and set (?<localPropToSet>.*) to (?<aggKey>.*)`;

const dependenciesAndPunt = String.raw `${dependencies} then punt`;

const dependenciesThenJS = String.raw `${dependencies} then js\`\`\`(?<JSExpr>.*)\`\`\``;

const dependenciesAndSetProp = String.raw `${dependencies} and set (?<localPropToSet>.*)`;

const toAggregator = String.raw `${dependencies} and set to (?<aggKey>.*)`;

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
                        regExp: dependenciesThenJS,
                        defaultVals:{},
                        dssArrayKeys
                    },
                    {
                        regExp: dependenciesAndSetPropToAgg,
                        defaultVals:{},
                        dssArrayKeys
                    },
                    {
                        regExp: dependenciesAndPunt,
                        defaultVals:{
                            punt: true
                        },
                        dssArrayKeys
                    },
                    {
                        regExp: toAggregator,
                        defaultVals: {
                        },
                        dssArrayKeys
                    },
                    {
                        regExp: dependenciesAndSetProp,
                        defaultVals: {
                            aggKey: '&&'
                        },
                        dssArrayKeys
                    },
                    {
                        regExp: dependencies,
                        defaultVals:{
                            aggKey: '&&'
                        },
                        dssArrayKeys
                    }

                ]
            }
        }
    },
    enhPropKey: 'beObserving',
    importEnh: async () => {
        const {BeObserving} = await import('./be-observing.js');
        return BeObserving;
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
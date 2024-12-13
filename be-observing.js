// @ts-check
import { BE } from 'be-enhanced/BE.js';
import { propInfo, resolved, rejected } from 'be-enhanced/cc.js';
import { dispatchEvent as de } from 'trans-render/positractions/dispatchEvent.js';

/** @import {BEConfig, IEnhancement, BEAllProps} from './ts-refs/be-enhanced/types' */
/** @import {Actions, PAP, AP, BAP, ObservingParameters} from './ts-refs/be-observing/types' */
/** @import {Specifier} from  './ts-refs/trans-render/dss/types' */
/** @import {AbsorbingObject} from './ts-refs/trans-render/asmr/types' */
/**
 * @implements {Actions}

 * 
 */
class BeObserving extends BE {
    de = de;
    /**
     * @type {BEConfig<BAP, Actions & IEnhancement, any>}
     */
    static config = {
        propDefaults: {
            didInferring: false,
        },
        propInfo: {
            ...propInfo,
            parsedStatements: {},
            customHandlers: {},
            ws: {},
        },
        actions: {
            noAttrs: {
                ifNoneOf: ['parsedStatements']
            },
            seek: {
                ifAllOf: ['didInferring', 'parsedStatements']
            },
            infer: {
                ifAllOf: ['parsedStatements'],
                ifNoneOf: ['didInferring']
            }
        },
        positractions: [
            resolved, rejected,
            {
                do: 'warn',
                ifAllOf: ['rawStatements'],
                pass: ['`The following statements could not be parsed.`', 'rawStatements']
            }
        ]
    }

    warn = console.warn;

    /**
     * 
     * @param {BAP} self 
     */
    async infer(self){
        const {parsedStatements, enhancedElement} = self;
        //do any pre processing here, if applicable
        //if no scenario presents itself, remove this linked action
        return /** @type {PAP} */({
            didInferring: true,
        });
    }

    /**
     * 
     * @param {BAP} self 
     */
    async noAttrs(self){
        const {enhancedElement} = self;
        const {stdProp} = await import('trans-render/asmr/stdProp.js');
        /**
         * @type {Specifier}
         */
        const specifier = {
            s: '/',
            elS: '*',
            dss: '^',
            scopeS: '[itemscope]',
            rec: true,
            rnf: true,
            prop: stdProp(enhancedElement),
            host: true
        }
        /**
         * @type {ObservingParameters}
         */
        const parsedStatement = {
            remoteSpecifiers: [specifier],
            aggKey: '&&'
        };
        return /** @type {PAP} */({
            didInferring: true,
            parsedStatements: [parsedStatement]
        });
    }

    /**
     * 
     * @param {BAP} self 
     */
    async seek(self){
        const {parsedStatements, enhancedElement} = self;
        const {find} = await import('trans-render/dss/find.js');
        
        for(const statement of parsedStatements){
            const {punt} = statement;
            if(punt){
                const {remoteSpecifiers} = statement;
                for(const remoteSpecifier of remoteSpecifiers){
                    const remoteEl = await find(enhancedElement, remoteSpecifier);
                    if(!(remoteEl instanceof Element)) throw 404;
                }
                continue;
            }


            const {ASMR} = await import('trans-render/asmr/asmr.js');
            const {ASMRHandler} = await import('./ASMRHandler.js');
            const {customHandlers} = self;
            /**
             * @type {{[key: string]: AbsorbingObject}}
             */
            const propToAO = {};
            const {remoteSpecifiers, localPropToSet, aggKey} = statement;
            for(const remoteSpecifier of remoteSpecifiers){
                const remoteEl = await find(enhancedElement, remoteSpecifier);
                if(!(remoteEl instanceof Element)) throw 404;
                const {prop} = remoteSpecifier;
                if(prop === undefined) throw 'NI';
                let remoteProp;
                const {s} = remoteSpecifier;
                switch(s){
                    case '/':
                    case '-':
                        remoteProp = prop;
                        break;
                }
                const ao = await ASMR.getAO(remoteEl, {
                    evt: remoteSpecifier.evt || 'input',
                    selfIsVal: remoteSpecifier.path === '$0',
                    propToAbsorb: remoteProp,
                });
                propToAO[prop] = ao;
            }
            const so = await ASMR.getSO(enhancedElement, {valueProp: localPropToSet});
            //TODO: store asmrh for cleanup purposes
            const asmrh = new ASMRHandler(self, aggKey, so, propToAO);
        }
        return /** @type {PAP} */({
        });
    }

}

await BeObserving.bootUp();
export {BeObserving}



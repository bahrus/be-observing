// @ts-check
import { BE } from 'be-enhanced/BE.js';
import { propInfo, resolved, rejected } from 'be-enhanced/cc.js';
import { dispatchEvent as de } from 'trans-render/positractions/dispatchEvent.js';
import { lispToCamel } from 'trans-render/lib/lispToCamel.js';

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
            rawStatements: {},
            customHandlers: {},
            ws: {},
            enhKey: {},
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
            // s: '/',
            // elS: '*',
            // dss: '^',
            // scopeS: '[itemscope]',
            // rec: true,
            // rnf: true,
            // prop: stdProp(enhancedElement),
            // host: true
            prop: stdProp(enhancedElement)
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
     * @type {AbortController | undefined}
     */
    #ac;

    /**
     * 
     * @param {BAP} self 
     */
    async seek(self){
        const {parsedStatements, enhancedElement} = self;
        const {find} = await import('trans-render/dss/find.js');
        const {ASMR} = await import('trans-render/asmr/asmr.js');
        const {ASMRHandler} = await import('./ASMRHandler.js');
        //const {customHandlers} = self;
        for(const statement of parsedStatements){

            /**
             * @type {{[key: string]: AbsorbingObject}}
             */
            const propToAO = {};
            const {remoteSpecifiers, localPropToSet, action, interpolatingExpr} = statement;
            if(interpolatingExpr !== undefined && localPropToSet?.endsWith('HTML')){
                throw 403;
            }
            for(const remoteSpecifier of remoteSpecifiers){
                const remoteEl = await find(enhancedElement, remoteSpecifier);
                //if(!(remoteEl instanceof EventTarget)) throw 404;
                if(!(remoteEl instanceof EventTarget)){
                    enhancedElement.setAttribute('data-iah', 'yikes');
                    enhancedElement.textContent = 'yikes';
                    console.warn(404, enhancedElement, remoteSpecifier);
                    continue;
                }
                const {prop} = remoteSpecifier;
                let scriptingPropName = prop;
                if(prop === undefined){
                    if(!(remoteEl instanceof HTMLElement)) throw 'NI';
                    const remoteIDSrcName = remoteEl.dataset.id || remoteEl.id;
                    if(!remoteIDSrcName) throw 'NI';
                    scriptingPropName = lispToCamel(remoteIDSrcName);
                }
                if(scriptingPropName === undefined) throw 500;
                const {path, as, evtName} = remoteSpecifier;
                const ao = await ASMR.getAO(remoteEl, {
                    evt: evtName || 'input',
                    //TODO:  find if this is still applicable somewhere
                    //selfIsVal: self && path === undefined && prop === undefined,
                    propToAbsorb: path !== undefined ? `?.${prop}?.${path}` : prop,
                    as
                });
                propToAO[scriptingPropName] = ao;
            }
            if(Object.keys(propToAO).length === 0) return;
            const so = await ASMR.getSO(enhancedElement, {
                valueProp: localPropToSet,
                action
            });
            //TODO: store asmrh for cleanup purposes
            const asmrh = new ASMRHandler(self, propToAO, so, statement);
        }
        return /** @type {PAP} */({
        });
    }

    async detach(el){
        if(this.#ac !== undefined){
            this.#ac.abort();
        }
        super.detach(el);
    }

}

await BeObserving.bootUp();
export {BeObserving}



// @ts-check
import {AggEvent, rguid} from 'be-hive/aggEvt.js';
/** @import {StringWithAutocompleteOptions} from './ts-refs/trans-render/types' */
/** @import {aggKeys, Handlers} from './ts-refs/be-hive/types' */
/** @import {SharingObject, AbsorbingObject} from './ts-refs/trans-render/asmr/types' */
/** @import {BEAllProps, EventListenerOrFn} from './ts-refs/trans-render/be/types' */
/** @import {BAP} from './ts-refs/be-observing/types' */

/**
 * @implements {EventListenerObject}
 */
export class ASMRHandler extends EventTarget{


    /**
     * @type {EventListenerOrFn}
     */
    #handlerObj;


    /**
     * @type {SharingObject}
     */
    #localSharingObject;

    /**
     * @type {{[key: string] : AbsorbingObject}}
     */
    #propToAO;

    /**
     * @type {AbortController | undefined}
     */
    #ac;

    #punt = false;

    /**
     * @type {WeakRef<BAP>}
     */
    #selfRef;

    /**
     * @type {string}
     */
    #jsExpr;

    /**
     * @param {import('./ts-refs/be-observing/types').BAP} self
     * @param {aggKeys} aggKey 
     * @param {SharingObject} localSharingObject 
     * @param {{[key: string] : AbsorbingObject}} propToAO
     * @param {boolean} punt 
     * @param {string} JSExpr
     */
    constructor(self, aggKey, localSharingObject, propToAO, punt, JSExpr){
        super();
        this.#selfRef = new WeakRef(self);
        //this.#aggKey = aggKey;
        const {customHandlers, ws} = self;
        // if(scopedCustomHandlers !== undefined){
        //     const possibleHandlers = scopedCustomHandlers.get(aggKey);
        //     if(possibleHandlers !== undefined){
        //         for(const possibleHandler of possibleHandlers){
        //             const [cssQ, handlerObj] = possibleHandler;
        //             if(enhancedElement.closest(cssQ) !== null){
        //                 this.#handlerObj = handlerObj;
        //                 break;
        //             }
        //         }
        //     }
        // }
        if(ws !== undefined){
            for(const w of ws){
                const {refs} = w;
                if(refs !== undefined){
                    const handlerObj = refs[aggKey];
                    if(handlerObj !== undefined){
                        this.#handlerObj = handlerObj;
                        break;
                    }
                }
            }
        }
        if(aggKey !== undefined &&  this.#handlerObj === undefined){
            const handlerObj = customHandlers.get(aggKey);
            if(handlerObj === undefined) throw 404;
            this.#handlerObj = handlerObj;
        }
        this.#localSharingObject = localSharingObject;
        this.#propToAO = propToAO;
        this.#punt = punt;
        this.#jsExpr = JSExpr;
        const ac = this.#ac =  new AbortController;
        const aos = Object.values(propToAO);
        for(const ao of aos){
            ao.addEventListener('.', this, {signal: ac.signal})
        }
        this.handleEvent();
    }


    /**
     * @type {boolean | undefined}
     */
    #isClass;

    /**
     * @type {EventListenerObject }
     */
    #handlerObjInstance
    async handleEvent() {
        const obj = {};
        const args = [];
        const propToAO = this.#propToAO;
        for(const prop in propToAO){
            const ao = propToAO[prop];
            const val = await ao.getValue();
            args.push(val)
            obj[prop] = val;
        }
        if(this.#punt){
            const self = this.#selfRef.deref();
            if(self === undefined) return;
            self.channelEvent(new SelfEvent(self, args, obj, self.enhancedElement));
        } else if(this.#jsExpr){
            
            const self = this.#selfRef.deref();
            if(self === undefined) return;
            const {activate} = await import('trans-render/lib/activate.js');
            const handler = activate(this.#jsExpr);
//             const guid = `a_${crypto.randomUUID()}`;

//         const JSExpr = `
// document.currentScript['${guid}'] = e => {
//     with(e.target){
//         ${this.#jsExpr}
//     }
// }
// `
//         console.log({JSExpr});
//             const script = document.createElement('script');
//             script.innerHTML = JSExpr;
//             document.head.appendChild(script);
//             const handler = script[guid];
            const se = new SelfEvent(self, args, obj, self.enhancedElement)
            handler(se);
            
        
        }else{
            const inputEvent = new InputEvent(args, obj, this);
            const handlerObj = this.#handlerObj;
            if(this.#isClass === undefined){
                this.#isClass = handlerObj.toString().substring(0, 5) === 'class';
            }
            if(this.#isClass){
                if(this.#handlerObjInstance === undefined){
                    this.#handlerObjInstance = new handlerObj();
                }
                this.#handlerObjInstance.handleEvent(inputEvent);
            }else{
                handlerObj(inputEvent);
            }
            this.dispatchEvent(inputEvent);
            if(inputEvent.r !== rguid){
                this.#localSharingObject.setValue(inputEvent.r);
            }
        }

    }

}

export class InputEvent extends AggEvent {
    static eventName = 'input';

    /**
     * 
     * @param {Array<any>} args 
     * @param {{[key: string]: any}} f 
     * @param {Element} target
     */
    constructor(args, f, target){
        super(InputEvent.eventName, args, f, target);
    }
}


export class SelfEvent extends Event{
    self;
    args;
    f;
    target;


    /**
     * 
     * @param {BAP} self 
     * @param {Array<any>} args 
     * @param {{[key: string]: any}} f 
     * @param {EventTarget} target 
     */
    constructor(self, args, f, target){
        super(self.enhancementInfo.mountCnfg.enhPropKey);
        this.self = self;
        this.args = args;
        this.f = f;
        this.target = target;
    }
}


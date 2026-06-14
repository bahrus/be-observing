// @ts-check
/** @import {Actions, PAP, AllProps, AP, ObservingParameters, RemoteSpecifier} from './types/be-observing/types' */;
/** @import {RoundaboutOptions} from './types/roundabout/types' */;
/** @import {ElementEnhancementGateway, SpawnContext} from './types/assign-gingerly/types' */;
/** @import {EMC} from './types/mount-observer/types' */;
/** @import {RAConfig} from './types/roundabout/types' */;
/** @import {Infer} from './types/inferencer/types' */;

/**
 * @implements {Actions}
 */
class BeObserving {

    /**
     * @this {AllProps & Actions}
     * @param {Element & ElementEnhancementGateway} enhancedElement
     * @param {SpawnContext} ctx
     * @param {PAP} initVals
     */
    constructor(enhancedElement, ctx, initVals) {
        this.init(this, enhancedElement, ctx, initVals);
    }

    /**
     * @param {AllProps} self
     * @param {Element & ElementEnhancementGateway} enhancedElement
     * @param {SpawnContext} ctx
     * @param {PAP} initVals
     */
    async init(self, enhancedElement, ctx, initVals) {
        const {customData} = /** @type {EMC<any, AllProps, Element, RAConfig<AllProps, Actions>>} */ (ctx.emc);
        /** @type {RoundaboutOptions} */
        const raOptions = {
            ...customData,
            vm: self,
            initialPropVals: {
                enhancedElement,
                ...customData?.defaultPropVals,
                enhKey: ctx.emc?.enhConfig?.enhKey || 'be-observing',
                ...initVals
            }
        };
        (await import('roundabout-lib/roundabout.js')).roundabout(raOptions);
    }

    /**
     * Pre-processing step for parsed statements.
     * Parses dependencyPart into remoteSpecifiers.
     * @param {AP} self
     * @returns {PAP}
     */
    infer(self) {
        const {parsedStatements} = self;
        if (!parsedStatements) return /** @type {PAP} */ ({didInferring: true});
        const {statements, success} = parsedStatements;
        if (!success || !statements) return /** @type {PAP} */ ({didInferring: true});

        for (const statement of statements) {
            const {value} = statement;
            if (!value) continue;
            const val = /** @type {any} */ (value);
            if (val.dependencyPart && !val.remoteSpecifiers) {
                val.remoteSpecifiers = parseDependencyPart(val.dependencyPart);
            }
            if (val.punt === 'true') val.punt = true;
            if (!val.punt) val.punt = false;
        }
        return /** @type {PAP} */ ({
            didInferring: true
        });
    }

    /** @type {AbortController | undefined} */
    #ac;

    /**
     * Find remote elements, set up observers, and handle values.
     * @param {AP} self
     * @returns {Promise<PAP>}
     */
    async seek(self) {
        const {parsedStatements, enhancedElement, enhKey} = self;
        if (!parsedStatements) return {};
        const {statements, success} = parsedStatements;
        if (!success || !statements) return {};

        if (this.#ac) this.#ac.abort();
        this.#ac = new AbortController();
        const ac = this.#ac;

        const {upSearch} = await import('inferencer/upSearch.js');
        const {Infer: InferClass} = await import('inferencer/inferencer.js');

        // If no statements (empty/boolean attribute), push an empty one for inference
        if (statements.length === 0) {
            statements.push({value: {}});
        }

        const localInference = new InferClass(enhancedElement);

        for (const statement of statements) {
            const {value} = statement;
            if (!value) continue;
            let {remoteSpecifiers, localPropToSet, action, interpolatingExpr, aggKey, punt, JSExpr, ONExpr} = value;

            // Infer remoteSpecifiers if not provided
            if (!remoteSpecifiers || remoteSpecifiers.length === 0) {
                const prop = localInference.defaultRemoteBindingPropName;
                remoteSpecifiers = [{prop}];
            }
            // Default aggKey
            if (!aggKey) aggKey = '&&';

            if (interpolatingExpr && localPropToSet?.endsWith('HTML')) {
                throw 403; // XSS protection
            }

            /** @type {{[key: string]: Infer}} */
            const propToInfer = {};

            for (const remoteSpecifier of remoteSpecifiers) {
                const {id, prop, constVal, as, self: isSelf} = remoteSpecifier;
                if (constVal !== undefined) {
                    // Constant values are handled separately
                    const key = prop || `const_${constVal}`;
                    propToInfer[key] = /** @type {any} */ ({
                        isConst: true,
                        constVal: coerceAs(constVal, as),
                    });
                    continue;
                }
                let remoteEl;
                if (isSelf) {
                    // $0 refers to the enhanced element itself
                    remoteEl = enhancedElement;
                } else if (id && id.startsWith('@')) {
                    // @name - find by name attribute
                    const nameVal = id.slice(1);
                    const root = enhancedElement.getRootNode();
                    remoteEl = root.querySelector(`[name="${nameVal}"]`);
                    if (!remoteEl) {
                        console.warn(404, enhancedElement, remoteSpecifier, `No element with name="${nameVal}"`);
                        continue;
                    }
                } else {
                    try {
                        remoteEl = await upSearch(enhancedElement, id);
                    } catch(e) {
                        console.warn(404, enhancedElement, remoteSpecifier);
                        continue;
                    }
                }
                if (!(remoteEl instanceof Element)) {
                    console.warn(404, enhancedElement, remoteSpecifier);
                    continue;
                }
                let scriptingPropName = prop || remoteEl.dataset?.id || remoteEl.id;
                if (isSelf) scriptingPropName = prop || '$0';
                if (id && id.startsWith('@')) scriptingPropName = prop || id.slice(1);
                if (!scriptingPropName) continue;

                const inferInstance = new InferClass(remoteEl, prop);
                /** @type {any} */ (inferInstance).__prop = prop;
                /** @type {any} */ (inferInstance).__as = as;
                propToInfer[scriptingPropName] = inferInstance;
            }

            if (Object.keys(propToInfer).length === 0) continue;

            // Set up observation handler
            const handler = new ObservationHandler(
                self, enhancedElement, propToInfer,
                {localPropToSet, action, interpolatingExpr, aggKey, punt, JSExpr, ONExpr, enhKey}
            );

            // Subscribe to changes
            for (const name in propToInfer) {
                const inferObj = propToInfer[name];
                if (/** @type {any} */ (inferObj).isConst) continue;
                const propagator = await inferObj.getPropagator();
                // If we have an explicit prop, listen for that; otherwise use inferred valueProperty
                const inferProp = /** @type {any} */ (inferObj).__prop;
                const evtName = inferProp || inferObj.valueProperty;
                propagator.addEventListener(evtName, handler, {signal: ac.signal});
            }

            // Initial evaluation
            handler.handleEvent();
        }
        return {};
    }
}

/**
 * Parse the dependencyPart string into an array of RemoteSpecifier objects.
 * Handles: #id, #id?.prop, @name, host property, constant values (`val` as type)
 * Splits on " and " but only at the top level (not inside action keywords).
 * @param {string} dependencyPart
 * @returns {Array<RemoteSpecifier>}
 */
function parseDependencyPart(dependencyPart) {
    if (!dependencyPart) return [];
    const parts = dependencyPart.split(/\s+and\s+/);
    /** @type {Array<RemoteSpecifier>} */
    const specifiers = [];
    for (const part of parts) {
        const trimmed = part.trim();
        if (!trimmed) continue;
        // Strip leading "of " if present
        const cleaned = trimmed.startsWith('of ') ? trimmed.slice(3).trim() : trimmed;
        specifiers.push(parseOneSpecifier(cleaned));
    }
    return specifiers;
}

/**
 * Parse a single specifier string.
 * Formats:
 *   #elementId          -> { id: 'elementId' }
 *   #elementId?.prop    -> { id: 'elementId', prop: 'prop' }
 *   @name              -> { prop: 'name' } (by name attribute)
 *   `value` as type    -> { constVal: 'value', as: type }
 *   propName           -> { prop: 'propName' } (host property)
 *   :host()            -> { host: true }
 * @param {string} specStr
 * @returns {RemoteSpecifier}
 */
function parseOneSpecifier(specStr) {
    const s = specStr.trim();

    // Constant value: `value` or `value` as type
    const constMatch = s.match(/^`([^`]*)`(?:\s+as\s+(\w+))?$/);
    if (constMatch) {
        return {
            constVal: constMatch[1],
            as: /** @type {any} */ (constMatch[2])
        };
    }

    // :host() - explicit host binding
    if (s === ':host()') {
        return {host: true};
    }

    // $0 - self-reference (enhanced element itself), with optional ?.path and optional as type
    const selfMatch = s.match(/^\$0(?:\?\.(.+?))?(?:\s+as\s+(\w+))?$/);
    if (selfMatch) {
        /** @type {RemoteSpecifier} */
        const spec = {self: true};
        if (selfMatch[1]) spec.prop = selfMatch[1];
        if (selfMatch[2]) spec.as = /** @type {any} */ (selfMatch[2]);
        return spec;
    }

    // #{{id}} or #id with optional ?.prop and optional ::event
    const idMatch = s.match(/^#\{\{(.+?)\}\}(?:\?\.(\S+?))?(?:::(\S+))?$/);
    if (idMatch) {
        /** @type {RemoteSpecifier} */
        const spec = {id: `{{${idMatch[1]}}}`};
        if (idMatch[2]) spec.prop = idMatch[2];
        if (idMatch[3]) spec.evtName = idMatch[3];
        return spec;
    }

    const hashMatch = s.match(/^#(\S+?)(?:\?\.(\S+?))?(?:::(\S+))?$/);
    if (hashMatch) {
        /** @type {RemoteSpecifier} */
        const spec = {id: hashMatch[1]};
        if (hashMatch[2]) spec.prop = hashMatch[2];
        if (hashMatch[3]) spec.evtName = hashMatch[3];
        return spec;
    }

    // @name - by name attribute (search for element with name="...")
    const nameMatch = s.match(/^@(\S+?)(?:::(\S+))?$/);
    if (nameMatch) {
        return {id: `@${nameMatch[1]}`, prop: nameMatch[2] || undefined};
    }

    // Bare property name with optional ::event - host property
    const propMatch = s.match(/^(\S+?)(?:::(\S+))?$/);
    if (propMatch) {
        /** @type {RemoteSpecifier} */
        const spec = {prop: propMatch[1]};
        if (propMatch[2]) spec.evtName = propMatch[2];
        return spec;
    }

    return {prop: s};
}

/**
 * Coerce a value based on the "as" type qualifier.
 * @param {any} val
 * @param {string | undefined} as
 * @returns {any}
 */
function coerceAs(val, as) {
    if (!as) return val;
    switch (as) {
        case 'number': return Number(val);
        case 'boolean': return val === 'true' || val === '1';
        case 'string': return String(val);
        default: return val;
    }
}

/**
 * Handles observation events for a single statement.
 * @implements {EventListenerObject}
 */
class ObservationHandler {
    /** @type {AP} */
    #self;
    /** @type {Element} */
    #enhancedElement;
    /** @type {{[key: string]: Infer}} */
    #propToInfer;
    /** @type {any} */
    #config;
    /** @type {any} */
    #parsedInterpolation;

    /**
     * @param {AP} self
     * @param {Element} enhancedElement
     * @param {{[key: string]: Infer}} propToInfer
     * @param {any} config
     */
    constructor(self, enhancedElement, propToInfer, config) {
        this.#self = self;
        this.#enhancedElement = enhancedElement;
        this.#propToInfer = propToInfer;
        this.#config = config;
    }

    async handleEvent() {
        const propToInfer = this.#propToInfer;
        const enhancedElement = this.#enhancedElement;
        const {localPropToSet, action, interpolatingExpr, aggKey, punt, JSExpr, ONExpr, enhKey} = this.#config;

        /** @type {{[key: string]: any}} */
        const obj = {};
        /** @type {Array<any>} */
        const args = [];

        for (const name in propToInfer) {
            const inferObj = propToInfer[name];
            let val;
            if (/** @type {any} */ (inferObj).isConst) {
                val = /** @type {any} */ (inferObj).constVal;
            } else {
                const el = inferObj.enhancedElement;
                // Check if the prop used for Infer was a path (contains ?.)
                const inferProp = /** @type {any} */ (inferObj).__prop;
                if (inferProp && inferProp.includes('.')) {
                    // dot path like dataset.diff or dataset?.diff
                    val = resolvePath(el, `?.${inferProp}`);
                } else if (inferProp) {
                    // explicit prop name — read directly
                    val = el[inferProp];
                } else {
                    // no explicit prop — use inferred valueProperty
                    val = el[inferObj.valueProperty];
                }
                // Apply coercion if configured
                const asType = /** @type {any} */ (inferObj).__as;
                if (asType) val = coerceAs(val, asType);
            }
            args.push(val);
            obj[name] = val;
        }

        // Handle punt (dispatch event to enhanced element)
        if (punt) {
            const evt = new CustomEvent(enhKey, {detail: {args, f: obj}});
            enhancedElement.dispatchEvent(evt);
            return;
        }

        // Handle JS expression
        if (JSExpr) {
            const fullExpr = `const {f, args} = e;\n${JSExpr}`;
            const handler = new Function('e', fullExpr);
            const event = {f: obj, args, target: enhancedElement, r: undefined};
            handler(event);
            if (event.r !== undefined) {
                await this.#setValue(event.r, localPropToSet, action);
            }
            return;
        }

        // Handle ON expression (mapping)
        if (ONExpr) {
            let val = args.length === 1 ? args[0] : args;
            try {
                const map = JSON.parse(`{${ONExpr}}`);
                switch (val) {
                    case true:
                        val = map['true'] ?? map['?'];
                        break;
                    case false:
                        val = map['false'] ?? map[':'];
                        break;
                    default:
                        if (map[val] !== undefined) {
                            val = map[val];
                        } else if (val) {
                            val = map['?'];
                        } else {
                            val = map[':'];
                        }
                }
            } catch (e) {
                console.error('Failed to parse ON expression', ONExpr, e);
            }
            await this.#setValue(val, localPropToSet, action);
            return;
        }

        // Handle interpolation
        if (interpolatingExpr) {
            if (!this.#parsedInterpolation) {
                this.#parsedInterpolation = parseInterpolation(interpolatingExpr);
            }
            /** @type {Array<string>} */
            const toBeJoined = [];
            for (const part of this.#parsedInterpolation) {
                if (Array.isArray(part)) {
                    const [nameOfProp] = part;
                    const argIndex = Number(nameOfProp);
                    if (!isNaN(argIndex)) {
                        toBeJoined.push(args[argIndex] ?? '');
                    } else {
                        toBeJoined.push(obj[nameOfProp] ?? '');
                    }
                } else {
                    toBeJoined.push(part);
                }
            }
            await this.#setValue(toBeJoined.join(''), localPropToSet, action);
            return;
        }

        // Handle aggregation
        const result = aggregate(args, obj, aggKey);
        await this.#setValue(result, localPropToSet, action);
    }

    /**
     * Set the computed value on the enhanced element.
     * @param {any} val
     * @param {string | undefined} localPropToSet
     * @param {string | undefined} action
     */
    async #setValue(val, localPropToSet, action) {
        const enhancedElement = this.#enhancedElement;
        switch (action) {
            case 'toggle': {
                const prop = localPropToSet || 'hidden';
                /** @type {any} */ (enhancedElement)[prop] = !/** @type {any} */ (enhancedElement)[prop];
                return;
            }
            case 'increment': {
                const prop = localPropToSet || 'value';
                /** @type {any} */ (enhancedElement)[prop] = (Number(/** @type {any} */ (enhancedElement)[prop]) || 0) + 1;
                return;
            }
            case 'decrement': {
                const prop = localPropToSet || 'value';
                /** @type {any} */ (enhancedElement)[prop] = (Number(/** @type {any} */ (enhancedElement)[prop]) || 0) - 1;
                return;
            }
            case 'set-class': {
                const classes = (localPropToSet || '').split(':');
                for (const cls of classes) {
                    if (cls) enhancedElement.classList.toggle(cls.trim(), !!val);
                }
                return;
            }
            case 'set-part': {
                const parts = (localPropToSet || '').split(':');
                for (const part of parts) {
                    if (part) /** @type {HTMLElement} */ (enhancedElement).part.toggle(part.trim(), !!val);
                }
                return;
            }
            default: {
                // Default: set property
                if (localPropToSet) {
                    if (localPropToSet.startsWith('?.')) {
                        setPath(enhancedElement, localPropToSet, val);
                    } else {
                        /** @type {any} */ (enhancedElement)[localPropToSet] = val;
                    }
                } else {
                    // Infer the property to set
                    const {Infer: InferClass} = await import('inferencer/inferencer.js');
                    const inferInstance = new InferClass(enhancedElement);
                    inferInstance.value = val;
                }
            }
        }
    }
}

/**
 * Aggregate multiple values using the specified aggregation key.
 * @param {Array<any>} args
 * @param {{[key: string]: any}} obj
 * @param {string} aggKey
 * @returns {any}
 */
function aggregate(args, obj, aggKey) {
    switch (aggKey) {
        case '&&':
            return args.every(v => !!v);
        case '||':
            return args.some(v => !!v);
        case '+':
            return args.reduce((sum, v) => sum + Number(v), 0);
        case '*':
            return args.reduce((prod, v) => prod * Number(v), 1);
        case '{}':
            return {...obj};
        case '||!':
            return args.some(v => !v);
        case '&&!':
            return args.every(v => !v);
        default:
            // Single value pass-through
            if (args.length === 1) return args[0];
            return args.every(v => !!v);
    }
}

/**
 * Parse an interpolation expression like "${0} eats ${1}" into parts.
 * Returns an array of strings (literal text) and arrays (placeholders).
 * Supports both ${name} and {name} syntax.
 * @param {string} expr
 * @returns {Array<string | [string]>}
 */
function parseInterpolation(expr) {
    /** @type {Array<string | [string]>} */
    const parts = [];
    const re = /\$?\{([^}]+)\}/g;
    let lastIndex = 0;
    let match;
    while ((match = re.exec(expr)) !== null) {
        if (match.index > lastIndex) {
            parts.push(expr.slice(lastIndex, match.index));
        }
        parts.push([match[1]]);
        lastIndex = re.lastIndex;
    }
    if (lastIndex < expr.length) {
        parts.push(expr.slice(lastIndex));
    }
    return parts;
}

/**
 * Resolve a property path on an object.
 * Handles both simple props ("value") and ?. paths ("?.dataset?.diff").
 * @param {any} obj
 * @param {string} path
 * @returns {any}
 */
function resolvePath(obj, path) {
    if (!path.startsWith('?.')) return obj[path];
    const segments = path.split('?.').filter(s => s.length > 0);
    let current = obj;
    for (const seg of segments) {
        if (current == null) return undefined;
        current = current[seg];
    }
    return current;
}

/**
 * Set a value at a property path on an object.
 * Handles both simple props ("value") and ?. paths ("?.form?.rating?.value").
 * @param {any} obj
 * @param {string} path
 * @param {any} value
 */
function setPath(obj, path, value) {
    if (!path.startsWith('?.')) {
        obj[path] = value;
        return;
    }
    const segments = path.split('?.').filter(s => s.length > 0);
    let current = obj;
    for (let i = 0; i < segments.length - 1; i++) {
        if (current == null) return;
        current = current[segments[i]];
    }
    if (current != null) {
        current[segments[segments.length - 1]] = value;
    }
}

export {BeObserving};

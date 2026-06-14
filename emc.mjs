// @ts-check

/** @import {EMC} from './types/mount-observer/types' */;
/** @import {AllProps, Actions} from './types/be-observing/types' */
/** @import {RAConfig} from './types/roundabout/types' */
/** @import {PatternConfig} from './types/nested-regex-groups/types' */

/** @type {PatternConfig[]} */
const parsePatterns = [
    {
        name: 'dependenciesAndSetPropToInterpolatingExpr',
        pattern: String.raw`^(?<dependencyPart>.*) and set (?<localPropToSet>.*) to \x60(?<interpolatingExpr>.*)\x60`,
        description: 'Dependencies and set property to interpolating expression: #a and #b and set prop to `${0} eats ${1}`',
        defaultVals: {}
    },
    {
        name: 'dependenciesThenOnAndSetProp',
        pattern: String.raw`^(?<dependencyPart>.*) then ON\{(?<ONExpr>.*)\} and (?<action>set|toggle|increment|decrement|set-class|set-part) (?<localPropToSet>.*)`,
        description: 'Dependencies then ON mapping and set/toggle/etc property',
        defaultVals: {
            aggKey: '&&'
        }
    },
    {
        name: 'dependenciesThenOn',
        pattern: String.raw`^(?<dependencyPart>.*) then ON\{(?<ONExpr>.*)\}`,
        description: 'Dependencies then ON{} mapping: #search then ON{"true": "yes", "false": "no"}',
        defaultVals: {
            aggKey: '&&'
        }
    },
    {
        name: 'dependenciesThenJS',
        pattern: String.raw`^(?<dependencyPart>.*) then JS\{(?<JSExpr>.*)\}`,
        description: 'Dependencies then inline JS expression: #search then JS{textContent = e.f.search + " world"}',
        defaultVals: {}
    },
    {
        name: 'dependenciesAndSetPropToAgg',
        pattern: String.raw`^(?<dependencyPart>.*) and set (?<localPropToSet>.*) to (?<aggKey>.*)`,
        description: 'Dependencies and set property to aggregator: #a and #b and set prop to ||',
        defaultVals: {}
    },
    {
        name: 'dependenciesAndPunt',
        pattern: String.raw`^(?<dependencyPart>.*) then punt`,
        description: 'Dependencies then punt (dispatch event): #search then punt',
        defaultVals: {
            punt: 'true'
        }
    },
    {
        name: 'toAggregator',
        pattern: String.raw`^(?<dependencyPart>.*) and set to (?<aggKey>.*)`,
        description: 'Dependencies and set to aggregator (no explicit prop): #a and #b and set to +',
        defaultVals: {}
    },
    {
        name: 'dependenciesAndSetProp',
        pattern: String.raw`^(?<dependencyPart>.*) and (?<action>set|toggle|increment|decrement|set-class|set-part) (?<localPropToSet>.*)`,
        description: 'Dependencies and set/toggle/increment/decrement property: #a and set isHappy',
        defaultVals: {
            aggKey: '&&'
        }
    },
    {
        name: 'dependencies',
        pattern: String.raw`^(?<dependencyPart>.*)`,
        description: 'Just dependencies (default conjunction): #someCheckbox',
        defaultVals: {
            aggKey: '&&'
        }
    }
];

/**
 * @type {EMC<any, AllProps, Element, RAConfig<AllProps, Actions>>}
 */
export const emc = {
    enhConfig: {
        enhKey: 'be-observing',
        spawn: 'be-observing/be-observing.js',
        withAttrs: {
            base: 'be-observing',
            _base: {
                mapsTo: 'parsedStatements',
                parser: 'parse-pattern-statements',
                instanceOf: 'Array',
                parserConfig: parsePatterns
            }
        }
    },
    customData: {
        weakRef: {
            properties: ['enhancedElement']
        },
        actions: {
            noAttrs: {
                ifNoneOf: ['parsedStatements']
            },
            seek: {
                ifAllOf: ['parsedStatements', 'didInferring', 'enhancedElement']
            }
        },
        defaultPropVals: {
            didInferring: false,
        },
        compacts: {
            when_parsedStatements_changes_call_infer: 0,
        }
    }
};

export function render() {
    return JSON.stringify(emc, null, 4);
}

console.log(render());

import  'assign-gingerly/object-extension.js';

/**
 * Registers be-observing's config with the enhancement registry, so it can be
 * attached programmatically via `enh.set.beObserving` or `enh.get(emc)`.
 * @param {Element | undefined} ref
 */
export async function defBeObserving(ref){
    const {default: emc} = await import('./emc.json', {with: {type: 'json'}});
    return await push(ref, emc);
}

async function push(ref, emc){
    const {BeObserving} = await import('./be-observing.js');
    const {enhConfig} = emc;
    enhConfig.spawn = BeObserving;
    enhConfig.customData = emc.customData;
    const registry = ref?.customElementRegistry ?? customElements;
    const {enhancementRegistry} = registry;
    enhancementRegistry.push(enhConfig);
    return enhConfig;
}

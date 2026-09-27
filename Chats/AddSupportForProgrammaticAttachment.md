# Add Support For Programmatic Attachment

## Bruce's Ask

Can you please follow the example of [be-persistent](https://github.com/bahrus/be-persistent) and [be-bound](../../be-bound) and [be-calculating](../../be-calculating/) and [the addendum](../types/ImportantEnhancementAddendum.md) to add demos and adjust be-observing.js as needed and add def.js to support programmatic attachment of this enhancement?

Please add your implementation notes below.

## Implementation Notes

I followed the addendum's checklist, including step 6 (README wording), with
be-persistent, be-bound, be-calculating and be-dispatching as models.

### Programmatic-friendly property: `observations`

`seek` used to read `parsedStatements` directly. That is the
`StatementsResult` from `parse-pattern-statements`
(`{success, statements: [{value}]}`), and the `infer` compact mutated its
statement values in place first. As with be-bound, I split the two:

- There is a new property, `observations: Array<Partial<ObservingParameters>>`,
  and it is now the only thing `seek` reads.
- The `infer` compact is replaced by
  `when_parsedStatements_changes_call_onParsedStatementsChange`. It just
  copies each statement's `value` into `observations`.
- The per-observation normalization that `infer` used to do now happens
  inside `seek`, on local variables, so it applies to both paths and never
  mutates caller-supplied objects:
  - parse `dependencyPart` into `remoteSpecifiers` when those aren't given;
  - coerce `punt: 'true'` to a boolean.
- The `didInferring` flag and its `defaultPropVals` entry are gone. Its only
  job was sequencing `infer` before `seek`.
- `seek` now uses
  `ifKeyIn: ['observations', 'initialized'], ifAllOf: ['observations', 'enhancedElement', 'initialized']`.
- An empty `observations` array means a single fully inferred observation,
  which is the same as a bare attribute. This replaces the old code that
  pushed `{value: {}}` into the parsed statements.

### Programmatic ergonomics

- **`aggKey` may be a function.** It is used directly instead of being looked
  up in `registry.js`, so no global registration is needed.
- **`ONExpr` may be an object.** It is used as the mapping directly instead of
  `JSON.parse('{' + ONExpr + '}')`.
- **`constVal` may be an actual number or boolean.** This already worked; the
  README now points out that `as` isn't needed in that case.

### Addendum steps

1. **`init()` awaits `roundabout(...)` and then sets `self.initialized = true`.**
2. **`ctx.emc || ctx.config`**, for `customData` and for `enhKey`. The event
   dispatched by `punt` is named after `enhKey`, which is `beObserving` when
   attached programmatically. The README table says so.
3. **`def.js`** exports `defBeObserving(ref)`. `package.json` `exports` now
   includes `./def.js`, `./emc.json`, `./🔭.json` and `./registry.js`, which
   is where custom aggregators are registered. I removed `./🔭.js`, which
   doesn't exist. There is no `files` field, so everything is already
   published.
4. **Reserved names.** There are no collisions. `observations` is referenced
   by `seek`, so roundabout monitors it.
5. **Tests.** See below.
6. **README.** Added a "Programmatic attachment (no attribute)" part before
   "Viewing Locally". It has the editorial intro, registration, a
   statement-part → property table, a dependency → remote-specifier table,
   and both patterns.

### Demos and tests

- `demo/Programmatic/DeclarativeInSequence.html`: the Food interpolation
  example (`${0} eats ${1}`) via `enh.set`.
- `demo/Programmatic/DeclarativeOutOfSequence.html`: the Subtract example
  (`@age` plus a numeric constant, `+`), set before `defBeObserving`.
- `demo/Programmatic/Imperative.html`: `enh.get()` with two observations of
  one input. One is a `set-class` driven by an `ONExpr` *object*; the other is
  an `aggKey` *function* that sets `textContent`.
- `tests/Programmatic/*.html` + `*.spec.mjs` mirror the three demos.

All 9 Playwright tests pass: the 6 existing ones and the 3 new ones.

The existing tests cover only 6 of the 26 attribute demos, and the
`parsedStatements` → `observations` refactor touches every attribute use. So I
also loaded all 26 `demo/**` pages, before (changes stashed) and after, and
snapshotted the state of each enhanced element: text, value, checked, hidden,
class, part and `myProp`. The snapshots are identical, with no page errors.

### Not changed, but worth a look

The README's "Globally defined" example and the "Using from ESM Module"
section import `be-observing/🔭.js` and `be-observing/emc.js`, and neither
file exists. Custom aggregators are registered via
`be-observing/registry.js` (`register(name, fn)`), and the "Globally defined"
snippet's parentheses are also unbalanced. I left these alone because they
predate this task. With function-valued `aggKey`, programmatic users don't
need the registry at all.

### Other changes

- `types/be-observing/types.d.ts` (in the `types` git submodule):
  - added `observations` to `EndUserProps`, and `initialized` to `AllProps`;
  - removed `didInferring`;
  - added `onParsedStatementsChange` to `Actions`;
  - `ObservingParameters` gained `dependencyPart`, `aggKey` now allows a
    function (with a new `AggEvent` type), `ONExpr` allows an object, and
    `punt` allows `'true'`.

  **These edits need to be committed and pushed in the `types` submodule
  separately.**
- `emc.json` / `🔭.json` were regenerated with `npm run build`.


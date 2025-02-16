# be-observing 🔭 [WIP]

Observe properties of peer elements or the host, mostly declaratively.

*be-observing* takes less of a "top-down" approach to binding than traditional frameworks.  It places less emphasis (but certainly not none) on binding exclusively from the (custom element) component container host.  Yes, it can do that, but it can also provide for "Democratic Web Component Organisms" where the host container acts as a very thin "Skin Layer" which can be passed a small number of "stimuli" values into.  Inside the body of the web component, we might have a non visible "brain" component that dispatches events.  *be-observing* allows other peer elements within the "body" to receive messages that the brain component emits, without forcing the outer "skin" layer to have to micromanage this all.

[![NPM version](https://badge.fury.io/js/be-observing.png)](http://badge.fury.io/js/be-observing)
[![How big is this package in your project?](https://img.shields.io/bundlephobia/minzip/be-observing?style=for-the-badge)](https://bundlephobia.com/result?p=be-observing)
<img src="http://img.badgesize.io/https://cdn.jsdelivr.net/npm/be-observing?compression=gzip">
[![Playwright Tests](https://github.com/bahrus/be-observing/actions/workflows/CI.yml/badge.svg?branch=baseline)](https://github.com/bahrus/be-observing/actions/workflows/CI.yml)

# Alternative

> [!Note]
> *be-observing* is very close to [be-calculating](https://github.com/bahrus/be-calculating) as far as feature set.  The two share many common modules.  The significant differences are: 
> 1.  *be-calculating* only accepts one "statement" of observables, and hands everything over, "cleanly" to JavaScript at that point.  
> 2.  A single *be-observing* enhancement, in contrast, is much more declarative.  It can work with multiple statements / grouped dependencies and provides more avenues to avoid requiring a scripting expression to go along with it, resorting to script expressions as a last resort, and a little less elegantly.

# Enhancements

> [!Note]
> An enhancement that inherits from *be-observing* called [be-entrusting](https://github.com/bahrus/be-entrusting) addsn extra thin layer on top.  It allows the original HTML that is streamed from the server to provide the initial values of the properties that *be-observing* observes, and then once that initial handshake is established, passes the buck, and leans exclusively on *be-observing* for all subsequent updates in the opposite direction.  Kind of like two-way binding, where the direction in the "up" direction only happens once, during the initialization.

> [!Note]
> If you need full two-way binding, consider using [be-bound](https://github.com/bahrus/be-bound).


## The most quintessential example

The example below follows the traditional "pass props down" from the host approach, only really it is "pulling props in". You say tomāto, I say tomäto kind of thing.

```html
<mood-stone>
    #shadow
    ...
    <input 
        name=isHappy 
        disabled 
        type=checkbox  
        be-observing>
</mood-stone>
```

What this does:  Observes and one-way passes *mood-stone*'s isHappy property value to the input element's checked property.

be-observing is making a few inferences:  

1.  The name of the input element ("isHappy") will match with the name of the host property from which we would want to bind it.  Why adopt confusing mappings if we can possibly avoid it? 
2.  Since the type of input element is of type checkbox, it sets the local "checked" property to match the "isHappy" property from the host. 


> [!Note]
> *be-observing* is a rather lengthy word to have to type over and over again, and this element enhancement would likely be sprinkled around quite a bit in a web application.  The name is registered in the optional file [emc.js](https://github.com/bahrus/be-observing/blob/baseline/emc.js) so to use whatever name makes sense to you (🔭, be-obs?) within your application, just don't reference that file, and instead create and reference your own registration file.  Names can also be overridden within a [Shadow scope](https://github.com/bahrus/be-hive) as well.  Throughout much of the rest of this document, we will use 🔭 instead of be-observing, and ask that you make a "mental map" of 🔭 to "be-observing".  In fact, this package does provide an alternative registration file, 🔭.js, that registers the enhancement via attribute "🔭".  The developer could easily copy/modify an alternative additional registration file, to adopt their own preferred name.

This package also supports a third alternative name suggestion: "o-o" for the emoji phobic.

If you only use this enhancement once in a large application, spelling out the full name (and referencing the canonical emc.js file) would probably make the most sense, for "locality of behavior" reasons, and also tapping into google searches (some day in the distant future).  But I would strongly consider using a (custom) shortcut in any application that intends to rely on this enhancement in a heavy way.

## Back to our quintessential example

As we already discussed, in the example above, we made the assumption that if the user gives the input element name "isHappy", that the choice of name will most likely match the identical property name coming from the host web component container.

If this assumption doesn't hold in some cases, then we can specify the name of the property we want to observe from the host:

## Specifying the host property to observe

```html
<mood-stone>
    #shadow
    ...
    <input 
        type=checkbox 
        disabled 
        be-observing=/isHappy.
    >
</mood-stone>
```

Now that we've spelled out the full, canonical name twice (*be-observing*), from now on, we will use "🔭" as our shortcut for "be-observing", but please apply the mental mapping from 🔭 to the full name, for the statements to make the most sense.  

The slash ("/") symbol indicates to get the value from the host.  If omitted, it is assumed:

## Reducing cryptic syntax

```html
<mood-stone>
    #shadow
    ...
    <input 
        type=checkbox 
        disabled 
        🔭=isHappy
    >
</mood-stone>
```

## Hosts that do not use shadow DOM.

If Shadow DOM is not used, add the "itemscope" attribute so that *be-observing* knows what to look for:

```html
<mood-stone itemscope>
    <input 
        type=checkbox 
        disabled 
        🔭=isHappy
    >
</mood-stone>
```

## Binding based on microdata attribute.

```html
<mood-stone>
    <template shadowrootmode=open>
        <div itemscope>
            <span 🔭 itemprop=isHappy></span>
        </div>

        <xtal-element
            prop-defaults='{
                "isHappy": true
            }'
        ></xtal-element>
        <be-hive></be-hive>
    </template>
</mood-stone>
```

This sets the span's textContent to the .toString() value of mood-stone's isHappy property, and monitors for changes, i.e. it one-way binds.

*xtal-element*, by the way, is a [userland implementation](https://github.com/bahrus/xtal-element) of declarative custom elements, so the example above is actually fully functional (after importing two generic js references).

## By Id also works:

```html
<mood-stone>
    <template shadowrootmode=open>
        <div itemscope>
            <span itemprop=isHappy></span>
        </div>
        <input 
            id=isHappy 
            disabled 
            type=checkbox  
            🔭
        >
        <xtal-element
            prop-defaults='{
                "isHappy": true
            }'
            xform='{
                "| isHappy": 0
            }'
        ></xtal-element>
        <be-hive></be-hive>
    </template>
</mood-stone>
```

## Precedence with itemprop, name, id

Note that the itemprop attribute takes precedence over the name attribute, which takes precedence over the id attribute.

In the example above, we are mixing inline binding (🔭) with binding from a distance ("xform").

## DSS Specifier Syntax

In the example above, we mentioned using the / symbol to indicate to observe a property from the host.  But be-observing can also observe peer elements within the ShadowRoot (or outside any shadow root *be-observing* adorns an element sitting outside any ShadowRoot).

The syntax adopts what we refer to as the DSS specification, where DSS stands for "directed scoped specifier".  It is inspired by CSS selectors, but it is optimized for binding scenarios. 

This is documented in (increasingly) painstaking detail where the [DSS parser library is maintained](https://github.com/bahrus/trans-render/wiki/VIII.--Directed-Scoped-Specifiers-(DSS)).


## Binding to peer elements

Now we will start to see how be-observing provides for more "grass-roots" democratic organism (web component) support.

## By name attribute

```html
<input name=search type=search>
...
<div 🔭=@search></div>
```

As the user types in the input field, the div's text content reflects the value that was typed.

The search for the element with name=search is done within the closest form element, and if not found, within the (shadow)root node.

## By id

This also works:

```html
<input id=searchString type=search>
...
<div 🔭=#searchString></div>
```

The search for element with id=searchString is done within the (shadow)root node, since id's are supposed to be unique within a (shadow)root node.

## By markers with kebab-to-camelCase convention

```html
<mood-stone>
    #shadow
    <my-peer-element -some-bool-prop></my-peer-element>
    <input 
        type=checkbox 
        disabled 
        🔭=-some-bool-prop
    >
</mood-stone>
```

This observes the my-peer-element's someBoolProp property for changes and sets the adorned element's checked property based on the current value.

## By itemprop

```html
<data value=true itemprop=isHappy hidden></data>

...

<input
    disabled
    type=checkbox 
    🔭=|isHappy
>
```

What this does:  It watches for changes to the value attribute of the data element, and parses the value using JSON.parse and passes the value to the checked property of the input element.

We saw earlier that we can adorn elements with the itemprop attribute with the 🔭 attribute, and it will automatically pull in values from the host.  This allows us to create a code-free "chain" of bindings from the host to Shadow children, and from the Shadow children to peer elements.

# Specifying the property to assign the observed value(s) to.

What we've seen above is a lot of mind reading about what our intentions are, as far as how we want to apply what we are observing to the element adorned by *be-observing*.  Sometimes we are setting the "checked" property.  Sometimes we are setting the textContent.  

But sometimes we need to be more explicit because it isn't always transparent what we intend.

## Single mapping from what to observe, specifying the property to target.

```html
<input name=someCheckbox type=checkbox>

<mood-stone 
    enh-🔭='@someCheckbox and set isHappy.'
    >
</mood-stone>

```

This watches the input element for input events and passes the checked property to the isHappy property of oMoodStone.  

The enh- prefix is there to avoid possible conflicts with attributes recognized by my-peer-element, in the absence of any [tender loving care from the platform](https://github.com/WICG/webcomponents/issues/1000).

> [!NOTE]
> This potentially could allow for a xss attack.  For that reason, *be-observing* blocks setting innerHTML/outerHTML.


## Multiple parallel observers

This example works, where each observing statement is treated independently:

```html
<input name=someCheckbox type=checkbox>
<input name=someOtherCheckbox type=checkbox>

<mood-stone
    enh-🔭="@someCheckbox and set isHappy.
            @someOtherCheckbox and set isWealthy."
'>
    <template shadowrootmode=open>
        <div itemscope>
            is happy
            <div itemprop=isHappy></div>
            is wealthy
            <div itemprop=isWealthy></div>
        </div>
        <xtal-element infer-props
            prop-defaults='{
                "isHappy": true,
                "isWealthy": false
            }'
            xform='{
                "| isHappy": 0,
                "| isWealthy": 0
            }'
        ></xtal-element>
        <be-hive></be-hive>
    </template>
</mood-stone>
```


## Many to 1

If multiple remote endpoints are observed that map to a single local prop, by default, the "truthy" conjunction (&&) is applied to them all:

```html
<input name=someCheckbox type=checkbox>
<input name=someOtherCheckbox type=checkbox>

<mood-stone 
    enh-🔭='of @someCheckbox and @someOtherCheckbox and set isHappy.'
>
    <template shadowrootmode=open>
        <div itemscope>
            is happy
            <div itemprop=isHappy></div>
        </div>
        <xtal-element 
            prop-defaults='{
                "isHappy": true,
            }'
            xform='{
                "| isHappy": 0,
            }'
        ></xtal-element>
        <be-hive></be-hive>
    </template>
</mood-stone>
```

In other words, in this example, the *mood-stone*'s "isHappy" property will be set to true only if both checkboxes are checked, otherwise it will be set to false.

The number of things we can observe is limited only by when the developer tires of typing the word "and".

*be-observing* also supports additional ways of combining multiple remote endpoints into one local prop.

They are:

1.  Union

```html
<mood-stone enh-🔭='@someCheckbox and @someOtherCheckbox and set isHappy to ||.'>
```

2.  Sum

```html
<mood-stone enh-🔭='@someNumericInput and @someOtherNumericInput and set mySum to +.'>
```

3.  Product [Untested]

<mood-stone enh-🔭='@someNumericInput and @someOtherNumericInput and set myProduct to *.'>

4.  Interpolation [TODO -- wait for sanitizer api or whatever it is called these days to finally land in all the browsers]

<mood-stone enh-🔭='@name and @food and set sentenceProp to `${0} eats ${1}`.'>

5.  Object Assignment [Untested]

<mood-stone 
    enh-🔭='@name and @food and set myObjectProp to {}.'>

6.  Or Not

```html
<mood-stone enh-🔭='@someCheckbox and @someOtherCheckbox and set isHappy to ||!.'>
```

This is basically !someCheckbox || !someOtherCheckbox

If only there's only one remote specifier, then that gives us negation.

7.  And Not

```html
<mood-stone enh-🔭='@someCheckbox and @someOtherCheckbox and set isHappy to &&!.'>
```

These aggregators actually allow for doing a little math in the expressions.  For instance:

```html
<input name=age type=number value=90>

<div data-diff=-20 🔭='@age and $0?.dataset?.diff as number and set to +'></div>
```

## Observing a single remote endpoint and applying a simple mapping to the final value

```html
<input type=checkbox name=isHappy>

<div 🔭='@isHappy then ON{
    "true": "be joyous",
    "false": "be melanchology",
    ":": "¯\\_(ツ)_/¯"
}'></div>
```

ON stands for (JS)Object Notation (and "on", kind of).

## Being boolish


```html
<input name=search>

<div 🔭='@search then ON{
    "?": "Searching...",
    ":": "How can I help you today?"
}'></div>
```

## Being boolish plus special values


```html
<input name=search>

<div 🔭='@search then ON{
    "?": "Searching...",
    ":": "How can I help you today?",
    "hi": "Hello"
}'></div>
```

We need to make the split of sentences ignore triple ticks [TODO]


# For the power hungry JS-firsters

We can write custom JS expressions, and integrate it with our observing statements.

## CSP "safe", locally defined, inside script element


By CSP "safe", I mean these solutions should still work if you are patient enough to add hashes to your headers or meta tag.


```html
<div>
    <input id=searchString type=search>

    <div defer-🔭 🔭='#searchString then punt.'></div>
    <script nomodule 🏇=🔭>textContent = e.args[0] + ' World';<script>
</div>
```

The advantage of this approach compared to the example below:

1.  You get syntax highlighting inside the expression without a plugin.
2.  Is more "honest" about possible side effects, easier to filter out with trusted types, server-side xss prevention (maybe).
3.  Can freely use ', ", ` without breaking anything.  

This is utilizing the [be-eventing](https://github.com/bahrus/be-eventing) fellow enhancement.

## CSP "safe", inline expression

```html
<div>
    <input id=searchString type=search>

    <div 🔭='#searchString then JS{
        textContent = e.f.searchString + " world"
    }'></div>
</div>
```

Advantages of this approach:

1.  Total locality of behavior, cut/copy/paste easier
2.  No need for the defer, even in a site that doesn't use bundling.
3.  Can have multiple statements within the attribute, each with their own little JS scriptlet if needed.


*be-observing* fires an event from the adorned element whose name matches the current name of the enhancement attribute base ('🔭' in this case).  Anyone can subscribe and have a say on what happens then.  The markup below relies on a separate enhancement, [be-eventing](https://github.com/bahrus/be-eventing).  Other ways of attaching the event handler will also work (subject to delicate timing issues), such as from a framework or custom element host.

What this does:  It sets the div's textContent property to the value of searchString input element, after appending the word "World".

## Globally defined

```html
<script type=module>
    (await import('be-observing/🔭.js')
        .register('appendWorld', e => e.r = e.args[0] + ' World')
    );
</script>
<input id=searchString type=search>

<div 🔭='#searchString and set to appendWorld.'></div>
```



## Attaching and setting other enhancement values [TODO]

```html
<input name=search type=search>

<div 🔭='
    @search and set +beSearching?.forText.
'>
    supercalifragilisticexpialidocious
</div>
```

The plus symbol:  + is indicating to tap into a [custom enhancement](https://github.com/WICG/webcomponents/issues/1000).

The example above happens to refer to this [enhancement](https://github.com/bahrus/be-searching).

## Observing a specified property of a peer custom element [TODO]

```html
<tr itemscope>
    <td>
        <my-item-view-model></my-item-view-model>
        <div 🔭=~myItemViewModel?.myProp1>My First column information</div>
    </td>
    <td>
        <div 🔭=~myItemViewModel?.myProp2></div>
    </td>
</tr>
```

The search for the my-item-view-model custom element is done within the closest "itemscope" attribute.

This can be useful for scenarios where we want to display repeated data, and can't use a custom element to host each repeated element (for example, rows of an HTML table), but we want to provide a custom element as the "view model" for each row.

This will one-way synchronize *my-item-view-model*'s myProp 1/2 values to the adorned element's textContent property.

## Attaching a "brain" component to the tr element.

This also works:

```html
<my-item hidden>
    <xtal-element prop-defaults='{
        "prop1": "",
        "prop2": ""
    }'></xtal-element>
</my-item>

<table>
    <tr itemscope=my-item data-ish='{"prop1": "val1", "prop2": "val2"}'>
        <td>
            <div itemprop=prop1 🔭></div>
        </td>
        <td>
            <div itemprop=prop2 🔭></div>
        </td>
    </tr>
    <tr itemscope=my-item data-ish='{"prop1": "val3", "prop2": "val4"}'>
        <td>
            <div itemprop=prop1 🔭></div>
        </td>
        <td>
            <div itemprop=prop2 🔭></div>
        </td>
    </tr>
</table>
```

What this does:

1.  Note the "non-standard" [(for now?)](https://github.com/bahrus/custom-enhancements?tab=readme-ov-file#support-for-a-view-model-web-component--enhancement-tied-to-the-itemscope-attribute) use of the itemscope attribute.  It is specifying the name of a custom element (or custom enhancement) that the developer creates, that acts as a kind of non visual "view model / domain object" component, that may be full of methods that saves changes to that row / item to the back end, and/or can retrieve new refreshes of data -- the sky is the limit, except it isn't really focused on rendering anything, leaving that to other libraries, like *be-observing* or, for example, a tagged [template literal based looping library to finesse](https://github.com/bahrus/be-render-neutral).
2.  The 🔭 indicates to pull the value(s) from the itemscope'd view model custom element / enhancement.


The mechanics of 1 is already handled via the underlying infrastructure that supports *be-observing*.  It has settled on adding the non standard "ish" property to the element it adorns ("tr") in this case.

*be-observing* utilizes a DSS protocol helper function as far as "getting" the host from the ish property.

All of which is to say the example above works thanks to code reuse from the supporting packages.


## Toggle [TODO]

To simply toggle a property anytime the observed element changes:

```html
<mood-stone>
    #shadow
    
    <input name=someCheckbox type=checkbox>

    <my-peer-element enh-🔭='@someCheckbox::input and toggle someBoolProp.
        '></my-peer-element>
</mood-stone>
```

## PlusEq, MinusEq, TimeEq, DivEq [TODO]

## Increment, Decrement [TODO]



## Interpolating [TODO]

```html
<mood-stone>
    #shadow
    
    <input name=name>
    <input name=food>

    <my-peer-element enh-🔭='
        @name and @food and set mySecondProp to `$1 eats $2`.
        '></my-peer-element>
</mood-stone>
```


## Adding / removing css classes / styles / parts declaratively [TODO]

```html
<mood-stone>
    #shadow
    
    <input name=yourCheckbox type=checkbox>
    <input name=myCheckbox type=checkbox>

    <my-peer-element enh-🔭='
        @yourCheckbox and set-class my-class.
        And @myCheckbox and set-class my-second-class.
        '></my-peer-element>
</mood-stone>
```

Since we are binding to booleans, adds class if true, otherwise removes.

If we bind to a string, simply sets the class to the value of the string.

Same with SetPart, SetStyle

## Observing a specified property [TODO]

```html
<my-peer-element></my-peer-element>

<your-peer-element enh-🔭="~myPeerElement?.myProp and set yourProp.
">
```

This will one-way synchronize *my-peer-element*'s myProp value to the adorned element's yourProp property.

<!-->





## Viewing Demos Locally

Any web server that can serve static files with server side includes will do, but...

1.  Install git.
2.  Fork/clone this repo.
3.  Install node.js.
4.  Install python 3 or later.
5.  Open command window to folder where you cloned this repo.
6.  > npm install
7.  > npm run serve
8.  Open http://localhost:8000/demo/ in a modern browser.

## Running Tests

```
> npm run test
```

## Using from ESM Module:

```JavaScript
import 'be-observing/emc.js';
```

or

```JavaScript
import 'be-observing/🔭.js';
```


## Using from CDN:

```html
<script type=module crossorigin=anonymous>
    import 'https://esm.run/be-observing';
</script>
```


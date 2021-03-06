---
layout: default
type: guide
shortname: Docs
title: Experimental features & elements
subtitle: Developer guide
---

{% include toc.html %}


## Template repeater (x-repeat) {#x-repeat}


**EXPERIMENTAL: API MAY CHANGE.**
{: .alert .alert-error }

Elements in a template can be automatically repeated and bound to array items using a custom `HTMLTemplateElement` type extension called `x-repeat`.  `x-repeat` accepts an `items` property, and one instance of the template is stamped for each item into the DOM at the location of the `x-repeat` element.  The `item` property will be set on each instance's binding scope, thus templates should bind to sub-properties of `item`.  Example:

    <dom-module id="employee-list">

      <template>
        {% raw %}
        <div> Employee list: </div>
        <template is="x-repeat" items="{{employees}}">
            <div>First name: <span>{{item.first}}</span></div>
            <div>Last name: <span>{{item.last}}</span></div>
        </template>
        {% endraw %}
      </template>
    </dom-module>

    <script>
      Polymer({
        is: 'employee-list',
        ready: function() {
          this.employees = [
              {first: 'Bob', last: 'Smith'},
              {first: 'Sally', last: 'Johnson'},
              ...
          ];
        }
      });
    </script>

Notifications for changes to items sub-properties will be forwarded to template instances, which will update via the normal [structured data notification system](#path-binding).

Mutations to the `items` array itself (`push`, `pop`, `splice`, `shift`, `unshift`) are observed via `Array.observe` (where supported, or an experimental shim of this API on unsupported browsers), and template instances are kept in sync with the data in the array.

A view-specific filter/sort may be applied to each `x-repeat` by supplying a `filter` and/or `sort` property.  This may be a string that names a function on the host, or a function may be assigned to the property directly.  The functions should implemented following the standard `Array` filter/sort API.

In order to re-run the filter or sort functions based on changes to sub-fields of `items`, the `observe` property may be set as a space-separated list of `item` sub-fields that should cause a re-filter/sort when modified.

For example, for an `x-repeat` with a filter of the following:

    isEngineer: function(item) {
        return item.type == 'engineer' || item.manager.type == 'engineer';
    }

    Then the `observe` property should be configured as follows:

    <template is="x-repeat" items="{%raw%}{{employees}}{%endraw%}" 
              filter="isEngineer" observe="type manager.type">


To find the model values associated with an element generated by an `x-repeat` (for example, when handling an event), `x-repeat` provides the utility methods `itemForElement` and `indexForElement`. For example, `itemForElement(event.target)` returns the item that generated the DOM for `event.target`.


## Array selector (x-array-selector) {#x-array-selector}

**EXPERIMENTAL: API MAY CHANGE.**
{: .alert .alert-error }

Keeping structured data in sync requires that Polymer understand the path associations of data being bound.  The `x-array-selector` element ensures path linkage when selecting specific items from an array (either single or multiple).  The `items` property accepts an array of user data, and via the `select(item)` and `deselect(item)` API, updates the `selected` property which may be bound to other parts of the application, and any changes to sub-fields of `selected` item(s) will be kept in sync with items in the `items` array.  When `multi` is false, `selected` is a property representing the last selected item.  When `multi` is true, `selected` is an array of multiply selected items.

    <dom-module id="employee-list">

      <template>
        {% raw %}
        <div> Employee list: </div>
        <template is="x-repeat" id="employeeList" items="{{employees}}">
            <div>First name: <span>{{item.first}}</span></div>
            <div>Last name: <span>{{item.last}}</span></div>
            <button on-click="toggleSelection">Select</button>
        </template>
        
        <x-array-selector id="selector" items="{{employees}}" selected="{{selected}}" multi toggle></x-array-selector>
        
        <div> Selected employees: </div>
        <template is="x-repeat" items="{{selected}}">
            <div>First name: <span>{{item.first}}</span></div>
            <div>Last name: <span>{{item.last}}</span></div>
        </template>
        {% endraw %}
      </template>
    </dom-module>

    <script>
      Polymer({
        is: 'employee-list',
        ready: function() {
          this.employees = [
              {first: 'Bob', last: 'Smith'},
              {first: 'Sally', last: 'Johnson'},
              ...
          ];
        },
        toggleSelection: function(e) {
          var item = this.$.employeeList.itemForElement(e.target);
          this.$.selector.select(item);
        }
      });
    </script>


## Auto-binding template {#x-autobind}

**EXPERIMENTAL: API MAY CHANGE.**
{: .alert .alert-error }

Polymer's binding features are only available within templates that are managed by Polymer.  As such, these features are available in templates used to define Polymer elements, for example, but not for elements placed directly in the main document.

In order to use Polymer bindings without defining a new custom element, you may wrap the elements utilizing bindings with a custom template extension called `x-autobind`.  This template will immediately stamp itself into the main document and bind elements to the template itself as the binding scope.

    <!doctype html>
    <html>
    <head>
      <meta charset="utf-8">
      <script src="components/webcomponentsjs/webcomponents-lite.js"></script>
      <link rel="import" href="components/polymer/polymer.html">
      <link rel="import" href="components/core-ajax/core-ajax.html">

    </head>
    <body>

      <!-- Wrap elements in with auto-binding template to -->
      <!-- allow use of Polymer bindings main document -->
      <template is="x-autobind">
        {% raw %}
        <core-ajax url="http://..." lastresponse="{{data}}"></core-ajax>
        
        <template is="x-repeat" items="{{data}}">
            <div><span>{{item.first}}</span> <span>{{item.last}}</span></div>
        </template>
        {% endraw %}
      </template>

    </body>
    </html>

## Cross-scope styling {#xscope-styling}

**EXPERIMENTAL: API MAY CHANGE.**
{: .alert .alert-error }

### Background

Shadow DOM (and its approximation via Shady DOM) bring much needed benefits of
scoping and style encapsulation to web development, making it safer and easier
to reason about the effects of CSS on parts of your application.  Styles do not
leak into the local DOM from above, and styles do not leak from one local DOM
into the local DOM of other elements inside.

This is great for *protecting* scopes from unwanted style leakage.  But what
about when you intentionally want to *customize* the style of a custom element's
local DOM, as the user of an element?  This often comes up under the umbrella of
"theming".  For example a "custom-checkbox" element that may interally use a
`.checked` class can protect itself from being affected by CSS from other
components that may also happen to use a `.checked` class.  However, as the user
of the checkbox you may wish to intentionally change the color of the check to
match your product's branding, for example.  The same "protection" that Shadow
DOM provides at the same time introduces a practical barrier to "theming" use
cases.

One solution the Shadow DOM spec authors provided to address the theming problem
are the `/deep/` and `::shadow` combinators, which allow writing rules that
pierce through the Shadow DOM encapsulation boundary.  Although Polymer 0.5
promoted this mechanism for theming, it was ultimately unsatisfying for several
reasons:

*   Using `/deep/` and `::shadow` for theming leaks details of an otherwise
    encapsulated element to the user, leading to brittle selectors piercing into
    the internal details of an element's Shadow DOM that are prone to breakage
    when the internal implementation changes.  As a result, the structure of of
    an element's Shadow DOM inadvertently becomes API surface subject to
    breakage, diminishing the practical effectiveness of Shadow DOM as an
    encapsulation primitive.

*   Although Shadow DOM's style encapsulation *improves* the predictability of
    style recalc performance since the side effects of a style change are
    limited to a small subset of the document, using `/deep/` and `::shadow` 
    re-opens the style invalidation area and reduces Shadow DOM's effectiveness as a
    performance primitive.

*   Using `/deep/` and `::shadow` leads to verbose and difficult to understand
    selectors.

For the reasons above, the Polymer team is currently exploring other options for
theming that address the shortcomings above and provide a possible path to
obsolescence of `/deep/` and `::shadow` altogether.

### Custom CSS properties {#xscope-styling-details}

Polymer 0.8 includes a highly experimental and opt-in shim for custom CSS
properties inspired by (and compatible with) the future W3C 
[CSS Custom Properties for Cascading Variables](http://dev.w3.org/csswg/css-variables/)
specification (see 
[Using CSS Variables](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_variables) 
on the Mozilla Developer Network).

Rather than exposing the details of an element's internal implementation for
theming, instaed an element author would define one or more custom CSS
properties as part of the element's API which it would consume to style
internals of the element deemed important for themeing by the element's author.
These custom properties can be defined similar to other standard CSS properties
and will inherit from the point of definition down the composed DOM tree,
similar to the effect of `color` and `font-family`.

In the simple example below, the author of `my-toolbar` identified the need for
users of the toolbar to be able to change the color of the toolbar title.  The
author exposed a custom property called `--my-toolbar-title-color` which is
assigned to the `color` property of the selector for the title element.  Users
of the toolbar may define this variable in a CSS rule anywhere up the tree, and
the value of the property will inherit down to the toolbar where it is used if
defined, similar to other standard inheriting CSS properties.

Example:

    <dom-module id="my-toolbar">

      <style>
        :host {
          padding: 4px;
          background-color: gray;
        }
        .title {
          color: var(--my-toolbar-title-color);
        }
      </style>
      
      <template>
        <span class=".title">{%raw%}{{title}}{%endraw%}</span>
      </template>
      
      <script>
        Polymer({
          is: 'my-toolbar',
          properties: {
            title: String
          },
          // The custom properties shim is currently an opt-in feature
          enableCustomStyleProperties: true
        });
      </script>

    </dom-module>

Example usage of `my-toolbar`:

    <dom-module id="my-element">

      <style>

        /* Make all toolbar titles in this host green by default */
        :host {
          --my-toolbar-title-color: green;
        }

        /* Make only toolbars with the .warning class red */
        .warning {
          --my-toolbar-title-color: red;
        }

      </style>
      
      <template>
      
        <my-toolbar title="This one is green."></my-toolbar>
        <my-toolbar title="This one is green too."></my-toolbar>

        <my-toolbar class="warning" title="This one is red."></my-toolbar>
      
      </template>

    </dom-module>

The `--my-toolbar-title-color` property will only affect the color of the title
element encapsulated in `my-toolbar`'s internal implementation.  If in the
future the `my-toolbar` author chose to rename the `.title` class or otherwise
restructure the internal details of `my-toolbar`, users are shielded from this
change via the indirection afforded by custom properties.

Thus, custom CSS properties introduce a powerful way for element authors to
expose a theming API to their users in a way that naturally fits right alongside
normal CSS styling and avoids the problems with `/deep/` and `::shadow`, and is
already on a standards track with shipping implementation by Mozilla and planned
support by Chrome.

However, it may be tedious (or impossible) for an element author to anticipate
and expose every possible CSS property that may be important for theming an
element as individual CSS properties (for example, what if a user needed to
ajust the `opacity` of the toolbar title?).  For this reason, the custom
properties shim included in Polymer includes an experimental extension allowing
a bag of CSS properties to be defined as a custom property and allowing all
properties in the bag to be applied to a specific CSS rule in an element's local
DOM.  For this, we introduce a `mixin` capability that is analogous to `var`,
but allows an entire bag of properties to be mixed in.

Example:

    <dom-module id="my-toolbar">

      <style>
        :host {
          padding: 4px;
          background-color: gray;
          mixin(--my-toolbar-theme)
        }
        .title {
          mixin(--my-toolbar-title-theme)
        }
      </style>
      
      <template>
        <span class=".title">{%raw%}{{title}}{%endraw%}</span>
      </template>
      
      ...
      
    </dom-module>

Example usage of `my-toolbar`:

    <dom-module id="my-element">

      <style>

        /* Apply custom theme to toolbars */
        :host {
          --my-toolbar-theme: {
            background-color: green;
            border-radius: 4px;
            border: 1px solid gray;
          }
          --my-toolbar-title-theme: {
            color: green;
          }
        }

        /* Make only toolbars with the .warning class red and bold */
        .warning {
          --my-toolbar-title-theme: {
            color: red;
            font-weight: bold;
          }
        }

      </style>
      
      <template>
      
        <my-toolbar title="This one is green."></my-toolbar>
        <my-toolbar title="This one is green too."></my-toolbar>

        <my-toolbar class="warning" title="This one is red."></my-toolbar>
      
      </template>

    </dom-module>

### Custom Properties Shim - Limitations and API details

Experimental cross-platform support for custom properties is provided in Polymer
by a Javascript library that approximates the capabilities of the CSS Variables
specification  *for the specific use case of theming custom elements*, while
also extending it to add the mixin capability described above.  **It is
important to note that this is not a full polyfill**, as doing so would be
prohibitively expensive; rather this is a shim that is inspired by that
specification and trades off aspects of the full dynamism possible in CSS with
practicality and performance.

Below are current limitations of this experimental system.  Improvements to
performance and dynamism will continue to be explored.

*   As this feature is still experimental, custom properties are not currently
    applied to elements by default.  To enable *usage* of custom properties, set
    an `enableCustomStyleProperties: true` property on the Polymer element
    prototype.

*   Only rules which match the element at *creation time* are applied. Any
    dynamic changes that update variable values are not applied automatically.

HTML:

    <div class="container">
      <x-foo class="a"></x-foo>
    </div>
    
CSS:

    /* applies */
    x-foo.a {
      --foo: brown;
    }
    /* does not apply */
    x-foo.b {
      --foo: orange;
    }
    /* does not apply to x-foo */
    .container {
      --nog: blue;
    }

*   Re-evaluation of custom property styles does not currently occur as a result
    of changes to the DOM.  Re-evaluation can be forced by calling
    `this.updateStyles()` on a Polymer element.  For example, if class `b` was
    added to `x-foo` above, the scope must call `this.updateStyles()` to apply
    the styling. This re-calcs/applies styles down the tree from this point.

*   Dynamic effects are reflected at the point of a variable’s application, but
    not its definition.

    For the following example, adding/removing the `highlight` class on the
    `#title` element will have the desired effect, since the dynamism is related
    to *application* of a custom property.

        #title {
          background-color: var(--title-background-normal);
        }

        #title.highlighted {
          background-color: var(--title-background-highlighted);
        }
    
    However, the shim does not currently support dynamism at the point of *definition* of a custom property.  In the following example, `this.updateStyles()` would be required to update the value of `--title-background` being applied to `#title` when the `highlight` class was added or removed.
    
        #title {
          --title-background: gray;
        }

        #title.highlighted {
          --title-background: yellow;
        }

## Custom element for document styling (x-style) {#x-style}

**EXPERIMENTAL: API MAY CHANGE.**
{: .alert .alert-error }

An experimental `<style is="x-style">` custom element is provided for defining
styles in the main document that can take advantage of several special features
of Polymer's styling system:

*   Document styles defined in an `x-style` will be shimmed to ensure they do
    not leak into local DOM when running on browsers without non-native Shadow
    DOM.

*   Shadow DOM-specific `/deep/` and `::shadow` combinators will be shimmed on
    browsers without non-native Shadow DOM.

*   Custom properties used by Polymer's experimental 
    [shim for cross-scope styling](#xscope-styling-details) may be defined in an 
    `x-style`.

Example:

    <!doctype html>
    <html>
    <head>
      <script src="components/webcomponentsjs/webcomponents-lite.js"></script>
      <link rel="import" href="components/polymer/polymer.html">

      <style is="x-style">
        
        /* Will be prevented from affecting local DOM of Polymer elements */
        * {
          box-sizing: border-box;
        }
        
        /* Can use /deep/ and ::shadow combinators */
        body /deep/ .my-special-view::shadow #thing-inside {
          background: yellow;
        }
        
        /* Custom properties that inherit down the document tree may be defined */
        body {
          --my-toolbar-title-color: green;
        }
        
      </style>

    </head>
    <body>

        ...

    </body>
    </html>

Note, all features of `x-style` are available when defining styles as part of
Polymer elements (for example, in `<style>` elements within a custom element's
`<dom-module>`. The `x-style` extension should only be used for
defining document styles, outside of a custom element's local DOM.

## External stylesheets {#external-stylesheets}

**EXPERIMENTAL: API MAY CHANGE.**
{: .alert .alert-error }

Polymer includes an experimental feature to support loading external stylesheets
that will be applied to the local DOM of an element.  This is typically
convenient for developers who like to separate styles, share common styles
between elements, or use style pre-processing tools.  The syntax is slightly
different from how stylesheets are typically loaded, as the feature leverages
HTML Imports (or the HTML Imports polyfill, where appropriate) to load the
stylesheet text such that it may be properly shimmed and/or injected as an
inline style.

To include a remote stylesheet that applies to your Polymer element's local DOM,
place a special HTML import `<link>` tag with `type="css"` in your `<dom-
module>` that refers to the external stylesheet to load.

Example:

    <dom-module id="my-awesome-button">

      <!-- special import with type=css used to load remote CSS -->
      <link rel="import" type="css" href="my-awesome-button.css">
      
      <template>
        ...
      </template>
      
      <script>
        Polymer({
          is: 'my-awesome-button',
          ...
        });
      </script>

    </dom-module>

## Feature layering {#feature-layering}

**EXPERIMENTAL: API MAY CHANGE.**
{: .alert .alert-error }

Polymer 0.8 is currently layered into 3 sets of features provided as 3 discrete
HTML imports, such that an individual element developer can depend on a version
of Polymer whose feature set matches their tastes/needs.  For authors who opt
out of the more opinionated local DOM or data-binding features, their element's
dependencies would not be payload- or runtime-burdened by these higher-level
features, to the extent that a user didn't depend on other elements using those
features on that page.  That said, all features are designed to have low runtime
cost when unused by a given element.

Higher layers depend on lower layers, and elements requiring lower layers will
actually be imbued with features of the highest-level version of Polymer used on
the page (those elements would simply not use/take advantage of those features).
This provides a good tradeoff between element authors being able to avoid direct
dependencies on unused features when their element is used standalone, while
also allowing end users to mix-and-match elements created with different layers
on the same page.

*   `polymer-micro.html`: [Polymer micro features](#polymer-micro) (bare-minimum
    Custom Element sugaring)

*   `polymer-mini.html`: [Polymer mini features](#polymer-mini) (template
     stamped into "local DOM" and tree lifecycle)

*   `polymer.html`: [Polymer standard features](#polymer-standard) (all other
    features: declarative data binding and event handlers, property nofication,
    computed properties, and experimental features)

This layering is subject to change in the future and the number of layers may be reduced.

### Polymer micro features {#polymer-micro}

The Polymer micro layer provides bare-minimum Custom Element sugaring.


| Feature | Usage
|---------|-------
| [Custom element constructor](registering-elements.html#element-constructor) | Polymer.Class({ … });
| [Custom element registration](registering-elements.html#register-element) | Polymer({ is: ‘...’,  … }};
| [Bespoke constructor support](registering-elements.html#bespoke-constructor) | constructor: function() { … }
| [Basic lifecycle callbacks](registering-elements.html#basic-callbacks) | created, attached, detached, attributeChanged
| [Native HTML element extension](registering-elements.html#type-extension) | extends: ‘…’
| [Configure properties](properties.html#property-config) | properties: { … }
| [Attribute deserialization to property](properties.html#attribute-deserialization) | properties: { \<property>: \<Type> }
| [Static attributes on host](registering-elements.html#host-attributes) | hostAttributes: { \<attribute>: \<value> }
| [Prototype mixins](registering-elements.html#prototype-mixins) | mixins: [ … ]


### Polymer mini features {#polymer-mini}

The Polymer mini layer provides features related to local DOM:
Template contents cloned into the custom element's local DOM, DOM APIs and 
tree lifecycle.

| Feature | Usage
|---------|-------
| [Template stamping into local DOM](local-dom.html#template-stamping) | \<dom-module>\<template>...\</template>\</dom-module>
| [DOM (re-)distribution](local-dom.html#dom-distribution) | \<content>
| [DOM API](local-dom.html#dom-api)  | Polymer.dom
| [Configuring default values](properties.html#configure-values)  | properties: \<prop>: { value: \<primitive>\|\<function> }
| [Bottom-up callback after configuration](registering-elements.html#ready-method) | ready: function() { … }

<a name="polymer-standard"></a>

### Polymer standard features {#polymer-standard}

The Polymer standard layer adds declarative data binding, events, property notifications and utility methods.

| Feature | Usage
|---------|-------
| [Local node marshalling](local-dom.html#node-marshalling) | this.$.\<id>
| [Event listener setup](events.html#event-listeners)| listeners: { ‘\<node>.\<event>’: ‘function’, ... }
| [Annotated event listener setup](events.html#annotated-listeners) | \<element on-[event]=”function”>
| [Property change callbacks](properties.html#change-callbacks) | properties: \<prop>: { observer: ‘function’ }
| [Annotated property binding](data-binding.html#property-binding) | \<element prop=”{%raw%}{{property\|path}}{%endraw%}”>
| [Property change notification](data-binding.html#property-notification) | properties: { \<prop>: { notify: true } }
| [Binding to structured data](data-binding.html#path-binding) | \<element prop=”{%raw%}{{obj.sub.path}}{%endraw%}”>
| [Path change notification](data-binding.html#set-path) | setPathValue(\<path>, \<value>)
| [Declarative attribute binding](data-binding.html#attribute-binding) | \<element attr$=”{%raw%}{{property\|path}}{%endraw%}”>
| [Reflecting properties to attributes](properties.html#attribute-reflection) | properties: \<prop>: { reflectToAttribute: true } }
| [Computed properties](properties.html#computed-properties) | computed: { \<property>: ‘computeFn(dep1, dep2)’ }
| [Annotated computed properties](data-binding.html#annotated-computed) | \<span>{%raw%}{{computeFn(dep1, dep2)}}{%endraw%}\</span>
| [Read-only properties](properties.html#read-only) |  properties: { \<prop>: { readOnly: true } }
| [Utility functions](utility-functions.html) | toggleClass, toggleAttribute, fire, async, …
| [Scoped styling](local-dom.html#scoped-styling) | \<style> in \<dom-module>, Shadow-DOM styling rules (:host, ...)
| [Sharing stylesheets](experimental.html#shared-stylesheets) | styleModules: [ ... ]
| [General polymer settings](#settings) | \<script> Polymer = { ... }; \</script>

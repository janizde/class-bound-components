# class-bound-components ⚛️ 🖼 [![Build Status](https://github.com/janizde/class-bound-components/actions/workflows/main.yml/badge.svg)](https://travis-ci.com/janizde/class-bound-components) [![npm version](https://badge.fury.io/js/class-bound-components.svg)](https://badge.fury.io/js/class-bound-components) [![Coverage Status](https://coveralls.io/repos/github/janizde/class-bound-components/badge.svg?branch=master)](https://coveralls.io/github/janizde/class-bound-components?branch=master) [![Dependency Status](https://david-dm.org/janizde/class-bound-components.svg)](https://david-dm.org/janizde/class-bound-components)

React components bound to class names. As simple as that. Without tagged template literals.

## What it does

- Create component bound to one or more class name
- Apply class names based on boolean props, referred to as _variants_
- Offers shortcut members to wrap intrinsic elements such as `classBound.blockquote('my-blockquote')`
- Extend existing class bound components with the modifiers `extend`, `as`, `withVariants` and `withOptions`
- Strong TypeScript support: Allowed props restricted to those of the composed component and variant flags

**Use [`babel-plugin-class-bound-components`](https://www.npmjs.com/package/babel-plugin-class-bound-components) to benefit from:**

- Automatic inferring of display names like you're used to with regular React functional components
- Backwards compatibility with browsers not supporting ES6 `Proxy`, but still being able to use the `classBound[JSX.IntrinsicElement]()` shorthand (e.g., `classBound.button('foo')` instead of `classBound('foo', null, null, 'button')`)

## Example

```tsx
import classBound from 'class-bound-components';
import './breadcrumb.css';

const Container = classBound('container');
const Breadcrumb = classBound.ol('breadcrumb');
const BreadcrumbItem = classBound.li('breadcrumb-item', { isActive: 'active' });
const BreadcrumbLink = classBound.a('breadcrumb-link');

const BreadcrumbContainer: React.FC<{ items: Item[]; activeId: number }> = ({ items, activeId }) => (
  <Container>
    <Breadcrumb aria-label="breadcrumb">
      {items.map(item => {
        <BreadcrumbItem key={item.id} isActive={item.id === activeId}>
          <BreadcrumbLink href={item.url} target="_blank">{item.name}</a>
        </BreadcrumbItem>
      })}
    </Breadcrumb>
  </Container>
);

const BreadcrumbButton = classBound.as(BreadcrumbLink, 'button');
const VisitableBreadcrumbLink = classBound.withVariants(BreadcrumbLink, { isVisited: 'visited' });
const CustomBreadcrumbItem = classBound.extend(BreadcrumbLink, 'custom-breadcrumb-item', { isActive: 'custom-active' });
```

## Contents

1. [Installation](#installation)
1. [API](#api)
1. [Usage with CSS Modules](#usage-with-css-modules)
1. [Display Names](#display-names)
1. [TypeScript Support](#typescript-support)
1. [Ref Forwarding](#ref-forwarding)
1. [Changelog](./CHANGELOG.md)
1. [License](./LICENSE)

## Installation

```sh
# With npm
npm install --save class-bound-components

# With yarn
yarn add class-bound-components
```

In both cases make sure you have `react` as well as `react-dom` added to your project.

## API

### Component Creation

#### `classBound(options)`

Creates a new `ClassBoundComponent` from an options object with the following properties. All options are optional.

<!-- prettier-ignore -->
|Name|Type|Description|
|-----|-----|-----|
|`className`|`string` or `string[]`|Classes that are applied to the base component without any condition|
|`displayName`|`string`|Display name of the component created. This appears for instance in the React devtools. When omitted it's referred to as *Anonymous*|
|`variants`|`Record<string, ClassValue>`<sup>1</sup>|Object mapping the name of a variant, i.e., the name of the prop that has to be set to enable the variant, to a `ClassValue` that should be applied when the variant is enabled.|
|`elementType`|`React.ElementType<any>`|Type of element to use a the base for the component. May be any string recognized by `ReactDOM` or a custom React component. default: `'div'`|

<sup>1</sup> `ClassValue` refers to any kind of value that can be passed into the [`classnames` Function](https://github.com/JedWatson/classnames).

<!-- prettier-ignore -->
```tsx
const Button = classBound({
  className: 'custom-button',
  displayName: 'Button',
  variants: { isPrimary: 'primary', isCTA: ['secondary', 'cta'] },
  elementType: 'button'
});
```

#### `classBound[JSX.IntrinsicElement](className[, displayName[, variants]])`

Alias for `classBound(options)` offering a member on the `classBound` function for all known intrinsic elements, i.e., leaf elements that are recognized by React DOM.

Note that these shortcut members make use of the JavaScript [`Proxy`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) object. Using this in a browser that does not support `Proxy` will throw a runtime error. If you need to support such browsers, it is recommended to make use of the [`babel-plugin-class-bound-components`](https://www.npmjs.com/package/babel-plugin-class-bound-components), which will inline these method calls to the standard `elementType` argument and hence won't use `Proxy` anymore.

```tsx
const CustomLink = classBound.a('custom-link', 'CustomLink', {
  isActive: 'active',
});

const CustomQuote = classBound.blockquote('custom-quote');
```

#### `classBound(className[, displayName[, variants[, elementType]]])`

Alias for `classBoundComponent(options)` containing all options defined above as positional arguments.

<!-- prettier-ignore -->
```tsx
const Button = classBound('custom-button', 'Button', { isPrimary: 'primary' }, 'button');
const UnnamedButton = classBound('custom-button', { isPrimary: 'primary' }, 'button');
```

#### `classBound(className[, variants[, elementType]])`

Alias for `classBoundComponent(options)` omitting the `displayName` option which will be set to `undefined` when calling this signature.

<!-- prettier-ignore -->
```tsx
const Button = classBound('custom-button', { isPrimary: 'primary' }, 'button');
Button.displayName === undefined; // Meh, not interested in `displayName`
```

### Modifiers

Modifiers are functions with which clones of an existing `ClassBoundComponent` can be created with slight modifications. The modifiers `extend`, `withVariants`, `withOptions` and `as` are accessible as members of the `classBound` function. Additionally, all of them can be imported as named imports from `class-bound-components`

```ts
import classBound, {
  extend,
  withVariants,
  withOptions,
  as,
} from 'class-bound-components';

classBound.extend === extend;
classBound.withVariants === withVariants;
classBound.withOptions === withOptions;
classBound.as === as;
```

#### `classBound.extend(ClassBoundComponent, className[, displayName][, variants])`

Extends an existing `ClassBoundComponent` with class names and variants so that class names and already existing variants are combined. Useful when existing class names and variant class names should persist while augmenting them with more specific classes. The `displayName` argument can optionally be left out.

```tsx
const Button = classBound.button('button', 'Button', {
  isActive: 'button-active',
});

const CustomButton = classBound.extend(
  Button,
  'custom-button',
  'CustomButton',
  {
    isActive: 'custom-button-active',
  }
);

<CustomButton isActive />;
// renders <button className="button custom-button button-active custom-button-active" />
```

#### `classBound.as(ClassBoundComponent, elementType)`

Creates a copy of a `ClassBoundComponent` with similar options except the `elementType` being set to a different value

<!-- prettier-ignore -->
```tsx
const CustomButton = classBound.button('custom-button', 'CustomButton', { isPrimary: 'primary' });

// Oops need the same styles as an `<a />` tag
const CustomLink = classBound.as(CustomButton, 'a');

<CustomLink href="https://example.com/" target="_blank" isPrimary>Click me!</CustomLink>
         // ^ awesome! TypeScript allows these <a> specific props now!
```

#### `classBound.withVariants(ClassBoundComponent, mergeVariants)`

Creates a copy of a `ClassBoundComponent` with similar options except the `variants` are merged with `mergeVariants`. While old variants that are not specified in the merge variants remain untouched, naming conflicts are resolved by preferring the variants in `mergeVariants`. Note that this differs from the behavior of `ClassBoundComponent.extend`.

<!-- prettier-ignore -->
```tsx
// button.tsx
import './buttons.css';

const BaseButton = classBound.button('baseButton', 'BaseButton', { isPrimary: 'primary', isFlashy: 'flashy' });

// my-custom-container.tsx
import 'my-custom-container.css';

const CustomButton = classBound.withVariants(BaseButton, {
  isFlashy: 'customFlashy',
});

<CustomButton type="button" isPrimary isFlashy>Click me</CustomButton>
// renders <button type="button" className="baseButton primary customFlashy">Click me</button>
// note that `flashy` got removed in favor of `customFlashy`
```

#### `classBound.withOptions(ClassBoundComponent, oldOptions => newOptions)`

Creates a copy of a `ClassBoundComponent` by applying the provided function on the existing options and taking the return value of the function as the new options.

```tsx
const Button = classBound.button('button', 'Button', { variantA: 'variant-a' });

const CustomButton = classBound.withOptions(Button, (options) => ({
  className: [options.className, 'fooClass', 'barClass'],
  variants: { ...options.variants, variantB: 'variant-b' },
  displayName: `Custom(${options.displayName})`,
}));

CustomButton.displayName === 'Custom(Button)';

<CustomButton variantA variantB />;
// renders <button classNames="button fooClass barClass variantA variantB">
```

## Usage with CSS Modules

`class-bound-components` is compatible with anything that produces class names as strings. This might be global styles defined in a separate CSS file but also class names that are generated by CSS modules for instance. Instead of the raw class name string you would normally pass to `classBound`, simply pass the modularized CSS class name generated by CSS modules.

```css
/* button.css */

.button {
  background-color: white;
  border: 1px #ccc solid;
}

.isActive {
  background-color: #ccc;
}
```

```tsx
// button.tsx
import classBound from 'class-bound-components';

import buttonStyles from './button.css';

export const Button = classBound.button(buttonStyles.button, {
  isActive: buttonStyles.isActive,
});

// renders <button className="6h3b 0e9c">Click me</button> given that CSS modules
// provides these class names for the module styles
const Container: React.FC = () => <Button isActive>Click me</Button>;
```

## Display Names

Usually, `displayName`s in React benefit from the automatic assignment to `Function.name` when defining a functional component, which will make the component appear as the name of the function in React DevTools and Error traces.

Unfortunately, this doesn't work for components created with `classBound`, since these are defined in a closure. For this, all signatures of `classBound` can be provided with an explicit string for the `displayName` property of the component.

This can be omitted when using [babel-plugin-class-bound-components](https://www.npmjs.com/package/babel-plugin-class-bound-components). This babel plugin tries to infer the `displayName` in the fashion like `Function.name` would normally do and inlines these into the calls of `classBound`, so you don't have to repeat yourself over and over again. Read more [in the transformation documentation](https://github.com/janizde/babel-plugin-class-bound-components#display-name-inlining).

## TypeScript

`class-bound-components` is built in TypeScript so it supports strong static types out of the box. In particular it is aware of the props that are allowed to be passed to components, be it the passed-down props of the composed element type (e.g., the props of a `<button />` element) or props introduced through custom variants. Of course types are also provided for the different signatures of the `classBound` function and the member functions on the components.

## Ref Forwarding

`class-bound-components` handles ref-forwarding automatically. This means for intrinsic elements like `div` or `img` it will create a `React.forwardRef` component as well as in the case of passing it a `forwardRef` component as `elementType`. For other cases a regular function component is returned.

```tsx
// Wrapping an intrinsic element
const CustomImage = classBound.img('custom-image');
const imageRef = React.createRef<HTMLImageElement>();
const el1 = <CustomImage ref={imageRef} />; // This works by default!

// Wrapping a ref forwarding component
const RefForwardingImage = React.forwardRef<HTMLImageElement, {}>((_, ref) => (
  <img ref={imageRef} />
));

const CustomRefForwardingImage = classBound(
  'custom-image',
  null,
  RefForwardingImage
);
const el2 = <CustomRefForwardingImage ref={imageRef} />; // This works as well!

// Wrapping a non ref forwarding component
const FunctionComponent: React.FC<{}> = () => <img alt="No ref here" />;
const CustomFunctionComponent = classBound(
  'custom-image',
  null,
  FunctionComponent
);
const el3 = <CustomFunctionComponent ref={imageRef} />; // This doesn't work since `FunctionComponent` doesn't have a ref
```

&copy; 2020 Jannik Portz – [License](./LICENSE)

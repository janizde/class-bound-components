# class-bound-components ⚛️ 🖼 [![Build Status](https://travis-ci.com/janizde/class-bound-components.svg?branch=master)](https://travis-ci.com/janizde/class-bound-components)

React components bound to class names. As simple as that. Without tagged template literals.

## What it does

- Create component bound to one or more class name
- Apply class names based on boolean props, referred to as _variants_
- Offers shortcut members to wrap intrinsic elements such as `classBound.blockquote('my-blockquote')`
- Extend existing class bound components with the modifiers `.extend`, `.as(component)`, `.withVariants` and `.withOptions`
- Strong TypeScript support: Allowed props restricted to those of the composed component and variant flags

## Why not [`styled-components`](https://styled-components.com/)

While CSS-in-JS approaches like styled-components have gained a lot of attention in the last couple of years you might be in a position where you can't or don't want to move to CSS-in-JS

- You might be using an external CSS library like Bootstrap
- You might be converting an old codebase to React and just want to focus on component functionality instead of also migrating all of your CSS to CSS-in-JS
- You might as well just not like CSS-in-JS

Still, you might want to have React components that abstract away the internals of your style sheets, or you're even using TypeScript and want to benefit from static types for styling components instead of raw class name concatenation.

This is where `class-bound-components` comes into play. It allows you to bind class names, be it global class name strings or even class names generated by `css-modules` to be bound to components. `classed-components` enables you to introduce an abstraction layer between style sheets and component usage that can also support a future migration from CSS-in-CSS to CSS-in-JS.

## Example

```tsx
import classBound from 'class-bound-components';
import './breadcrumb.css';

const Container = classBound('container', 'Container');
const Breadcrumb = classBound.ol('breadcrumb', 'Breadcrumb');
const BreadcrumbItem = classBound.li('breadcrumb-item', 'BreadcrumbItem', { isActive: 'active' });
const BreadcrumbLink = classBound.a('breadcrumb-link', 'BreadcrumbLink');

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

const BreadcrumbButton = BreadcrumbLink.as('button');
const VisitableBreadcrumbLink = BreadcrumbLink.withVariants({ isVisited: 'visited' });
const CustomBreadcrumbItem = BreadcrumbItem.extend('custom-breadcrumb-item', 'CustomBreadcrumbItem', { isActive: 'custom-active' });
```

## API

### `classBound(options)`

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

### `classBound[JSX.IntrinsicElement](className[, displayName[, variants]])`

Alias for `classBound(options)` offering a member on the `classBound` function for all known intrinsic elements, i.e., leaf elements that are recognized by React DOM.

Note that these shortcut members make use of the JavaScript [`Proxy`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) object. Using this in a browser that does not support `Proxy` will throw a runtime error. In these cases refer to `elementType` in the other signatures.

```tsx
const CustomLink = classBound.a('custom-link', 'CustomLink', {
  isActive: 'active',
});

const CustomQuote = classBound.blockquote('custom-quote');
```

### `classBound(className[, displayName[, variants[, elementType]]])`

Alias for `classBoundComponent(options)` containing all options defined above as positional arguments.

<!-- prettier-ignore -->
```tsx
const Button = classBound('custom-button', 'Button', { isPrimary: 'primary' }, 'button');
const UnnamedButton = classBound('custom-button', { isPrimary: 'primary' }, 'button');
```

### `classBound(className[, variants[, elementType]])`

Alias for `classBoundComponent(options)` omitting the `displayName` option which will be set to `undefined` when calling this signature.

<!-- prettier-ignore -->
```tsx
const Button = classBound('custom-button', { isPrimary: 'primary' }, 'button');
Button.displayName === undefined; // Meh, not interested in `displayName`
```

### `ClassBoundComponent.extend(className[, displayName][, variants])`

Extends an existing `ClassBoundComponent` with class names and variants so that class names and already existing variants are combined. Useful when existing class names and variant class names should persist while augmenting them with more specific classes. The `displayName` argument can optionally be left out.

```tsx
const Button = classBound.button('button', 'Button', {
  isActive: 'button-active',
});

const CustomButton = Button.extend('custom-button', 'CustomButton', {
  isActive: 'custom-button-active',
});

<CustomButton isActive />;
// renders <button className="button custom-button button-active custom-button-active" />
```

### `ClassBoundComponent.as(elementType)`

Creates a copy of a `ClassBoundComponent` with similar options except the `elementType` being set to a different value

<!-- prettier-ignore -->
```tsx
const CustomButton = classBound.button('custom-button', 'CustomButton', { isPrimary: 'primary' });

// Oops need the same styles as an `<a />` tag
const CustomLink = CustomButton.as('a');

<CustomLink href="https://example.com/" target="_blank" isPrimary>Click me!</CustomLink>
         // ^ awesome! TypeScript allows these <a> specific props now!
```

### `ClassBoundComponent.withVariants(mergeVariants)`

Creates a copy of a `ClassBoundComponent` with similar options except the `variants` are merged with `mergeVariants`. While old variants that are not specified in the merge variants remain untouched, naming conflicts are resolved by preferring the variants in `mergeVariants`. Note that this differs from the behavior of `ClassBoundComponent.extend`.

<!-- prettier-ignore -->
```tsx
// button.tsx
import './buttons.css';

const BaseButton = classBound.button('baseButton', 'BaseButton', { isPrimary: 'primary', isFlashy: 'flashy' });

// my-custom-container.tsx
import 'my-custom-container.css';

const CustomButton = BaseButton.withVariants({
  isFlashy: 'customFlashy',
});

<CustomButton type="button" isPrimary isFlashy>Click me</CustomButton>
// renders <button type="button" className="baseButton primary customFlashy">Click me</button>
// note that `flashy` got removed in favor of `customFlashy`
```

### `ClassBoundComponent.withOptions(oldOptions => newOptions)`

Creates a copy of a `ClassBoundComponent` by applying the provided function on the existing options and taking the return value of the function as the new options.

```tsx
const Button = classBound.button('button', 'Button', { variantA: 'variant-a' });

const CustomButton = Button.withOptions((options) => ({
  className: [options.className, 'fooClass', 'barClass'],
  variants: { ...options.variants, variantB: 'variant-b' },
  displayName: `Custom(${options.displayName})`,
}));

CustomButton.displayName === 'Custom(Button)';

<CustomButton variantA variantB />;
// renders <button classNames="button fooClass barClass variantA variantB">
```

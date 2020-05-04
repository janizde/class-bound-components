# classed-components

The glue between component interfaces for styles and CSS-in-CSS.

> It's 2020 and your roomie and you come up with the idea of yet another app to share your favorite playlist. That interface designer you met a Sameheads last fall owes you a favor for the night they forgot all their money and cards in their WG sublet and in exchange draft a UI concept that's flat, modern and crisp in only two hours. You've heard that _CSS-in-JS_ is a thing and realize it's a breeze builiding your new UI from scratch using `styled-components`. Life is good ✌️

## Example

```tsx
import classedComponent from 'classed-components';
import './breadcrumb.css';

const Breadcrumb = classedComponent('breadcrumb', 'Breadcrumb', 'ol');
const BreadcrumbItem = classedComponent('breadcrumb-item', 'BreadcrumbItem', { isActive: 'active' }, 'li');
const BreadcrumbLink = classedComponent('breadcrumb-link', 'BreadcrumbLink', 'a');

const BreadcrumbContainer: React.FC<{ items: Item[]; activeId: number }> = ({ items, activeId }) => (
  <Breadcrumb aria-label="breadcrumb">
    {items.map(item => {
      <BreadcrumbItem key={item.id} isActive={item.id === activeId}>
        <BreadcrumbLink href={item.url} target="_blank">{item.name}</a>
      </BreadcrumbItem>
    })}
  </Breadcrumb>
);

const BreadcrumbButton = BreadcrumbLink.as('button');
const VisitableBreadcrumbLink = BreadcrumbLink.withVariants({ isVisited: 'visited' });
```

## API

### `classedComponent(options)`

Creates a new `ClassedComponent` from an options object with the following properties

<!-- prettier-ignore -->
|Name|Type|Description|
|-----|-----|-----|
|`className`|`ClassValue`<sup>1</sup>|Classes that are applied to the base component without any condition|
|`displayName`|`string`|Display name of the component created. This appears for instance in the React devtools. When omitted it's referred to as *Anonymous*|
|`variants`|`Record<string, ClassValue>`<sup>1</sup>|Object mapping the name of a variant, i.e., the name of the prop that has to be set to enable the variant, to a `ClassValue` that should be applied when the variant is enabled.|
|`elementType`|`React.ElementType<any>`|Type of element to use a the base for the component. May be any string recognized by `ReactDOM` or a custom React component. default: `'div'`|

<sup>1</sup> `ClassValue` refers to any kind of value that can be passed into the [`classnames` Function](https://github.com/JedWatson/classnames).

### `classedComponent(className[, displayName[, variants[, elementType]]])`

Alias for `classedComponent(options)` containing all options defined above as positional arguments. Options except `className` can be omitted.

### `classedComponent(className[, variants[, elementType]])`

Alias for `classedComponent(options)` omitting the `displayName` option which will be set to `undefined` when calling this signature.

### `ClassedComponent.as(elementType)`

Creates a copy of a `ClassedComponent` with similar options except the `elementType` being set to a different value

Example:

<!-- prettier-ignore -->
```tsx
const CustomButton = classedComponent('customButton', 'CustomButton', { isPrimary: 'primary' }, 'button');

// Oops need the same styles as an `<a />` tag
const CustomLink = CustomButton.as('a');

<CustomLink href="https://example.com/" target="_blank" isPrimary>Click me!</CustomLink>
         // ^ awesome! TypeScript allows these <a> specific props now!
```

### `ClassedComponent.withVariants(mergeVariants)`

### `ClassedComponent.withOptions(mergeOptions)`

### `ClassedComponent.withOptions(oldOptions => newOptions)`

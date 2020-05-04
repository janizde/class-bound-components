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

### `classedComponent(options): ClassedComponent`

### `classedComponent(className[, displayName[, variants[, elementType]]]): ClassedComponent`

### `classedComponent(className[, variants[, elementType]])`

### `ClassedComponent.as(elementType): ClassedComponent`

### `ClassedComponent.withVariants(mergeVariants): ClassedComponent`

### `ClassedComponent.withOptions(mergeOptions): ClassedComponent`

### `ClassedComponent.withOptions(oldOptions => newOptions): ClassedComponent`

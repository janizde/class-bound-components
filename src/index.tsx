import classNames from 'classnames';
import { ClassValue, ClassArray } from 'classnames/types';

import * as React from 'react';

type Variants = {};

type VariantProps<V extends Variants = {}> = {
  [K in keyof V]?: boolean;
};

type OuterProps<T, V extends Variants = {}> = T & VariantProps<V>;

export default function createClassedComponent<
  V extends Variants,
  E extends React.ElementType<any> = 'div'
>(className: ClassValue, displayName?: string, variants?: V, ElementType?: E) {
  type Props = OuterProps<React.ComponentProps<E>, V>;

  const ComposedComponent: React.FC<Props> = (() => {
    return (props: Props) => {
      const { componentProps, variantProps } = splitProps(
        props,
        variants || {}
      );

      const variantClassNames = makeVariantClassNames(
        variants || {},
        variantProps
      );

      const componentClassName = classNames(className, variantClassNames);
      const ElementTypeSafe = ElementType || 'div';

      return (
        <ElementTypeSafe className={componentClassName} {...componentProps} />
      );
    };
  })();

  ComposedComponent.displayName = displayName;
  return ComposedComponent;
}

function makeVariantClassNames<V extends Variants>(
  variants: V,
  props: VariantProps<V>
) {
  const classNames: ClassArray = [];
  for (const variantName in variants) {
    if (props[variantName]) {
      classNames.push(variants[variantName]);
    }
  }

  return classNames;
}

type SplitProps<P extends VariantProps<V>, V> = {
  variantProps: VariantProps<V>;
  componentProps: Omit<P, keyof V>;
};

function splitProps<P extends VariantProps<V>, V extends Variants = {}>(
  props: P,
  variants: V
): SplitProps<P, V> {
  const componentProps: P = { ...props };
  const variantProps: VariantProps<P> = {};
  for (const variantName in variants) {
    if (props.hasOwnProperty(variantName)) {
      variantProps[variantName] = props[variantName];
      delete componentProps[variantName];
    }
  }

  return { componentProps, variantProps };
}

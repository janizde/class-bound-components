import classNames from 'classnames';
import { ClassValue, ClassArray } from 'classnames/types';

import * as React from 'react';

const __ccOptions = Symbol('__ccOptions');

// Base type for variants
type Variants = {};

// Props related to enabling and disabling variants
type VariantProps<V extends Variants = {}> = {
  [K in keyof V]?: boolean;
};

// Type of props of the wrapper component combining element-related props
// and props related to variants
type OuterProps<P, V extends Variants = {}> = P & VariantProps<V>;

type Options<
  E extends React.ElementType<any> = 'div',
  V extends Variants = {}
> = {
  className: ClassValue;
  displayName?: string;
  variants?: V;
  elementType: E;
};

type ClassedComponent<
  E extends React.ElementType<any> = 'div',
  V extends Variants = {}
> = React.FC<OuterProps<React.ComponentProps<E>, V>> & {
  [__ccOptions]: Options<E, V>;
  withVariants<V2 extends Variants>(
    this: ClassedComponent<E, V>,
    variants: V2
  ): ClassedComponent<E, V & V2>;
};

function createClassedComponentFromOptions<
  V extends Variants,
  E extends React.ElementType<any> = 'div'
>(options: Options<E, V>) {
  type Props = OuterProps<React.ComponentProps<E>, V>;

  const ComposedComponent = (() => {
    return function (props: Props) {
      const { componentProps, variantProps } = splitProps(
        props,
        options.variants || {}
      );

      const variantClassNames = makeVariantClassNames(
        options.variants || {},
        variantProps
      );

      const componentClassName = classNames(
        options.className,
        variantClassNames
      );

      const ElementTypeSafe = (options.elementType ||
        'div') as React.ElementType;

      return (
        <ElementTypeSafe className={componentClassName} {...componentProps} />
      );
    };
  })() as ClassedComponent<E, V>;

  ComposedComponent.displayName = options.displayName;
  ComposedComponent[__ccOptions] = options;
  ComposedComponent.withVariants = withVariants;

  return ComposedComponent;
}

function withVariants<
  E extends React.ElementType<any> = 'div',
  V extends Variants = {},
  V2 extends Variants = {}
>(this: ClassedComponent<E, V>, variants: V2): ClassedComponent<E, V & V2> {
  const options = this[__ccOptions];
  const mergedVariants = { ...options.variants, ...variants } as V & V2;
  return createClassedComponentFromOptions({
    ...options,
    variants: mergedVariants,
  });
}

export default function createClassedComponent<
  V extends Variants,
  E extends React.ElementType<any> = 'div'
>(className: ClassValue, displayName?: string, variants?: V, elementType?: E) {
  return createClassedComponentFromOptions({
    className,
    displayName,
    variants,
    elementType: elementType || 'div',
  });
}

/**
 * Creates an array of ClassValues of those variants that are enabled in the props
 * @param     variants    Variants object
 * @param     props       Props to look for variants in
 * @returns               Array of ClassValues to add to the component
 */
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

/**
 * Splits a combined props object so that the variant flags are separated out
 * @param     props       Combined props object
 * @param     variants    Variants object
 * @returns               Object with `variantProps` and `componentProps`
 */
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

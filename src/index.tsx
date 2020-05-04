import classNames from 'classnames';
import { ClassValue, ClassArray } from 'classnames/types';

import * as React from 'react';

const __ccOptions = Symbol('__ccOptions');
export const CC_OPTIONS = __ccOptions;

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
  // Class that's always applied to the component
  className: ClassValue;
  // `displayName` for the resulting component
  displayName?: string;
  // Record mapping the name of a variant to the ClassValue applied when active
  variants?: V;
  // Type of the element, may be a known element string (e.g., 'div') or a React component
  elementType: E;
};

export type ClassedComponent<
  E extends React.ElementType<any> = 'div',
  V extends Variants = {}
> = React.FC<OuterProps<React.ComponentProps<E>, V>> & {
  [__ccOptions]: Options<E, V>;
  withVariants<V2 extends Variants>(
    this: ClassedComponent<E, V>,
    variants: V2
  ): ClassedComponent<E, V & V2>;
  as<E2 extends React.ElementType<any>>(
    this: ClassedComponent<E, V>,
    elementType: E2
  ): ClassedComponent<E2, V>;
};

/**
 * Creates a `ClassedComponent` with the options object provided in `options`
 *
 * @param   options     Options for the ClassedComponent
 * @returns             ClassedComponent
 */
function createClassedComponentFromOptions<
  V extends Variants = {},
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
  ComposedComponent.as = as;

  return ComposedComponent;
}

/**
 * Creates a new ClassedComponent with the same options as this ClassedComponent
 * except the variants being extended with `variants`. While existing variants remain,
 * new variants override old variants if they're named similarly.
 *
 * @param     this
 * @param     variants    Variants to merge into this component's variants
 * @returns               ClassedComponent with merged variants
 */
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

/**
 * Creates a new ClassedComponent with the same options as this ClassedComponent
 * except the `elementType` being set to the `elementType` from the parameters.
 *
 * @param     this
 * @param     elementType   New element type of ClassedComponent
 * @returns                 ClassedComponent with modified elementType
 */
function as<E2 extends React.ElementType<any>, V extends Variants = {}>(
  this: ClassedComponent<any, V>,
  elementType: E2
): ClassedComponent<E2, V> {
  const options = this[__ccOptions];
  return createClassedComponentFromOptions<V, E2>({
    ...options,
    elementType,
  });
}

function createClassedComponent<
  E extends React.ElementType<any> = 'div',
  V extends Variants = {}
>(options: Options<E, V>): ClassedComponent<E, V>;
function createClassedComponent<
  E extends React.ElementType<any> = 'div',
  V extends Variants = {}
>(
  className: ClassValue,
  displayName?: string,
  variants?: V,
  elementType?: E
): ClassedComponent<E, V>;
function createClassedComponent<
  E extends React.ElementType<any> = 'div',
  V extends Variants = {}
>(className: ClassValue, variants: V, elementType?: E): ClassedComponent<E, V>;
function createClassedComponent(
  optionsOrClassName: any,
  displayNameOrVariants?: any,
  variantsOrElementType?: any,
  elementType?: any
) {
  if (typeof optionsOrClassName === 'object') {
    return createClassedComponentFromOptions(optionsOrClassName);
  }

  if (typeof displayNameOrVariants === 'object') {
    return createClassedComponentFromOptions({
      className: optionsOrClassName,
      displayName: undefined,
      variants: displayNameOrVariants,
      elementType: 'div',
    });
  }

  return createClassedComponentFromOptions({
    className: optionsOrClassName,
    displayName: displayNameOrVariants,
    variants: variantsOrElementType,
    elementType,
  });
}

export default createClassedComponent;

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

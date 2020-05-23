import classNames from 'classnames';
import { ClassValue, ClassArray } from 'classnames/types';

import * as React from 'react';

const __ccOptions = Symbol('__ccOptions');
export const CC_OPTIONS = __ccOptions;

// Base type for variants
type Variants = {};

// Props related to enabling and disabling variants
type VariantProps<V extends Variants> = {
  [K in keyof V]?: boolean;
};

// Type of props of the wrapper component combining element-related props
// and props related to variants
type OuterProps<P, V extends Variants> = P & VariantProps<V>;

type Options<V extends Variants, E extends React.ElementType<any> = 'div'> = {
  // Class that's always applied to the component
  className: ClassValue | undefined;
  // `displayName` for the resulting component
  displayName: string | undefined;
  // Record mapping the name of a variant to the ClassValue applied when active
  variants: V | undefined;
  // Type of the element, may be a known element string (e.g., 'div') or a React component
  elementType: E | undefined;
};

function withDefaultOptions<O extends Options<any, any>>(options: Partial<O>) {
  return {
    className: undefined,
    displayName: undefined,
    variants: undefined,
    elementType: 'div',
    ...options,
  } as O;
}

export type ClassBoundComponent<
  V extends Variants,
  E extends React.ElementType<any> = 'div'
> = React.FC<OuterProps<React.ComponentProps<E>, V>> & {
  [__ccOptions]: Options<V, E>;
  withVariants: typeof withVariants;
  withOptions: typeof withOptions;
  as: typeof as;
  extend: typeof extend;
};

/**
 * Creates a `ClassBoundComponent` with the options object provided in `options`
 *
 * @param   options     Options for the ClassBoundComponent
 * @returns             ClassBoundComponent
 */
function createClassBoundComponentFromOptions<
  V extends Variants,
  E extends React.ElementType<any> = 'div'
>(options: Options<V, E>) {
  type Props = OuterProps<React.ComponentProps<E>, V>;

  const ComposedComponent = (() => {
    return function ({ className: customClassName, ...restProps }: Props) {
      const { componentProps, variantProps } = splitProps(
        restProps,
        options.variants || {}
      );

      const variantClassNames = makeVariantClassNames(
        options.variants || {},
        variantProps
      );

      const componentClassName = classNames(
        options.className,
        variantClassNames,
        customClassName
      );

      const ElementTypeSafe = (options.elementType ||
        'div') as React.ElementType;

      return (
        <ElementTypeSafe
          className={
            componentClassName.length < 1 ? undefined : componentClassName
          }
          {...componentProps}
        />
      );
    };
  })() as ClassBoundComponent<V, E>;

  ComposedComponent.displayName = options.displayName;
  ComposedComponent[__ccOptions] = options;
  ComposedComponent.withVariants = withVariants;
  ComposedComponent.as = as;
  ComposedComponent.extend = extend;
  ComposedComponent.withOptions = withOptions;

  return ComposedComponent;
}

function extend<
  E extends React.ElementType<any>,
  V extends Variants,
  V2 extends Variants
>(
  this: ClassBoundComponent<V, E>,
  className: ClassValue,
  variants: V2
): ClassBoundComponent<V & V2, E>;
function extend<
  E extends React.ElementType<any>,
  V extends Variants,
  V2 extends Variants
>(
  this: ClassBoundComponent<V, E>,
  className: ClassValue,
  displayName?: string,
  variants?: V2
): ClassBoundComponent<V & V2, E>;
function extend<
  E extends React.ElementType<any>,
  V extends Variants,
  V2 extends Variants
>(
  this: ClassBoundComponent<V, E>,
  className: ClassValue,
  displayNameOrVariants?: string | V2,
  maybeVariants?: V2
) {
  const displayName =
    typeof displayNameOrVariants === 'string'
      ? displayNameOrVariants
      : undefined;

  const variants =
    typeof displayNameOrVariants === 'object'
      ? displayNameOrVariants
      : maybeVariants || ({} as V2);

  const options = this[__ccOptions];
  return createClassBoundComponentFromOptions<V & V2, E>({
    className: mergeClassValues(options.className, className),
    displayName,
    variants: mergeVariants<V, V2>(options.variants || ({} as V), variants),
    elementType: options.elementType,
  });
}

/**
 * Creates a new ClassBoundComponent with the same options as this ClassBoundComponent
 * except the variants being extended with `variants`. While existing variants remain,
 * new variants override old variants if they're named similarly.
 *
 * @param     this
 * @param     variants    Variants to merge into this component's variants
 * @returns               ClassBoundComponent with merged variants
 */
function withVariants<
  V extends Variants,
  V2 extends Variants,
  E extends React.ElementType<any> = 'div'
>(
  this: ClassBoundComponent<V, E>,
  variants: V2,
  displayName?: string
): ClassBoundComponent<V & V2, E> {
  const options = this[__ccOptions];
  const mergedVariants = { ...options.variants, ...variants } as V & V2;
  return createClassBoundComponentFromOptions({
    ...options,
    displayName: displayName || options.displayName,
    variants: mergedVariants,
  });
}

/**
 * Creates a new ClassBoundComponent with the same options as this ClassBoundComponent
 * except the `elementType` being set to the `elementType` from the parameters.
 *
 * @param     this
 * @param     elementType   New element type of ClassBoundComponent
 * @returns                 ClassBoundComponent with modified elementType
 */
function as<E2 extends React.ElementType<any>, V extends Variants>(
  this: ClassBoundComponent<V, any>,
  elementType: E2,
  displayName?: string
): ClassBoundComponent<V, E2> {
  const options = this[__ccOptions];
  return createClassBoundComponentFromOptions<V, E2>({
    ...options,
    displayName: displayName || options.displayName,
    elementType,
  });
}

/**
 * Creates a new ClassBoundComponent with options provided by the `transformOptions` argument
 * which will receive this ClassBoundComponent's options.
 *
 * @param     this
 * @param     transformOptions  Function mapping options of this ClassBoundComponent to the new options
 * @returns                     ClassBoundComponent with options returned by `transformOptions`
 */
function withOptions<
  V extends Variants,
  V2 extends Variants,
  E extends React.ElementType<any>,
  E2 extends React.ElementType<any> = 'div'
>(
  this: ClassBoundComponent<V, E>,
  transformOptions: (prevOptions: Options<V, E>) => Partial<Options<V2, E2>>
): ClassBoundComponent<V2, E2> {
  const prevOptions = this[__ccOptions];
  const nextOptions = transformOptions(prevOptions);
  return createClassBoundComponentFromOptions(withDefaultOptions(nextOptions));
}

function createClassBoundComponent<
  V extends Variants,
  E extends React.ElementType<any> = 'div'
>(options: Options<V, E>): ClassBoundComponent<V, E>;
function createClassBoundComponent<
  V extends Variants,
  E extends React.ElementType<any> = 'div'
>(
  className: string | string[] | null | undefined,
  displayName?: string,
  variants?: V,
  elementType?: E
): ClassBoundComponent<V, E>;
function createClassBoundComponent<
  V extends Variants,
  E extends React.ElementType<any> = 'div'
>(
  className: ClassValue,
  variants: V,
  elementType?: E
): ClassBoundComponent<V, E>;
function createClassBoundComponent(
  optionsOrClassName: any,
  displayNameOrVariants?: any,
  variantsOrElementType?: any,
  elementType?: any
) {
  if (typeof optionsOrClassName === 'object') {
    return createClassBoundComponentFromOptions(optionsOrClassName);
  }

  if (typeof displayNameOrVariants === 'object') {
    return createClassBoundComponentFromOptions({
      className: optionsOrClassName,
      displayName: undefined,
      variants: displayNameOrVariants,
      elementType: 'div',
    });
  }

  return createClassBoundComponentFromOptions({
    className: optionsOrClassName,
    displayName: displayNameOrVariants,
    variants: variantsOrElementType,
    elementType,
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
function splitProps<P extends VariantProps<V>, V extends Variants>(
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

function mergeClassValues(value1: ClassValue, value2: ClassValue): ClassValue {
  return value1 && value2 ? [value1, value2] : value1 || value2;
}

function mergeVariants<V1 extends Variants, V2 extends Variants>(
  v1: V1,
  v2: V2
): V1 & V2 {
  return Object.keys({ ...v1, ...v2 }).reduce((merged, variantName) => {
    (merged as Record<string, ClassValue>)[variantName] = mergeClassValues(
      v1[variantName as keyof V1],
      v2[variantName as keyof V2]
    );
    return merged;
  }, {} as V1 & V2);
}

type createClassBoundComponentProxy = {
  <V extends Variants, E extends React.ElementType<any> = 'div'>(
    options: Partial<Options<V, E>>
  ): ClassBoundComponent<V, E>;
  <V extends Variants, E extends React.ElementType<any> = 'div'>(
    className: string | string[] | null | undefined,
    displayName?: string,
    variants?: V,
    elementType?: E
  ): ClassBoundComponent<V, E>;
  <V extends Variants, E extends React.ElementType<any> = 'div'>(
    className: ClassValue,
    variants: V,
    elementType?: E
  ): ClassBoundComponent<V, E>;
} & {
  [K in keyof JSX.IntrinsicElements]: <V extends Variants>(
    ...args: Parameters<typeof createClassBoundComponent>
  ) => ClassBoundComponent<V, K>;
};

const wrappedInProxy = (Proxy
  ? new Proxy(createClassBoundComponent, {
      get(target, elementType: keyof JSX.IntrinsicElements) {
        return function (
          ...args: Parameters<typeof createClassBoundComponent>
        ) {
          return target(...args).withOptions((options) => ({
            ...options,
            elementType,
          }));
        };
      },
    })
  : createClassBoundComponent) as createClassBoundComponentProxy;

export default wrappedInProxy;

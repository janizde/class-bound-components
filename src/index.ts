import * as React from 'react';
import classNames from 'classnames';
import { ClassValue, ClassArray } from 'classnames/types';

export const CBC_OPTIONS = '__cbc_options';

// Base type for variants
type Variants = {};

// Props related to enabling and disabling variants
type VariantProps<V extends Variants> = {
  [K in keyof V]?: boolean;
};

// Type of props of the wrapper component combining element-related props
// and props related to variants
type OuterProps<P, V extends Variants> = P & VariantProps<V>;

// Describes the type of ref value for a given ElementType
type RefElementType<
  E extends React.ElementType
> = E extends keyof React.ReactHTML
  ? React.ReactHTML[E] extends React.DetailedHTMLFactory<any, infer R>
    ? R
    : never
  : React.ComponentProps<E>['ref'] extends React.Ref<infer U>
  ? U
  : never;

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

/**
 * Enhances a partial options object with defaults
 */
function withDefaultOptions<O extends Options<any, any>>(options: Partial<O>) {
  return {
    className: undefined,
    displayName: undefined,
    variants: undefined,
    elementType: 'div',
    ...options,
  } as O;
}

/**
 * React component type for a combination of variants and element type
 * Resolves to a ForwardRefExoticComponent when E is an intrinsic element or a
 * ref forwarding component itself, or to a FunctionComponent otherwise.
 */
type ClassBoundReactComponent<
  V extends Variants,
  E extends React.ElementType<any> = 'div'
> = E extends keyof React.ReactHTML
  ? React.ForwardRefExoticComponent<OuterProps<React.ComponentProps<E>, V>>
  : E extends React.ForwardRefExoticComponent<infer P>
  ? React.ForwardRefExoticComponent<OuterProps<React.ComponentProps<E>, V>>
  : React.FunctionComponent<OuterProps<React.ComponentProps<E>, V>>;

/**
 * Type of a ClassBoundComponent consisting of a React component type
 * and additional methods including the CBC_OPTIONS
 */
export type ClassBoundComponent<
  V extends Variants,
  E extends React.ElementType<any> = 'div'
> = ClassBoundReactComponent<V, E> & { [CBC_OPTIONS]: Options<V, E> };

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

  const ElementTypeSafe = (options.elementType || 'div') as React.ElementType;
  const shouldForwardRef =
    typeof ElementTypeSafe === 'string' ||
    (ElementTypeSafe as any).$$typeof === Symbol.for('react.forward_ref');

  const render = (() => (
    { className: customClassName, ...restProps }: Props,
    ref?: React.Ref<RefElementType<E>>
  ) => {
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

    const props: React.ComponentProps<typeof ElementTypeSafe> = {
      className: componentClassName.length < 1 ? undefined : componentClassName,
      ...componentProps,
    };

    if (shouldForwardRef) {
      props.ref = ref;
    }

    return React.createElement(ElementTypeSafe, props);
  })();

  const ComposedComponent = (shouldForwardRef
    ? React.forwardRef<RefElementType<E>, Props>(render)
    : render) as ClassBoundComponent<V, E>;

  ComposedComponent.displayName = options.displayName;
  ComposedComponent[CBC_OPTIONS] = options;

  return ComposedComponent;
}

type ExtendFn = {
  /**
   * Creates a new ClassBoundComponent with the className variants merged into this ClassBoundComponent.
   * When merged, the existing classNames and variants are combined to the union of the original and extended component.
   *
   * @param   className     className to combine with original className
   * @param   variants      variants to combine with original variants
   * @returns               ClassBoundComponent with original and extended className and variants
   */
  <E extends React.ElementType<any>, V extends Variants, V2 extends Variants>(
    component: ClassBoundComponent<V, E>,
    className: ClassValue,
    variants: V2
  ): ClassBoundComponent<V & V2, E>;
  /**
   * Creates a new ClassBoundComponent with the className variants merged into this ClassBoundComponent.
   * When merged, the existing classNames and variants are combined to the union of the original and extended component.
   *
   * @param   className     className to combine with original className
   * @param   displayName   displayName of the extended component
   * @param   variants      variants to combine with original variants
   * @returns               ClassBoundComponent with original and extended className and variants
   */
  <E extends React.ElementType<any>, V extends Variants, V2 extends Variants>(
    component: ClassBoundComponent<V, E>,
    className: ClassValue,
    displayName?: string,
    variants?: V2
  ): ClassBoundComponent<V & V2, E>;
};

const extend = function <
  E extends React.ElementType<any>,
  V extends Variants,
  V2 extends Variants
>(
  component: ClassBoundComponent<V, E>,
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

  const options = component[CBC_OPTIONS];
  return createClassBoundComponentFromOptions<V & V2, E>({
    className: mergeClassValues(options.className, className),
    displayName,
    variants: mergeVariants<V, V2>(options.variants || ({} as V), variants),
    elementType: options.elementType,
  });
} as ExtendFn;

/**
 * Creates a new ClassBoundComponent with the same options as this ClassBoundComponent
 * except the variants being extended with `variants`. While existing variants remain,
 * new variants override old variants if they're named similarly.
 *
 * @param     component   Component to enhance with variants
 * @param     variants    Variants to merge into this component's variants
 * @returns               ClassBoundComponent with merged variants
 */
function withVariants<
  V extends Variants,
  V2 extends Variants,
  E extends React.ElementType<any> = 'div'
>(
  component: ClassBoundComponent<V, E>,
  variants: V2,
  displayName?: string
): ClassBoundComponent<V & V2, E> {
  const options = component[CBC_OPTIONS];
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
 * @param     component     Component to convert
 * @param     elementType   New element type of ClassBoundComponent
 * @returns                 ClassBoundComponent with modified elementType
 */
function as<E2 extends React.ElementType<any>, V extends Variants>(
  component: ClassBoundComponent<V, any>,
  elementType: E2,
  displayName?: string
): ClassBoundComponent<V, E2> {
  const options = component[CBC_OPTIONS];
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
 * @param     component         Component to modify
 * @param     transformOptions  Function mapping options of this ClassBoundComponent to the new options
 * @returns                     ClassBoundComponent with options returned by `transformOptions`
 */
function withOptions<
  V extends Variants,
  V2 extends Variants,
  E extends React.ElementType<any>,
  E2 extends React.ElementType<any> = 'div'
>(
  component: ClassBoundComponent<V, E>,
  transformOptions: (prevOptions: Options<V, E>) => Partial<Options<V2, E2>>
): ClassBoundComponent<V2, E2> {
  const prevOptions = component[CBC_OPTIONS];
  const nextOptions = transformOptions(prevOptions);
  return createClassBoundComponentFromOptions(withDefaultOptions(nextOptions));
}

type CreateClassBoundComponentMethods = {
  extend: ExtendFn;
  withVariants: typeof withVariants;
  as: typeof as;
  withOptions: typeof withOptions;
};

type CreateClassBoundComponentFn = {
  /**
   * Creates a React component that is bound to one or more `className` values
   *
   * @param   options     Options object with any combination of `className`, `displayName`,
   *                      `variants` and `elementType`
   * @returns             React component bound to `className` values
   */
  <V extends Variants, E extends React.ElementType<any> = 'div'>(
    options: Partial<Options<V, E>>
  ): ClassBoundComponent<V, E>;
  /**
   * Creates a React component that is bound to one or more `className` values
   *
   * @param   className     `className` or array of `className`s to always apply
   * @param   displayName   `displayName` of the created component
   * @param   variants      Object mapping a prop name to class values applied when this prop is truthy
   * @param   elementType   Custom type of component to be wrapped. May be a string with an intrinsic attribute name or a custom component
   * @returns               React component bound to `className` values
   */
  <V extends Variants = {}, E extends React.ElementType<any> = 'div'>(
    className: string | string[] | null | undefined,
    displayName?: string,
    variants?: V | null,
    elementType?: E
  ): ClassBoundComponent<V, E>;
  /**
   * Creates a React component that is bound to one or more `className` values
   *
   * @param   className     `className` or array of `className`s to always apply
   * @param   variants      Object mapping a prop name to class values applied when this prop is truthy
   * @param   elementType   Custom type of component to be wrapped. May be a string with an intrinsic attribute name or a custom component
   * @returns               React component bound to `className` values
   */
  <V extends Variants = {}, E extends React.ElementType<any> = 'div'>(
    className: ClassValue,
    variants: V | null,
    elementType?: E
  ): ClassBoundComponent<V, E>;
} & CreateClassBoundComponentMethods;

type CreateClassBoundComponentForTypeFn<
  E extends React.ElementType<any> = 'div'
> = {
  /**
   * Creates a React component that is bound to one or more `className` values
   *
   * @param   options     Options object with any combination of `className`, `displayName`,
   *                      `variants` and `elementType`
   * @returns             React component bound to `className` values
   */
  <V extends Variants>(options: Partial<Options<V, E>>): ClassBoundComponent<
    V,
    E
  >;
  /**
   * Creates a React component that is bound to one or more `className` values
   *
   * @param   className     `className` or array of `className`s to always apply
   * @param   displayName   `displayName` of the created component
   * @param   variants      Object mapping a prop name to class values applied when this prop is truthy
   * @param   elementType   Custom type of component to be wrapped. May be a string with an intrinsic attribute name or a custom component
   * @returns               React component bound to `className` values
   */
  <V extends Variants>(
    className: string | string[] | null | undefined,
    displayName?: string,
    variants?: V,
    elementType?: E
  ): ClassBoundComponent<V, E>;
  /**
   * Creates a React component that is bound to one or more `className` values
   *
   * @param   className     `className` or array of `className`s to always apply
   * @param   variants      Object mapping a prop name to class values applied when this prop is truthy
   * @param   elementType   Custom type of component to be wrapped. May be a string with an intrinsic attribute name or a custom component
   * @returns               React component bound to `className` values
   */
  <V extends Variants>(
    className: ClassValue,
    variants: V | null,
    elementType?: E
  ): ClassBoundComponent<V, E>;
} & CreateClassBoundComponentMethods;

const createClassBoundComponent = function (
  optionsOrClassName: any,
  displayNameOrVariants?: any,
  variantsOrElementType?: any,
  elementType?: any
) {
  return createClassBoundComponentFromOptions(
    argumentsToOptions(
      optionsOrClassName,
      displayNameOrVariants,
      variantsOrElementType,
      elementType
    )
  );
} as CreateClassBoundComponentFn;

/**
 * Converts the positional arguments of the overloaded function signatures to an options object
 */
function argumentsToOptions(
  optionsOrClassName: any,
  displayNameOrVariants?: any,
  variantsOrElementType?: any,
  elementType?: any
) {
  if (typeof optionsOrClassName === 'object') {
    return optionsOrClassName;
  }

  if (typeof displayNameOrVariants === 'object') {
    return {
      className: optionsOrClassName,
      displayName: undefined,
      variants: displayNameOrVariants,
      elementType: variantsOrElementType ?? elementType ?? 'div',
    };
  }

  return {
    className: optionsOrClassName,
    displayName: displayNameOrVariants,
    variants: variantsOrElementType || {},
    elementType,
  };
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

type SplitProps<P extends VariantProps<V>, V extends Variants> = {
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
  const variantProps: VariantProps<V> = {};
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

type CreateClassBoundComponentProxy = CreateClassBoundComponentFn &
  {
    [K in keyof JSX.IntrinsicElements]: CreateClassBoundComponentForTypeFn<K>;
  };

createClassBoundComponent.extend = extend;
createClassBoundComponent.withVariants = withVariants;
createClassBoundComponent.withOptions = withOptions;
createClassBoundComponent.as = as;

const wrappedInProxy = (Proxy
  ? new Proxy(createClassBoundComponent, {
      get(target, property) {
        if (Object.prototype.hasOwnProperty.call(target, property)) {
          return target[property as keyof typeof target];
        }

        return function (
          ...args: Parameters<typeof createClassBoundComponent>
        ) {
          return createClassBoundComponentFromOptions({
            ...argumentsToOptions(...args),
            elementType: property as keyof JSX.IntrinsicElements,
          });
        };
      },
    })
  : createClassBoundComponent) as CreateClassBoundComponentProxy;

export default wrappedInProxy;
export { extend, withVariants, withOptions, as };

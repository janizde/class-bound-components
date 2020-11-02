import * as React from 'react';
import unexpected from 'unexpected';
import * as TestUtils from 'react-dom/test-utils';
import { create } from 'react-test-renderer';

import classBound, {
  CBC_OPTIONS,
  extend,
  withVariants,
  withOptions,
  as,
} from './index';

const expect = unexpected.clone().use(require('unexpected-react'));
const expectTestRenderer = unexpected
  .clone()
  .use(require('unexpected-react/test-renderer'));

describe('class-bound-components', () => {
  describe('createClassBoundComponent', () => {
    it('should create a div component with the provided className and pass down props', () => {
      const FooComponent = classBound('fooClass');

      expect(
        <FooComponent>Bar</FooComponent>,
        'to exactly render as',
        <div className="fooClass">Bar</div>
      );
    });

    it('should omit the className prop when the resulting className is empty', () => {
      const FooComponent = classBound({
        variants: {
          isFoo: 'fooClass',
        },
      });

      expect(<FooComponent />, 'to exactly render as', <div />);
    });

    it('should accept an options object as only argument', () => {
      const FooComponent = classBound({
        className: 'fooClass',
        displayName: 'FooComponent',
        variants: {
          isBar: 'barClass',
        },
        elementType: 'a',
      });

      expect(
        <FooComponent isBar />,
        'to exactly render as',
        <a className="fooClass barClass" />
      );
    });

    it('should set the name of the function to an empty string', () => {
      const FooComponent = classBound('fooClass');
      expect(FooComponent.name, 'to be', undefined);
      expect(FooComponent.displayName, 'to be', undefined);
    });

    it('should set the displayName to the value provided', () => {
      const FooComponent = classBound('fooClass', 'FooComponent');

      expect(FooComponent.displayName, 'to be', 'FooComponent');
    });

    it('should pass down non-variant props', () => {
      const FooComponent = classBound('fooClass', 'FooComponent');

      expect(
        <FooComponent tabIndex={-1}>foobar</FooComponent>,
        'to exactly render as',
        <div className="fooClass" tabIndex={-1}>
          foobar
        </div>
      );
    });

    it('should append a passed-in className prop', () => {
      const FooComponent = classBound('fooClass');

      expect(
        <FooComponent className="barClass" />,
        'to exactly render as',
        <div className="fooClass barClass" />
      );
    });

    it('should accept className, variants and elementType as arguments', () => {
      const FooComponent = classBound(
        'fooClass',
        { bar: 'barClass' },
        'article'
      );

      expect(
        <FooComponent bar />,
        'to exactly render as',
        <article className="fooClass barClass" />
      );
    });

    it('should accept className, variants, null and elementType as arguments', () => {
      const FooComponent = classBound(
        'fooClass',
        { bar: 'barClass' },
        null,
        'article'
      );

      expect(
        <FooComponent bar />,
        'to exactly render as',
        <article className="fooClass barClass" />
      );
    });

    it('should render an inline functional component', () => {
      const Inner: React.FC<{ className?: string; isBaz: boolean }> = ({
        className,
        isBaz,
      }) => (
        <div>
          <span className={className}>{isBaz && 'isBaz'}</span>
        </div>
      );

      const FooComponent = classBound(
        'fooClass',
        'FooComp',
        { isBar: 'barClass' },
        Inner
      );

      const rendered = create(
        <FooComponent isBar isBaz>
          Content
        </FooComponent>
      );

      expectTestRenderer(
        rendered,
        'to have exactly rendered',
        <div>
          <span className="fooClass barClass">isBaz</span>
        </div>
      );
    });

    describe('ref', () => {
      it('should forward a ref to an intrinsic element', () => {
        const ref = React.createRef<HTMLImageElement>();
        const FooImage = classBound.img('imgClass', 'Image');

        TestUtils.renderIntoDocument(<FooImage ref={ref} />);
        expect(ref.current, 'to be an', HTMLImageElement);
      });

      it(`should not create a forwardRef component when passed a non-ref-passing function component`, () => {
        const CustomComponent: React.FC = () => <div>Hello World</div>;

        const WrappedComponent = classBound({
          elementType: CustomComponent,
        });

        expect(
          (WrappedComponent as any).$$typeof,
          'not to be',
          Symbol.for('react.forward_ref')
        );
      });

      it('should create a ref forwarding component when passed a forwardRef as elementType', () => {
        const RefForwarding = React.forwardRef<HTMLImageElement>((_, ref) => (
          <img ref={ref} />
        ));

        const WrappedComponent = classBound({
          elementType: RefForwarding,
        });

        expect(
          WrappedComponent.$$typeof,
          'to be',
          Symbol.for('react.forward_ref')
        );

        const ref = React.createRef<HTMLImageElement>();
        TestUtils.renderIntoDocument(<WrappedComponent ref={ref} />);
        expect(ref.current, 'to be an', HTMLImageElement);
      });
    });

    describe('variants', () => {
      it('should add the className of a variant when the flag is set', () => {
        const FooComponent = classBound('fooClass', 'FooComponent', {
          bar: 'barClass',
        });

        expect(
          <FooComponent bar />,
          'to exactly render as',
          <div className="fooClass barClass" />
        );
      });

      it('should concatenate multiple class names when an array is given for a variant', () => {
        const FooComponent = classBound('fooClass', 'FooComponent', {
          bar: ['barClass', 'bazClass'],
        });

        expect(
          <FooComponent bar />,
          'to exactly render as',
          <div className="fooClass barClass bazClass" />
        );
      });

      it('should not add a variant className when the prop is not set', () => {
        const FooComponent = classBound('fooClass', 'FooComponent', {
          bar: 'barClass',
        });

        expect(
          <FooComponent />,
          'to exactly render as',
          <div className="fooClass" />
        );
      });

      it('should treat null as an empty variants object', () => {
        const FooComponent = classBound('fooClass', 'FooComponent', null, 'a');

        expect(FooComponent[CBC_OPTIONS].variants, 'to equal', {});
      });
    });

    describe('elementType', () => {
      it('should render a <span /> when the elementType is set to it', () => {
        const FooComponent = classBound('fooClass', 'FooComponent', {}, 'span');

        expect(
          <FooComponent>foobar</FooComponent>,
          'to exactly render as',
          <span className="fooClass">foobar</span>
        );
      });

      it('should pass down element specific props', () => {
        const FooLink = classBound('fooLinkClass', 'FooLink', {}, 'a');
        expect(
          <FooLink href="https://example.com/">Click here</FooLink>,
          'to exactly render as',
          <a className="fooLinkClass" href="https://example.com/">
            Click here
          </a>
        );
      });

      it('should render a custom component', () => {
        const Inner: React.FC<{ className?: string }> = () => (
          <span>Inner component</span>
        );
        const FooComponent = classBound('fooClass', 'FooComponent', {}, Inner);

        expect(
          <FooComponent />,
          'to exactly render as',
          <Inner className="fooClass" />
        );
      });

      it('should pass down props of a custom component', () => {
        const Inner: React.FC<{
          className?: string;
          color: 'green' | 'blue';
        }> = ({ color }) => <span>{color}</span>;

        const FooComponent = classBound('fooClass', 'FooComponent', {}, Inner);

        expect(
          <FooComponent color="green" />,
          'to exactly render as',
          <Inner className="fooClass" color="green" />
        );
      });
    });

    describe('withVariants', () => {
      it('exports withVariants as standalone function', () => {
        expect(withVariants, 'to be', classBound.withVariants);
      });

      it('should add a variant', () => {
        const FooComponent = classBound.withVariants(classBound('fooClass'), {
          bar: 'barClass',
        });

        expect(
          <FooComponent bar />,
          'to exactly render as',
          <div className="fooClass barClass" />
        );
      });

      it('should only override variants with same name', () => {
        const FooComponent = classBound.withVariants(
          classBound('fooClass', 'FooComponent', {
            bar: 'oldBarClass',
            baz: 'bazClass',
          }),
          {
            bar: 'barClass',
          }
        );

        expect(
          <FooComponent bar baz />,
          'to exactly render as',
          <div className="fooClass barClass bazClass" />
        );
      });
    });

    describe('as', () => {
      it('exports _as_ as standalone function', () => {
        expect(as, 'to be', classBound.as);
      });

      it('should return a new component with the specified elementType', () => {
        const FooLink = classBound('fooLink', 'FooLink', {}, 'a');
        const FooButton = classBound.as(FooLink, 'button');

        expect(
          <FooButton type="button">Click here</FooButton>,
          'to exactly render as',
          <button className="fooLink" type="button">
            Click here
          </button>
        );
      });
    });

    describe('options', () => {
      it('should make the options accessible with the symbol', () => {
        const FooLink = classBound(
          'fooClass',
          'FooLink',
          { bar: 'barClass' },
          'a'
        );

        expect(FooLink[CBC_OPTIONS], 'to equal', {
          className: 'fooClass',
          displayName: 'FooLink',
          variants: { bar: 'barClass' },
          elementType: 'a',
        });
      });
    });

    describe('extend', () => {
      it('exports extend as standalone function', () => {
        expect(extend, 'to be', classBound.extend);
      });

      it('should append a className value to the existing className', () => {
        const FooComponent = classBound('fooClass');
        const Extended = classBound.extend(FooComponent, [
          'barClass',
          'bazClass',
        ]);

        expect(
          <Extended />,
          'to exactly render as',
          <div className="fooClass barClass bazClass" />
        );
      });

      it('should merge variants when the original variants are undefined', () => {
        const FooComponent = classBound.withOptions(
          classBound('fooClass'),
          (options) => ({
            ...options,
            variants: undefined,
          })
        );

        const Extended = classBound.extend(FooComponent, 'barClass', {
          isBar: 'barVariant',
        });

        expect(
          <Extended isBar />,
          'to exactly render as',
          <div className="fooClass barClass barVariant" />
        );
      });

      it('should not set the displayName when not specified', () => {
        const FooComponent = classBound('fooClass', 'FooComponent');
        const Extended = classBound.extend(FooComponent, 'barClass');
        expect(Extended.displayName, 'to be', undefined);
      });

      it('should override the displayName when specified', () => {
        const FooComponent = classBound('fooClass', 'FooComponent');
        const Extended = classBound.extend(
          FooComponent,
          'barClass',
          'ExtendedComponent'
        );
        expect(Extended.displayName, 'to be', 'ExtendedComponent');
      });

      it('should keep variants when not specified', () => {
        const FooComponent = classBound('fooClass', {
          isActive: 'fooClass--active',
        });

        const Extended = classBound.extend(FooComponent, 'barClass');

        expect(
          <Extended isActive />,
          'to exactly render as',
          <div className="fooClass barClass fooClass--active" />
        );
      });

      it('should merge new variants into the existing variants', () => {
        const FooComponent = classBound('fooClass', {
          isActive: 'fooClass--active',
        });

        const Extended = classBound.extend(FooComponent, 'barClass', {
          isFocused: 'barClass--focused',
        });

        expect(
          <Extended isActive isFocused />,
          'to exactly render as',
          <div className="fooClass barClass fooClass--active barClass--focused" />
        );
      });

      it('should combine ClassValues when variant names collide', () => {
        const FooComponent = classBound('fooClass', {
          isActive: 'fooClass--active',
        });

        const Extended = classBound.extend(FooComponent, 'barClass', {
          isActive: 'barClass--active',
        });

        expect(
          <Extended isActive />,
          'to exactly render as',
          <div className="fooClass barClass fooClass--active barClass--active" />
        );
      });
    });

    describe('withOptions', () => {
      it('exports withOptions as standalone function', () => {
        expect(withOptions, 'to be', classBound.withOptions);
      });

      it('should create a similar component when passing through props', () => {
        const FooButton = classBound.withOptions(
          classBound({
            className: 'fooClass',
            displayName: 'FooButton',
            elementType: 'button',
            variants: {
              bar: 'barClass',
            },
          }),
          (options) => options
        );

        expect(FooButton.displayName, 'to be', 'FooButton');
        expect(
          <FooButton bar />,
          'to exactly render as',
          <button className="fooClass barClass" />
        );
      });

      it('should default options that are not returned', () => {
        const FooButton = classBound.withOptions(
          classBound({
            className: 'fooClass',
            displayName: 'FooButton',
            elementType: 'button',
            variants: {
              bar: 'barClass',
            },
          }),
          () => ({})
        );

        expect(FooButton.displayName, 'to be', undefined);
        expect(<FooButton />, 'to exactly render as', <div />);
      });
    });

    describe('elementType proxy', () => {
      it('should offer member shortcuts for intrinsic elements', () => {
        const FooLink = classBound.a('fooClass', 'FooLink', {
          isBar: 'barClass',
        });

        expect(
          <FooLink isBar />,
          'to exactly render as',
          <a className="fooClass barClass" />
        );
      });

      it('should override the elementType given in the arguments', () => {
        const FooLink = classBound.a({
          className: 'fooClass',
          displayName: 'FooLink',
          elementType: 'button',
        } as any); // TypeScript wouldn't allow this anyway

        expect(<FooLink />, 'to exactly render as', <a className="fooClass" />);
      });

      it('should take the second argument as variants', () => {
        const FooComponent = classBound.h1('fooClass', { bar: 'barClass' });
        expect(
          <FooComponent bar />,
          'to exactly render as',
          <h1 className="fooClass barClass" />
        );
      });
    });
  });
});

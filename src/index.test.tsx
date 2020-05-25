import * as React from 'react';
import unexpected from 'unexpected';
import createClassBoundComponent, { CBC_OPTIONS } from './index';

const expect = unexpected.clone().use(require('unexpected-react'));

describe('class-bound-components', () => {
  describe('createClassBoundComponent', () => {
    it('should create a div component with the provided className and pass down props', () => {
      const FooComponent = createClassBoundComponent('fooClass');

      expect(
        <FooComponent>Bar</FooComponent>,
        'when rendered',
        'to have exactly rendered',
        <div className="fooClass">Bar</div>
      );
    });

    it('should omit the className prop when the resulting className is empty', () => {
      const FooComponent = createClassBoundComponent({
        variants: {
          isFoo: 'fooClass',
        },
      });

      expect(<FooComponent />, 'to exactly render as', <div />);
    });

    it('should accept an options object as only argument', () => {
      const FooComponent = createClassBoundComponent({
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
      const FooComponent = createClassBoundComponent('fooClass');
      expect(FooComponent.name, 'to be', '');
      expect(FooComponent.displayName, 'to be', undefined);
    });

    it('should set the displayName to the value provided', () => {
      const FooComponent = createClassBoundComponent(
        'fooClass',
        'FooComponent'
      );
      expect(FooComponent.displayName, 'to be', 'FooComponent');
    });

    it('should pass down non-variant props', () => {
      const FooComponent = createClassBoundComponent(
        'fooClass',
        'FooComponent'
      );
      expect(
        <FooComponent tabIndex={-1}>foobar</FooComponent>,
        'to exactly render as',
        <div className="fooClass" tabIndex={-1}>
          foobar
        </div>
      );
    });

    it('should append a passed-in className prop', () => {
      const FooComponent = createClassBoundComponent('fooClass');

      expect(
        <FooComponent className="barClass" />,
        'to exactly render as',
        <div className="fooClass barClass" />
      );
    });

    describe('variants', () => {
      it('should add the className of a variant when the flag is set', () => {
        const FooComponent = createClassBoundComponent(
          'fooClass',
          'FooComponent',
          { bar: 'barClass' }
        );

        expect(
          <FooComponent bar />,
          'to exactly render as',
          <div className="fooClass barClass" />
        );
      });

      it('should concatenate multiple class names when an array is given for a variant', () => {
        const FooComponent = createClassBoundComponent(
          'fooClass',
          'FooComponent',
          {
            bar: ['barClass', 'bazClass'],
          }
        );

        expect(
          <FooComponent bar />,
          'to exactly render as',
          <div className="fooClass barClass bazClass" />
        );
      });

      it('should not add a variant className when the prop is not set', () => {
        const FooComponent = createClassBoundComponent(
          'fooClass',
          'FooComponent',
          { bar: 'barClass' }
        );

        expect(
          <FooComponent />,
          'to exactly render as',
          <div className="fooClass" />
        );
      });
    });

    describe('elementType', () => {
      it('should render a <span /> when the elementType is set to it', () => {
        const FooComponent = createClassBoundComponent(
          'fooClass',
          'FooComponent',
          {},
          'span'
        );

        expect(
          <FooComponent>foobar</FooComponent>,
          'to exactly render as',
          <span className="fooClass">foobar</span>
        );
      });

      it('should pass down element specific props', () => {
        const FooLink = createClassBoundComponent(
          'fooLinkClass',
          'FooLink',
          {},
          'a'
        );
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
        const FooComponent = createClassBoundComponent(
          'fooClass',
          'FooComponent',
          {},
          Inner
        );

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

        const FooComponent = createClassBoundComponent(
          'fooClass',
          'FooComponent',
          {},
          Inner
        );

        expect(
          <FooComponent color="green" />,
          'to exactly render as',
          <Inner className="fooClass" color="green" />
        );
      });
    });

    describe('withVariants', () => {
      it('should add a variant', () => {
        const FooComponent = createClassBoundComponent('fooClass').withVariants(
          {
            bar: 'barClass',
          }
        );

        expect(
          <FooComponent bar />,
          'to exactly render as',
          <div className="fooClass barClass" />
        );
      });

      it('should only override variants with same name', () => {
        const FooComponent = createClassBoundComponent(
          'fooClass',
          'FooComponent',
          { bar: 'oldBarClass', baz: 'bazClass' }
        ).withVariants({ bar: 'barClass' });

        expect(
          <FooComponent bar baz />,
          'to exactly render as',
          <div className="fooClass barClass bazClass" />
        );
      });
    });

    describe('as', () => {
      it('should return a new component with the specified elementType', () => {
        const FooLink = createClassBoundComponent(
          'fooLink',
          'FooLink',
          {},
          'a'
        );
        const FooButton = FooLink.as('button');

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
        const FooLink = createClassBoundComponent(
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
      it('should append a className value to the existing className', () => {
        const FooComponent = createClassBoundComponent('fooClass');
        const Extended = FooComponent.extend(['barClass', 'bazClass']);

        expect(
          <Extended />,
          'to exactly render as',
          <div className="fooClass barClass bazClass" />
        );
      });

      it('should not set the displayName when not specified', () => {
        const FooComponent = createClassBoundComponent(
          'fooClass',
          'FooComponent'
        );
        const Extended = FooComponent.extend('barClass');
        expect(Extended.displayName, 'to be', undefined);
      });

      it('should override the displayName when specified', () => {
        const FooComponent = createClassBoundComponent(
          'fooClass',
          'FooComponent'
        );
        const Extended = FooComponent.extend('barClass', 'ExtendedComponent');
        expect(Extended.displayName, 'to be', 'ExtendedComponent');
      });

      it('should keep variants when not specified', () => {
        const FooComponent = createClassBoundComponent('fooClass', {
          isActive: 'fooClass--active',
        });

        const Extended = FooComponent.extend('barClass');

        expect(
          <Extended isActive />,
          'to exactly render as',
          <div className="fooClass barClass fooClass--active" />
        );
      });

      it('should merge new variants into the existing variants', () => {
        const FooComponent = createClassBoundComponent('fooClass', {
          isActive: 'fooClass--active',
        });

        const Extended = FooComponent.extend('barClass', {
          isFocused: 'barClass--focused',
        });

        expect(
          <Extended isActive isFocused />,
          'to exactly render as',
          <div className="fooClass barClass fooClass--active barClass--focused" />
        );
      });

      it('should combine ClassValues when variant names collide', () => {
        const FooComponent = createClassBoundComponent('fooClass', {
          isActive: 'fooClass--active',
        });

        const Extended = FooComponent.extend('barClass', {
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
      it('should create a similar component when passing through props', () => {
        const FooButton = createClassBoundComponent({
          className: 'fooClass',
          displayName: 'FooButton',
          elementType: 'button',
          variants: {
            bar: 'barClass',
          },
        }).withOptions((options) => options);

        expect(FooButton.displayName, 'to be', 'FooButton');
        expect(
          <FooButton bar />,
          'to exactly render as',
          <button className="fooClass barClass" />
        );
      });

      it('should default options that are not returned', () => {
        const FooButton = createClassBoundComponent({
          className: 'fooClass',
          displayName: 'FooButton',
          elementType: 'button',
          variants: {
            bar: 'barClass',
          },
        }).withOptions(() => ({}));

        expect(FooButton.displayName, 'to be', undefined);
        expect(<FooButton />, 'to exactly render as', <div />);
      });
    });

    describe('elementType proxy', () => {
      it('should offer member shortcuts for intrinsic elements', () => {
        const FooLink = createClassBoundComponent.a('fooClass', 'FooLink', {
          isBar: 'barClass',
        });

        expect(
          <FooLink isBar />,
          'to exactly render as',
          <a className="fooClass barClass" />
        );
      });

      it('should override the elementType given in the arguments', () => {
        const FooLink = createClassBoundComponent.a({
          className: 'fooClass',
          displayName: 'FooLink',
          elementType: 'button',
        } as any); // TypeScript wouldn't allow this anyway

        expect(<FooLink />, 'to exactly render as', <a className="fooClass" />);
      });
    });
  });
});

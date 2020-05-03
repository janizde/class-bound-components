import * as React from 'react';
import unexpected from 'unexpected';
import createClassedComponent from './index';

const expect = unexpected.clone().use(require('unexpected-react'));

describe('classed-components', () => {
  describe('createClassedComponent', () => {
    it('should create a div component with the provided className and pass down props', () => {
      const FooComponent = createClassedComponent('fooClass');

      expect(
        <FooComponent>Bar</FooComponent>,
        'when rendered',
        'to have exactly rendered',
        <div className="fooClass">Bar</div>
      );
    });

    it('should set the name of the function to an empty string', () => {
      const FooComponent = createClassedComponent('fooClass');
      expect(FooComponent.name, 'to be', '');
      expect(FooComponent.displayName, 'to be', undefined);
    });

    it('should set the displayName to the value provided', () => {
      const FooComponent = createClassedComponent('fooClass', 'FooComponent');
      expect(FooComponent.displayName, 'to be', 'FooComponent');
    });

    it('should pass down non-variant props', () => {
      const FooComponent = createClassedComponent('fooClass', 'FooComponent');
      expect(
        <FooComponent tabIndex={-1}>foobar</FooComponent>,
        'to exactly render as',
        <div className="fooClass" tabIndex={-1}>
          foobar
        </div>
      );
    });

    describe('variants', () => {
      it('should add the className of a variant when the flag is set', () => {
        const FooComponent = createClassedComponent(
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
        const FooComponent = createClassedComponent(
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
        const FooComponent = createClassedComponent(
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
        const FooComponent = createClassedComponent(
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
        const FooLink = createClassedComponent(
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
        const FooComponent = createClassedComponent(
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

        const FooComponent = createClassedComponent(
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
        const FooComponent = createClassedComponent('fooClass').withVariants({
          bar: 'barClass',
        });

        expect(
          <FooComponent bar />,
          'to exactly render as',
          <div className="fooClass barClass" />
        );
      });

      it('should only override variants with same name', () => {
        const FooComponent = createClassedComponent(
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
  });
});

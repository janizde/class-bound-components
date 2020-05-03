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
  });
});

import unexpected from 'unexpected';

const expect = unexpected.clone();

function importClassBound() {
  return import('./index').then(
    ({ default: createClassedComponent }) => createClassedComponent
  );
}

describe('class-bound-components', () => {
  describe('no Proxy', () => {
    beforeEach(() => {
      (global as any).Proxy = undefined;
    });

    it('should throw when trying to invoke a proxy member', () => {
      return expect(
        importClassBound().then((createClassBoundComponent) =>
          createClassBoundComponent.a('fooClass')
        ),
        'to be rejected with error satisfying',
        new TypeError('createClassBoundComponent.a is not a function')
      );
    });

    it('should allow to create a classed component without the proxy', () => {
      return expect(
        importClassBound().then((createClassBoundComponent) =>
          createClassBoundComponent('fooClass', 'FooComponent')
        ),
        'to be fulfilled'
      );
    });
  });
});

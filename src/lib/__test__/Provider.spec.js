import React from 'react';
import '@babel/polyfill';
import { configure, mount, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import CreateProvider from '../Provider.jsx';
import Binder from '../Binder.js';
import { bindAs, onStart } from '../serviceDecorators.js';
import { startService } from '../serviceUtils.js';

const BinderContext = React.createContext();
const ServiceContext = React.createContext();
const Provider = CreateProvider(BinderContext, ServiceContext);


configure({ adapter: new Adapter() });

describe('Provider test', () => {
  it('calls helper && start service normally && pass props to child', (done) => {
    const serviceName = 'test';
    const countValue = 1;
    @bindAs(serviceName)
    class ServiceProto {
         count = countValue;
        @onStart
         onStart() {
           return new Promise(
             (resolve) => {
               setTimeout(() => { resolve(); });
             },
           );
         }
    }

    const helperMock = jest.fn();
    const childPropsMock = jest.fn();

    const initialState = {};

    const binder = new Binder();

    const Component = ({ count, pass }) => {
      childPropsMock(count === countValue, pass);
      return (<div id="count">{count}</div>);
    };

    const ComponentWithProvider = Provider(Component, {
      helper({ serviceProto }, { pass }) {
        helperMock(binder.getService(serviceName) === serviceProto && pass);
        return {
          pass,
          count: serviceProto.count,
        };
      },
      services: [ServiceProto],
    });

    const ComponentWithBinderContext = () => (<BinderContext.Provider value={{ binder, initialState }}>
      <ComponentWithProvider pass />
    </BinderContext.Provider>);

    const wrapper = mount(<ComponentWithBinderContext />);

    setTimeout(() => {
      wrapper.update();

      setTimeout(() => {
        expect(helperMock).toHaveBeenCalledWith(true);
        expect(childPropsMock).toHaveBeenCalledWith(true, true);
        expect(binder.isBind(serviceName)).toBe(true);
        done();
      });
    });
  });

  it('start service with attributes in constructor', (done) => {
    const constructorMock = jest.fn();

    const attributeToConstructor = 3;
    const serviceName = 'test';

    @bindAs(serviceName)
    class ServiceProto {
      count = 1;
      constructor(count) {
        this.count = count;
        constructorMock(count);
      }
      @onStart
      onStart() {
        return new Promise(
          (resolve) => {
            setTimeout(() => { resolve(); });
          },
        );
      }
    }

    const initialState = {};

    const binder = new Binder();

    const Component = ({ count }) => (<div id="count">{count}</div>);

    const ComponentWithProvider = Provider(Component, {
      services: ({ count }) => [[ServiceProto, [count]]],
    });

    const ComponentWithBinderContext = () => (<BinderContext.Provider value={{ binder, initialState }}>
      <ComponentWithProvider count={attributeToConstructor} />
    </BinderContext.Provider>);

    const wrapper = mount(<ComponentWithBinderContext />);

    setTimeout(() => {
      wrapper.update();
      setTimeout(() => {
        expect(constructorMock).toHaveBeenCalledWith(attributeToConstructor);
        done();
      });
    });
  });

  it('put services to context', (done) => {
    const consumerMock = jest.fn();

    const serviceName = 'test';

    @bindAs(serviceName)
    class ServiceProto {
      @onStart
      onStart() {
        return new Promise(
          (resolve) => {
            setTimeout(() => { resolve(); });
          },
        );
      }
    }

    const initialState = {};

    const binder = new Binder();

    const Component = () => (<div id="count"><ServiceContext.Consumer>{({ serviceProto }) => {
      consumerMock(serviceProto === binder.getService(serviceName));
    }}</ServiceContext.Consumer></div>);


    const ComponentWithProvider = Provider(Component, {
      services: ({ count }) => [[ServiceProto, [count]]],
    });

    const ComponentWithBinderContext = () => (<BinderContext.Provider value={{ binder, initialState }}>
      <ComponentWithProvider />
    </BinderContext.Provider>);

    const wrapper = mount(<ComponentWithBinderContext />);

    setTimeout(() => {
      wrapper.update();
      setTimeout(() => {
        expect(consumerMock).toHaveBeenCalledWith(true);
        done();
      });
    });
  });


  it('stop only started service', (done) => {
    const serviceName = 'test';
    @bindAs(serviceName)
    class ServiceProto {
      @onStart
      onStart() {
        return new Promise(
          (resolve) => {
            setTimeout(() => { resolve(); });
          },
        );
      }
    }

    const serviceName2 = 'test2';
    @bindAs(serviceName2)
    class ServiceProto2 {
      @onStart
      onStart() {
        return new Promise(
          (resolve) => {
            setTimeout(() => { resolve(); });
          },
        );
      }
    }

    const initialState = {};
    const binder = new Binder();

    const Component = () => (<div id="count" />);

    startService(binder, initialState, { proto: ServiceProto, binderConfig: ServiceProto.binderConfig }).then(() => {
      const ComponentWithProvider = Provider(Component, {
        services: [ServiceProto, ServiceProto2],
        stop: true,
      });

      const ComponentWithBinderContext = () => (<BinderContext.Provider value={{ binder, initialState }}>
        <ComponentWithProvider color={1} />
      </BinderContext.Provider>);

      const wrapper = mount(<ComponentWithBinderContext />);

      setTimeout(() => {
        wrapper.update();

        setTimeout(() => {
          const serviceToStop = wrapper.find(ComponentWithProvider).instance().serviceToStop;
          expect(serviceToStop.length).toBe(1);
          expect(serviceToStop[0].proto === ServiceProto2).toBe(true);

          wrapper.unmount();

          expect(binder.isBind(serviceName)).toBe(true);
          expect(binder.isBind(serviceName2)).toBe(false);

          done();
        });
      });
    });
  });

  it('not stop if stop option is not defined', (done) => {
    const serviceName = 'test';
    @bindAs(serviceName)
    class ServiceProto {
      @onStart
      onStart() {
        return new Promise(
          (resolve) => {
            setTimeout(() => { resolve(); });
          },
        );
      }
    }

    const initialState = {};
    const binder = new Binder();
    const Component = () => (<div id="count" />);

    const ComponentWithProvider = Provider(Component, {
      services: [ServiceProto],
    });

    const ComponentWithBinderContext = () => (<BinderContext.Provider value={{ binder, initialState }}>
      <ComponentWithProvider color={1} />
    </BinderContext.Provider>);

    const wrapper = mount(<ComponentWithBinderContext />);

    setTimeout(() => {
      wrapper.update();

      setTimeout(() => {
        wrapper.unmount();
        expect(binder.isBind(serviceName)).toBe(true);
        done();
      });
    });
  });

  it('stub test', (done) => {
    const serviceName = 'test';
    @bindAs(serviceName)
    class ServiceProto {
      @onStart
      onStart() {
        return new Promise(
          (resolve) => {
            setTimeout(() => { resolve(); });
          },
        );
      }
    }

    const initialState = {};
    const binder = new Binder();
    const Component = () => (<div id="count" />);

    const MyStub = () => (<div id="stub">Loading...</div>);

    const ComponentWithProvider = Provider(Component, {
      services: [ServiceProto],
      stub: MyStub,
    });

    const ComponentWithBinderContext = () => (<BinderContext.Provider value={{ binder, initialState }}>
      <ComponentWithProvider color={1} />
    </BinderContext.Provider>);

    const wrapper = mount(<ComponentWithBinderContext />);

    expect(wrapper.contains(<div id="stub">Loading...</div>)).toBe(true);

    setTimeout(() => {
      wrapper.update();
      setTimeout(() => {
        wrapper.update();
        expect(wrapper.contains(<div id="stub">Loading...</div>)).toBe(false);
        done();
      });
    });
  });


  it('in helper do not return an object shows stub', (done) => {
    const serviceName = 'test';
    @bindAs(serviceName)
    class ServiceProto {
      @onStart
      onStart() {
        return true;
      }
    }

    const initialState = {};
    const binder = new Binder();
    const Component = () => (<div id="count" />);

    const MyStub = () => (<div id="stub">Loading...</div>);

    const ComponentWithProvider = Provider(Component, {
      helper() {
        return undefined;
      },
      services: [ServiceProto],
      stub: MyStub,
    });

    const ComponentWithBinderContext = () => (<BinderContext.Provider value={{ binder, initialState }}>
      <ComponentWithProvider color={1} />
    </BinderContext.Provider>);

    const wrapper = mount(<ComponentWithBinderContext />);

    expect(wrapper.contains(<div id="stub">Loading...</div>)).toBe(true);

    setTimeout(() => {
      wrapper.update();
      setTimeout(() => {
        wrapper.update();
        expect(wrapper.contains(<div id="stub">Loading...</div>)).toBe(true);
        done();
      });
    });
  });


  it('wrong attributes: no Component passed', (done) => {
    const ComponentWithProvider = Provider();
    expect(() => { shallow(<ComponentWithProvider />); }).toThrowError();
    done();
  });

  it('wrong attributes: wrong services', (done) => {
    const serviceName = 'test';
    @bindAs(serviceName)
    class ServiceProto {
      @onStart
      onStart() {
        return true;
      }
    }

    const ComponentWithProvider = Provider(() => (<div />), {
      services: [2],
    });
    expect(() => { shallow(<ComponentWithProvider />); }).toThrowError();

    const ComponentWithProvider2 = Provider(() => (<div />), {
      services: [[ServiceProto]],
    });
    expect(() => { shallow(<ComponentWithProvider2 />); }).toThrowError();

    const ComponentWithProvider3 = Provider(() => (<div />), {
      services: [ServiceProto, {}],
    });
    expect(() => { shallow(<ComponentWithProvider3 />); }).toThrowError();

    done();
  });

  it('pass props through provider without helper', () => {
    const Component = () => (<div id="count" />);
    const ComponentWithProvider = Provider(Component);
    const wrapper = mount(<ComponentWithProvider test={1} />);
    expect(wrapper.find(Component).props().test).toBe(1);
  });
});

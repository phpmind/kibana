import sinon from 'sinon';
import expect from 'expect.js';
import ngMock from 'ng_mock';
import 'ui/storage';

let storage;
let $window;
let payload = { first: 'john', last: 'smith' };


function init() {
  ngMock.module('kibana/storage', function ($provide) {
    // mock $window.localStorage for storage
    $provide.value('$window', {
      localStorage: {
        getItem: sinon.stub(),
        setItem: sinon.spy(),
        removeItem: sinon.spy(),
        clear: sinon.spy()
      }
    });
  });

  ngMock.inject(function ($injector) {
    storage = $injector.get('localStorage');
    $window = $injector.get('$window');
  });
}

describe('StorageService', function () {
  beforeEach(function () {
    init();
  });

  describe('expected API', function () {
    it('should have expected methods', function () {
      expect(storage.get).to.be.a('function');
      expect(storage.set).to.be.a('function');
      expect(storage.remove).to.be.a('function');
      expect(storage.clear).to.be.a('function');
    });
  });

  describe('call behavior', function () {
    it('should call getItem on the store', function () {
      storage.get('name');

      expect($window.localStorage.getItem.callCount).to.equal(1);
    });

    it('should call setItem on the store', function () {
      storage.set('name', 'john smith');

      expect($window.localStorage.setItem.callCount).to.equal(1);
    });

    it('should call removeItem on the store', function () {
      storage.remove('name');

      expect($window.localStorage.removeItem.callCount).to.equal(1);
    });

    it('should call clear on the store', function () {
      storage.clear();

      expect($window.localStorage.clear.callCount).to.equal(1);
    });
  });

  describe('json data', function () {
    it('should parse JSON when reading from the store', function () {
      let getItem = $window.localStorage.getItem;
      getItem.returns(JSON.stringify(payload));

      let data = storage.get('name');
      expect(data).to.eql(payload);
    });

    it('should write JSON string to the store', function () {
      let setItem = $window.localStorage.setItem;
      let key = 'name';
      let value = payload;

      storage.set(key, value);

      let call = setItem.getCall(0);
      expect(call.args[0]).to.equal(key);
      expect(call.args[1]).to.equal(JSON.stringify(value));
    });
  });

  describe('expected responses', function () {
    it('should return null when not exists', function () {
      let data = storage.get('notexists');
      expect(data).to.equal(null);
    });

    it('should return null when invalid JSON', function () {
      let getItem = $window.localStorage.getItem;
      getItem.returns('not: json');

      let data = storage.get('name');
      expect(data).to.equal(null);
    });
  });
});

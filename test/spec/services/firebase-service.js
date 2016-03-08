'use strict';

describe('Service: FirebaseService', function () {

  // load the service's module
  beforeEach(module('CareChat'));

  // instantiate service
  var FirebaseService;
  beforeEach(inject(function (_FirebaseService_) {
    FirebaseService = _FirebaseService_;
  }));

  it('should do something', function () {
    expect(!!FirebaseService).toBe(true);
  });

});

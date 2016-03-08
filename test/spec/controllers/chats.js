'use strict';

describe('Controller: ChatsCtrl', function () {

  // load the controller's module
  beforeEach(module('CareChat'));

  var ChatsCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ChatsCtrl = $controller('ChatsCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(ChatsCtrl.awesomeThings.length).toBe(3);
  });
});

'use strict';

describe('Directive: autofocus', function () {

  // load the directive's module
  beforeEach(module('CareChat'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<autofocus></autofocus>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the autofocus directive');
  }));
});

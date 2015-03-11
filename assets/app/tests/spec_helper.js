// Simulate the global BUNDLE object.
BUNDLE = {};
BUNDLE.packagePath = '/';

getThenSuccess = function(response) {
  return {
    then: function(cb) {
      cb(response);
    }
  };
};

getThenFailure = function(response) {
  return {
    then: function(cb1, cb2) {
      cb2(response);
    }
  };
};

getThenNoop = function() {
  return {
    then: function() {

    }
  };
};

getFakeFilters = function() {
  return [ {name:'test1'}, {name:'test2', default: true} ];
};

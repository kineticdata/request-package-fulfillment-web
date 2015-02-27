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

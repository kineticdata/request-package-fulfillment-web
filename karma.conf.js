
module.exports = function ( karma ) {
  process.env.PHANTOMJS_BIN = 'node_modules/karma-phantomjs-launcher/node_modules/.bin/phantomjs';

  karma.set({
    /**
     * From where to look for files, starting with the location of this file.
     */
    basePath: './',

    /**
     * Filled by the task `gulp karma-conf`
     */
    files: [
        // Thirdparty JS
        'assets/bower_components/angular/angular.js',
        'assets/bower_components/angular-route/angular-route.js',
        'assets/bower_components/angular-cookie/angular-cookie.js',
        'assets/bower_components/angular-cookies/angular-cookies.js',
        'assets/bower_components/angular-flash/dist/angular-flash.js',
        'assets/bower_components/moment/moment.js',
        'assets/bower_components/angular-ui-router/release/angular-ui-router.js',
        'assets/bower_components/angular-ui-bootstrap-bower/ui-bootstrap.js',
        'assets/bower_components/angular-ui-bootstrap-bower/ui-bootstrap-tpls.js',
        'assets/bower_components/jquery/dist/jquery.js',
        'assets/bower_components/lodash/lodash.js',
        'assets/bower_components/angular-moment/angular-moment.js',
        'assets/bower_components/bootstrap/dist/js/bootstrap.js',
        'assets/bower_components/angular-mocks/angular-mocks.js',

        // Application JS
        'assets/app/shared/directives/*.js',
        'assets/app/shared/models/*.js',
        'assets/app/shared/services/*.js',
        'assets/app/main/*.js',
        'assets/app/workorder/*.js',
        'assets/app/app.js',

        // Specs.
        'assets/app/tests/spec_helper.js',
        'assets/app/tests/unit/*.spec.js'
      ],

    frameworks: [ 'mocha', 'chai', 'sinon-chai', 'chai-as-promised' ],
    plugins: [ 'karma-mocha', 'karma-chai-plugins', 'karma-phantomjs-launcher', 'karma-notify-reporter' ],

    /**
     * How to report, by default.
     */
    reporters: ['progress', 'notify'],

    /**
     * Show colors in output?
     */
    colors: true,

    /**
     * On which port should the browser connect, on which port is the test runner
     * operating, and what is the URL path for the browser to use.
     */
    port: 9099,
    runnerPort: 9100,
    urlRoot: '/',
    autoWatch: true,

    /**
     * The list of browsers to launch to test on. This includes only "Firefox" by
     * default, but other browser names include:
     * Chrome, ChromeCanary, Firefox, Opera, Safari, PhantomJS
     *
     * Note that you can also use the executable name of the browser, like "chromium"
     * or "firefox", but that these vary based on your operating system.
     *
     * You may also leave this blank and manually navigate your browser to
     * http://localhost:9099/ when you're running tests. The window/tab can be left
     * open and the tests will automatically occur there during the build. This has
     * the aesthetic advantage of not launching a browser every time you save.
     */
    browsers: [
      'PhantomJS'
    ]
  });
};


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
        'resources/bower_components/angular/angular.js',
        'resources/bower_components/angular-route/angular-route.js',
        'resources/bower_components/angular-cookie/angular-cookie.js',
        'resources/bower_components/angular-cookies/angular-cookies.js',
        'resources/bower_components/angular-flash/dist/angular-flash.js',
        'resources/bower_components/moment/moment.js',
        'resources/bower_components/angular-ui-router/release/angular-ui-router.js',
        'resources/bower_components/angular-ui-bootstrap-bower/ui-bootstrap.js',
        'resources/bower_components/angular-ui-bootstrap-bower/ui-bootstrap-tpls.js',
        'resources/bower_components/jquery/dist/jquery.js',
        'resources/bower_components/lodash/lodash.js',
        'resources/bower_components/angular-moment/angular-moment.js',
        'resources/bower_components/bootstrap/dist/js/bootstrap.js',
        'resources/bower_components/angular-mocks/angular-mocks.js',

        // Application JS
        'resources/js/services/*.service.js',
        'resources/js/services/*.factory.js',
        'resources/js/models/*.model.js',
        'resources/js/directives/*.directive.js',
        'resources/js/controllers/*.controller.js',
        'resources/js/app.js',

        // Specs.
        'resources/js/specs/spechelper.js',
        'resources/js/specs/*.spec.js'
      ],

    frameworks: [ 'mocha', 'chai', 'chai-as-promised', 'sinon' ],
    plugins: [ 'karma-mocha', 'karma-chai-plugins', 'karma-sinon', 'karma-phantomjs-launcher', 'karma-notify-reporter' ],

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

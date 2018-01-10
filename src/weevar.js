;(function (window, document) {

    Weevar.initialized = false;

    /**
     * Load CSS file onto the page
     * @param source
     * @param element
     * @param head
     */
    Weevar.addHeaderElement = function (source, element, head) {
        head = window.document.head;
        element = window.document.createElement('link');

        element.rel = 'stylesheet';
        element.type = 'text/css';
        element.id = 'weevar-css';
        element.href = source;

        head.appendChild(element);
    }

    // Directly load CSS file onto the page
    Weevar.addHeaderElement(Weevar.site.data.cssBundleUrl);

    // Site script to run every time regardless of conditions, as soon as possible.
    eval(Weevar.site.data.javascript);

    /**
     * Weevar Settings
     * queryParams: Query params variables used to force Weevar conditions
     * bucket: Each visitor is given a random integer between 0-100
     * cookie: Local storage settings
     * @type {{queryParams: {experiment: string, variation: string}, bucket: {key: string}, cookie: {key: string, expiration}}}
     */
    Weevar.config = {
        queryParams: {
            experiment: 'wee_x', // Force experiment
            variation: 'wee_var' // Force variation
        },
        localStorage: {
            location: 'weevar_location',
            bucket: 'weevar_bucket'
        },
        integrations: {
            googleAnalytics: 'ga',
            hotjar: 'hj'
        },
        cookie: {
            // Name of the experiment cookie.
            // The experiment ID is appended, with the variation ID as the value
            key: 'weevar_experiment_',

            // Set up the expiration for the cookie
            // This is supposed to be very long
            expiration: new Date().setTime(new Date().getTime() + 18921600000)
        }
    };

    /**
     * Client environment
     * url: current URL
     * viewport: information about the viewport
     * @type {{url: (*), viewport: {width: Number, height: Number, cookies: string, userAgent: string}}}
     */
    Weevar.env = {
        // Current URL
        url: window.location,
        // Viewport information
        viewport: {
            width: window.innerWidth,
            height: window.innerHeight,
            cookies: document.cookie,
            userAgent: navigator.userAgent
        },

        // Visitor information (some will be overwritten at the end of the script)
        visitor: {
            // If the user visit the page with forced query params
            forcedQueryParams: null,

            // Bucket the user was placed in
            bucket: null,

            // Do not track setting
            doNotTrack: null,

            // Could be used as a targeting parameter
            variations: []
        }
    }

    /**
     * Timestamps of starting date and expiration
     * @returns {{time: number, expires: string}}
     */
    Weevar.calculateTrackingDates = function () {
        var d = new Date();
        var time = d.getTime();

        d.setTime(d.getTime() + (18921600000));

        var expires = d.toUTCString();

        return {
            time: time,
            expires: expires
        };
    }

    /**
     * Set tracking start time & expiration
     * @type {{time: number, expires: string}}
     */
    Weevar.trackingStart = Weevar.calculateTrackingDates();

    /**
     * Generate a unique ID for the client
     * @deprecated
     * @returns {string}
     */
    Weevar.generateGuid = function () {
        return 'W-' + Weevar.trackingStart.time + '-' + parseInt(Math.floor(Math.random() * 90000) + 10000);
    };

    /**
     * Store a cookie in the client.
     * Useful for use within variation code when wanting to set information in user storage.
     * @param key
     * @param value
     * @TODO Untestable | Switch to local storage
     */
    Weevar.store = function (key, value) {
        document.cookie = key + ' = ' + value + '; domain = ' + Weevar.env.url.hostname + '; path = /; expires = ' + Weevar.trackingStart.expires;
    }

    /**
     * Read a cookie and return its value.
     * If it's a number value, returns as a number
     * @param key
     * @returns {*}
     * @TODO Untestable | Switch to local storage
     */
    Weevar.readStorage = function (key) {
        var items = Weevar.env.viewport.cookies.split('; ');
        for (var i = 0; i < items.length; i++) {
            if (items[i].search(key) > -1) {
                var result = items[i].split('=')[1];
                if (!isNaN(result)) {
                    return Number(result);
                }
                return result;
            }
        }
        return false;
    }

    /**
     * Geolocation API
     * Uses a 3rd party geolocator to get users location from IP address.
     * Can use this in variation code when needed.
     * Ideally set a 30min expiry date on the location.
     * Should probably return location right away if it's already set.
     * @TODO Make optional (as a plugin)
     */
    Weevar.guessLocation = function () {
        if (!localStorage.getItem(Weevar.config.localStorage.location) && !document.getElementById(Weevar.config.localStorage.location)) {
            console.info('Search location');
            var head = window.document.head;
            var element = window.document.createElement('script');
            element.id = Weevar.config.localStorage.location;
            element.src = 'https://pro.ip-api.com/json?callback=Weevar.setLocation';
            head.appendChild(element);
        }
    }

    /**
     * Works with guessLocation to set user location in local storage
     * @param locationJSON
     */
    Weevar.setLocation = function (locationJSON) {
        localStorage.setItem(Weevar.config.localStorage.location, JSON.stringify(locationJSON));
    }

    /**
     * Used to determine if viewport height/width are correct and if user is in correct bucket
     * if maximum is < 0, return true automatically
     * @param x
     * @param min
     * @param max
     * @returns {boolean}
     */
    Weevar.isBetween = function (x, min, max) {
        if (max < 0) {
            return true;
        }

        return x >= min && x <= max;
    }

    /**
     * Can get any query parameter.
     * Good to use in variation code
     * @param paramName
     * @returns {*}
     */
    Weevar.getQueryParam = function (paramName) {
        var params = Weevar.env.url.search.substr(1).split('&');
        for (var i = 0; i < params.length; i++) {
            if (params[i].split('=')[0] === paramName) {
                var result = params[i].split('=')[1];
                if (!isNaN(result)) {
                    return Number(result);
                }
                return result;
            }
        }

        return null;
    }

    /**
     * Checks for Weevar-specific force parameters and returns them
     * @returns {{experiment: *, variation: *}}
     */
    Weevar.checkForcedQueryParams = function () {
        return {
            experiment: Weevar.getQueryParam(Weevar.config.queryParams.experiment),
            variation: Weevar.getQueryParam(Weevar.config.queryParams.variation)
        };
    }

    /**
     * Either gets existing traffic bucket or sets it if doesn't exist, returns the result
     * @returns {*}
     * @TODO Untestable || Switch to local storage
     */
    Weevar.getTrafficBucket = function () {
        var result = Weevar.readStorage(Weevar.config.localStorage.bucket);

        if (result == null || result === false) {
            result = Math.floor((Math.random() * 100));
            Weevar.store(Weevar.config.localStorage.bucket, result);
        }

        return result;
    }

    /**
     * Return a random number with 2 decimal points used to
     * place the visitor into a variation.
     * @returns {Number}
     */
    Weevar.getExperimentBucket = function () {
        return parseFloat((Math.random() * 100).toFixed(2));
    }

    /**
     * Checks if the visitor user agent matches the experiment's setting.
     * @param experiment
     * @returns {boolean}
     */
    Weevar.qualifyUserAgent = function (experiment) {
        // If user agent isn't specified on the site config, bypass
        if (!experiment.userAgent) {
            return true;
        }

        // Otherwise, check user agent match
        if (Weevar.env.viewport.userAgent.match(experiment.userAgent)) {
            return true;
        }

        return false;
    }

    /**
     * Is the visitor on a targeted page and is there any urls to exclude.
     * - Excluded URL have the priority
     * - "*" can be used as a wildcard
     * - Regex allowed
     * @param experiment
     * @returns {boolean}
     */
    Weevar.qualifyUrl = function (experiment) {
        if (experiment.excludeUrls != null && experiment.excludeUrls.length > 0) {
            for (var i in experiment.excludeUrls) {
                if (Weevar.env.url.href.match(experiment.excludeUrls[i].toString())) {
                    return false;
                }
            }
        }

        if (experiment.includeUrls != null && experiment.includeUrls.length > 0) {
            if (experiment.includeUrls[0] === '*' || experiment.includeUrls[0] === '\*') {
                return true;
            }

            for (var i in experiment.includeUrls) {
                if (Weevar.env.url.href.match(experiment.includeUrls[i].toString())) {
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * Checks width and height vs experiment Weevar.config. returns bool
     * @param experiment
     * @returns {boolean}
     */
    Weevar.qualifyViewport = function (experiment) {
        if (experiment.viewport.height != null && experiment.viewport.height.min != null && experiment.viewport.height.max != null) {
            return (
                Weevar.isBetween(Weevar.env.viewport.width, experiment.viewport.width.min, experiment.viewport.width.max)
                && Weevar.isBetween(Weevar.env.viewport.height, experiment.viewport.height.min, experiment.viewport.height.max)
            )
        }

        return Weevar.isBetween(Weevar.env.viewport.width, experiment.viewport.width.min, experiment.viewport.width.max);
    }

    /**
     * Checks the experiment against the force query params (if there is any).
     * @param experiment
     * @returns {boolean}
     */
    Weevar.qualifyForcedQueryParams = function (experiment) {
        if (Weevar.env.visitor.forcedQueryParams != null && Weevar.env.visitor.forcedQueryParams.experiment != null && Weevar.env.visitor.forcedQueryParams.variation != null) {
            return experiment.id === Weevar.env.visitor.forcedQueryParams.experiment;
        }
    }

    /**
     * Checks if visitor is in the traffic range specified by experiment config.
     * @param experiment
     * @returns {boolean}
     */
    Weevar.qualifyTrafficRange = function (experiment) {
        return Weevar.isBetween(Weevar.env.visitor.bucket, experiment.trafficPercentage[0], experiment.trafficPercentage[1])
    }

    /**
     * Checks the experiment status to make sure it's active.
     * @param experiment
     * @returns {boolean}
     */
    Weevar.qualifyStatus = function (experiment, validStatuses) {
        var validStatuses = validStatuses || ['active', 'live', 'running'];

        return validStatuses.indexOf(experiment.status) >= 0;
    }

    /**
     * Checks to see if user is already part of this experiment.
     * If so, it'll return the variation slot.
     * We return the variation slot, because it's what initializeExperiment expects (and that works with force parameters as well)
     * @param experiment
     * @returns {*}
     * @TODO Untestable || Switch to local storage
     */
    Weevar.qualifyStorage = function (experiment) {
        var storageValue = Weevar.readStorage(Weevar.config.cookie.key + experiment.id);

        if (storageValue !== false) {
            for (var i = 0; i < experiment.variations.data.length; i++) {
                if (experiment.variations.data[i].id == storageValue) {
                    return i;
                }
            }
        }

        return false;
    }

    /**
     * Checks to make sure the experiment isn't already running so it doesn't execute twice.
     * The running property is set to true after the experiment code is evaluated.
     * If variation is provided, check if variation and experiment code is running
     * @param experiment
     * @param variation
     * @returns {boolean}
     */
    Weevar.alreadyRunning = function (experiment, variation) {
        if (variation != null) {
            return (experiment.running === true && variation.running === true);
        }

        return (experiment.running === true);
    }

    /**
     * Checks if the user has an experiment cookie or local storage
     * @param experiment
     * @returns {*}
     * @TODO Untestable | Switch to local storage
     */
    Weevar.hasExperimentInStorage = function (experiment) {
        return Weevar.readStorage(Weevar.config.cookie.key + experiment.id);
    }

    /**
     * Integrate Google Analytics integration if activated
     * @param experiment
     * @param variation
     * @TODO Write test
     */
    Weevar.integrateGoogleAnalytics = function (experiment, variation) {
        if (Weevar.site.data.integrations.googleAnalytics && experiment.integrations && experiment.integrations.googleAnalytics && window.ga) {
            var gaTrackerId = Weevar.site.data.integrations.googleAnalytics.tracker_id || window.ga.getAll()[0].b.data.values[':trackingId'];
            var gaTrackerName = Weevar.site.data.integrations.googleAnalytics.tracker_name || window.ga.getAll()[0].b.data.values[':name'];
            var customDimensionSlot = experiment.integrations.googleAnalytics.custom_dimension_slot || Weevar.site.data.integrations.googleAnalytics.custom_dimension_slot;

            if (Weevar.config.debug) {
                console.groupCollapsed('[INTEGRATION] Loading Google Analytics (Experiment: ' + experiment.name + ' / Variation: ' + variation.name + ')');
                console.info('Tracker ID: ' + gaTrackerId);
                console.info('Tracker Name: ' + gaTrackerName);
                console.info('Dimension Slot: ' + customDimensionSlot);
                console.groupEnd();
            }

            if (gaTrackerId && gaTrackerName && customDimensionSlot) {
                if (Weevar.site.data.integrations.googleAnalytics.tracker_name &&
                    Weevar.site.data.integrations.googleAnalytics.tracker_created !== true) {
                    window.ga("create", gaTrackerId, {name: gaTrackerName})
                    Weevar.site.data.integrations.googleAnalytics.tracker_created = true;
                }


                var customDimensionValue = experiment.name + '_' + variation.name;
                window.ga(gaTrackerName + '.set', 'dimension' + customDimensionSlot, customDimensionValue);
                window.ga(gaTrackerName + '.send', 'event', 'Experiments',
                    experiment.name, variation.name, {'nonInteraction': 1}
                );
            }
        }
    }

    /**
     * Integrate Hotjar if activated
     * @param experiment
     * @param variation
     * @TODO Write test
     */
    Weevar.integrateHotjar = function (experiment, variation) {
        if (Weevar.site.data.integrations.hotjar) {
            if (Weevar.config.debug) {
                console.groupCollapsed('[INTEGRATION] Loading Hotjar (Experiment: ' + experiment.name + ' / Variation: ' + variation.name + ')');
                console.groupEnd();
            }
            if (!window.hj) {
                window.hj = window.hj || function () {
                        (hj.q = hj.q || []).push(arguments)
                    };
            }
            if (Weevar.site.data.integrations.hotjar.tag == true) {
                hj('tagRecording', [experiment.name + '_' + variation.name]);
            }
            if (Weevar.site.data.integrations.hotjar.trigger == true) {
                hj('trigger', experiment.name);
            }
        }
    }

    /**
     * Set a different name for the Google Analytics object if needed
     * @param objectName
     */
    Weevar.setGoogleAnalyticsObjectName = function (objectName) {
        Weevar.config.integrations.googleAnalytics = objectName;
    }

    /**
     * Set a different name for the Hotjar object if needed
     * @param objectName
     */
    Weevar.setHotjarObjectName = function (objectName) {
        Weevar.config.integrations.hotjar = objectName;
    }

    /**
     * Tracks the experiment in GA and/or in HotJar if in config.
     * Uses a setTimeout to wait for GA object,
     * if a tracker name has been given, will create that tracker,
     * otherwise use the existing one, then will set a custom dimension.
     * Might need visitor to change the GA global object
     * @param experiment
     * @param variation
     * @TODO Write test
     */
    Weevar.qualifyIntegrations = function (experiment, variation) {
        if (Weevar.qualifyStatus(experiment)) {
            setTimeout(function () {
                Weevar.integrateGoogleAnalytics(experiment, variation);
                Weevar.integrateHotjar(experiment, variation);
            }, 1500);
        }
    }

    /**
     * Query selector
     * @param selectorType
     * @param selectorName
     * @returns {string}
     * @TODO Write test
     * @TODO Find a better solution
     */
    Weevar.getElementQuery = function (selectorType, selectorName) {
        if (selectorType === 'class') {
            return 'document.getElementsByClassName(\'' + selectorName + '\')';
        }
        if (selectorType === 'tag') {
            return 'document.getElementsByTagName(\'' + selectorName + '\')';
        }
        if (selectorType === 'id') {
            return 'document.getElementById(\'' + selectorName + '\')';
        }
        if (selectorType === 'query') {
            return 'document.querySelectorAll(\'' + selectorName + '\')';
        }
    }

    /**
     * Check if element exists in the DOM
     * @param element
     * @returns {boolean}
     */
    Weevar.checkElement = function (element) {
        if (element) {
            if (element.length > 0 || element.innerHTML != undefined) {
                return true;
            }
        }

        return false;
    }

    /**
     * Get the CSS selector that will be used to hide the element.
     * @param selectorType
     * @param selectorName
     * @TODO Write test
     * @TODO Find a better solution
     */
    Weevar.getSelector = function (selectorType, selectorName) {
        var selector = '';
        if (selectorType === 'class') {
            selector = '.';
        }
        if (selectorType === 'tag') {
            selector = '';
        }
        if (selectorType === 'id') {
            selector = '#';
        }
        if (selectorType === 'query') {
            selector = selectorName;
        }
        return selector + selectorName;
    }

    /**
     * Wait for an element to be loaded in the DOM and execute given function.
     * @param selectorType
     * @param selectorName
     * @param action
     * @param hideElement
     * @TODO Write test
     */
    Weevar.waitFor = function (selectorType, selectorName, action, hideElement) {
        if (hideElement) {
            var selector = Weevar.getSelector(selectorType, selectorName);
            var hideElementStyle = document.createElement('style');
            hideElementStyle.innerHTML = selector + '{visibility:hidden;}';
            document.getElementsByTagName('head')[0].append(hideElementStyle);
        }
        var element, waiter, elementPresent;
        var elementQuery = Weevar.getElementQuery(selectorType, selectorName);
        waiter = setInterval(function () {
            element = eval(elementQuery);
            elementPresent = Weevar.checkElement(element);
            if (elementPresent) {
                clearInterval(waiter);
                action(element);
                if (hideElementStyle) {
                    hideElementStyle.parentNode.removeChild(hideElementStyle);
                }
            }
        }, 50);
        setTimeout(function () {
            if (hideElementStyle && hideElementStyle.parentNode) {
                hideElementStyle.parentNode.removeChild(hideElementStyle);
            }
        }, 2000)
        setTimeout(function () {
            clearInterval(waiter);
        }, 30000);
    }

    /**
     * Clone an element, remove it, and return the clone.
     * @param element
     * @TODO Write test
     */
    Weevar.hideAndClone = function (element) {
        var clone = element.cloneNode(true);
        element.parentNode.insertBefore(clone, element)
        element.parentNode.removeChild(element);
        return clone;
    }

    /**
     * Check if the user is already in a variation
     * The goal is to try to get the user back into the variation they were in before as much as possible.
     * If that variation is paused or no longer exists, we should NOT add them to a new variation
     * @param experiment
     * @param variation
     */
    Weevar.checkIfUserIsAlreadyInVariation = function (experiment, variation) {
        if (variation !== false && variation !== undefined) {
            // Sets variation to the one the user is in
            if (experiment.variations.data[variation] != null) {
                variation = experiment.variations.data[variation];

                return true;
            }

            // If that variation doesn't exist and if the user has an experiment cookie
            if (!variation && Weevar.hasExperimentInStorage(experiment)) {
                // Check the cookie then re-assign the variation
                variation = Weevar.qualifyStorage(experiment);

                return true;
            }
        }

        return false;
    }

    /**
     * Check if the experiment has variations
     * @param experiment
     * @returns {boolean}
     */
    Weevar.checkIfExperimentHasVariations = function (experiment) {
        return experiment.variations != null && experiment.variations.data != null && experiment.variations.data.length > 0;
    }

    /**
     * Actually run the experiment for the visitor
     * @param experiment
     * @param variation
     */
    Weevar.runExperiment = function (experiment, variation) {
        if (Weevar.alreadyRunning(experiment)) {
            return false;
        }

        if (Weevar.config.debug) {
            console.groupCollapsed('[LOADING] Experiment ' + experiment.name + ' / ' + variation.name + '...');
        }

        // Experiment level code always goes first
        eval(experiment.javascript);
        eval(variation.javascript);

        // Set to prevent code from running twice
        experiment.running = true;
        variation.running = true;

        // Sets the experiment + variation cookie
        Weevar.store(Weevar.config.cookie.key + experiment.id, variation.id);

        // Add the variation to the visitor env for tracking purposes
        Weevar.env.visitor.variations.push(variation.id);

        // Check if the experiment is set to track immediately
        // qualify for integrations (Google Analytics, Hotjar, etc...)
        if (experiment.trackOnLoad == 1) {
            if (Weevar.config.debug) {
                console.log('Activate tracking on load...');
            }
            Weevar.qualifyIntegrations(experiment, variation);
        }

        if (Weevar.config.debug) {
            console.info('Loaded.');
            console.groupEnd();
        }

        return true;
    }

    /**
     * Initialize the experiment.
     * A variation can be specified, otherwise one will be generated.
     * @param experiment
     * @param variation
     * @TODO Partly Untestable | Switch to local storage
     */
    Weevar.initializeExperiment = function (experiment, variation) {
        variation = variation || false;

        if (!Weevar.checkIfExperimentHasVariations(experiment)) {
            return false;
        }

        if (!Weevar.checkIfUserIsAlreadyInVariation(experiment, variation)) {
            // Get experiment level bucket (different for each experiment and set on the fly)
            var experimentBucket = Weevar.getExperimentBucket(); // 0.00-100.00

            for (var i = 0; i < experiment.variations.data.length; i++) {
                // Find the variation that has the right traffic range
                if (Weevar.isBetween(experimentBucket, experiment.variations.data[i].trafficPercentage[0], experiment.variations.data[i].trafficPercentage[1])) {
                    variation = i;
                }
            }
        }

        // Fetch variation
        variation = experiment.variations.data[variation];
        Weevar.runExperiment(experiment, variation);

        return true;
    }

    /**
     * Initializes Weevar
     */
    Weevar.initialize = function () {

        Weevar.config.debug = Weevar.site.data.debug || false;

        if (Weevar.config.debug) {
            console.groupCollapsed('[INIT] Initializing Weevar');
            console.log(Weevar.site.data.experiments.data.length + ' experiments available.')
            console.groupEnd();
        }

        var experimentList = Weevar.site.data.experiments.data.sort(function (experiment, previous) {
            return experiment.status < previous.status;
        });

        for (var i = 0; i < experimentList.length; i++) {
            var experiment = experimentList[i];
            var variation = false;

            // In the presence of forced query params, use them and skip
            if (Weevar.qualifyForcedQueryParams(experiment)) {
                // Only force if visitor qualifies for url, viewport and user agent
                if (Weevar.qualifyUrl(experiment) && Weevar.qualifyViewport(experiment) && Weevar.qualifyUserAgent(experiment)) {
                    if (Weevar.config.debug) {
                        Weevar.debugQualification(experiment, true, true);
                    }
                    variation = experiment.variations.data[Weevar.env.visitor.forcedQueryParams.variation];
                    Weevar.runExperiment(experiment, variation);
                } else {
                    if (Weevar.config.debug) {
                        Weevar.debugQualification(experiment, false, true, true);
                    }
                }

                continue;
            }

            // Run if the visitor's URL, viewport & user agent are qualified
            if (Weevar.qualifyUrl(experiment) && Weevar.qualifyViewport(experiment) && Weevar.qualifyUserAgent(experiment)) {
                // If the visitor qualifies in the traffic range and the experiment is active
                if (Weevar.qualifyTrafficRange(experiment) && Weevar.qualifyStatus(experiment)) {
                    if (Weevar.config.debug) {
                        Weevar.debugQualification(experiment, true);
                    }

                    variation = Weevar.qualifyStorage(experiment);
                    Weevar.initializeExperiment(experiment, variation);

                    continue;
                } else {
                    if (Weevar.config.debug) {
                        Weevar.debugQualification(experiment, false, false, true);
                    }
                }
            } else {
                if (Weevar.config.debug) {
                    Weevar.debugQualification(experiment, false, false, true);
                }
            }
        }

        Weevar.initialized = true;
    }

    Weevar.debugQualification = function (experiment, userIsQualified, forcedParams, skipping) {

        userIsQualified = userIsQualified || false;
        forcedParams = forcedParams || false;

        var groupLabel = '';

        if (forcedParams) {
            groupLabel += '[FORCED] ';
        } else {
            groupLabel += '[ORGANIC] ';
        }

        if (userIsQualified) {
            groupLabel += 'Visitor qualifies for experiment ' + experiment.name + '.';
        } else {
            groupLabel += 'Visitor does not qualify for experiment ' + experiment.name + '.';
        }

        console.groupCollapsed(groupLabel);
        console.log('Is this experiment forced by query params?');
        console.log(forcedParams == true);
        console.log('Is the URL qualified?\n')
        console.log(Weevar.qualifyUrl(experiment) == true);
        console.log('Is the viewport qualified?');
        console.log(Weevar.qualifyViewport(experiment) == true);
        console.log('Is the user agent qualified?');
        console.log(Weevar.qualifyUserAgent(experiment) == true);
        console.log('Is the visitor qualified for the traffic range? ');
        console.log(Weevar.qualifyTrafficRange(experiment) == true);
        console.log('Is the experiment running?');
        console.log(Weevar.qualifyStatus(experiment) == true);
        console.log()
        console.groupEnd();
    }

    /**
     * Check the DoNotTrack settings in user's browser
     * @returns {*}
     */
    Weevar.checkDoNotTrackSetting = function () {
        // Firefox override
        if (window.navigator.doNotTrack == 'unspecified') {
            return false;
        }

        return window.navigator.doNotTrack || 0;
    }

    /**
     * Set extra visitor information before initialization
     */
    Weevar.env.visitor.forcedQueryParams = Weevar.checkForcedQueryParams();
    Weevar.env.visitor.bucket = Weevar.getTrafficBucket();
    Weevar.env.visitor.doNotTrack = window.navigator.doNotTrack || 0;

    // Initializes Weevar
    if (Weevar.site.data && Weevar.site.data.experiments && Weevar.site.data.experiments.data && Weevar.env.visitor.doNotTrack == false) {
        Weevar.initialize();
    }

})(window, document);
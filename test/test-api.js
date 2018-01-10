var assert = chai.assert;
var expect = chai.expect;

describe('API', function () {
    before(function () {
        if (window.location.search.search('wee_x') < 0 || window.location.search.search('wee_var') < 0) {
            var url = addParameter(window.location.href, 'wee_x', 1);
            url = addParameter(url, 'wee_var', 1);
            window.location.href = url;
        }
    });
    after(function () {
        window.localStorage.clear();
        Weevar.env = {
            // Current URL
            url: window.location,
            // Viewport information
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight,
                cookies: document.cookie,
                userAgent: navigator.userAgent
            }
        }
    });
    describe('generateGuid(): string', function () {
        it('Return a generated unique ID', function () {
            var guid = Weevar.generateGuid();
            expect(guid).to.be.a('string');
        });
    });
    describe('calculateTrackingDates(): object', function () {
        it('Return an object with time and expires property', function () {
            var dates = Weevar.calculateTrackingDates();
            expect(dates).to.be.an('object');
            expect(dates).to.have.property('time');
            expect(dates).to.have.property('expires');
        });
    });
    describe('isBetween(x, min, max): boolean', function () {
        it('Returns true if x is between min & max', function () {
            var isBetween = Weevar.isBetween(10, 0, 1024);
            expect(isBetween).to.be.an('boolean');
            expect(isBetween).to.be.true;
        });
        it('Returns false if x is not between min & max', function () {
            var isBetween = Weevar.isBetween(2000, 0, 1024);
            expect(isBetween).to.be.an('boolean');
            expect(isBetween).to.be.false;
        });
        it('Returns true if max is < 0', function () {
            var isBetween = Weevar.isBetween(1, 0, -1);
            expect(isBetween).to.be.an('boolean');
            expect(isBetween).to.be.true;
        });
    });
    describe('getQueryParam(paramName): string', function () {
        it('Can return a existing query param (wee_x = 1)', function () {
            var param = Weevar.getQueryParam('wee_x');
            expect(param).to.be.equal(1);
        });
        it('Can\'t return the query param (wee_foo)', function () {
            var param = Weevar.getQueryParam('wee_foo');
            expect(param).to.be.null;
        });
    });
    describe('checkForcedQueryParams(): boolean', function () {
        it('It has forced query params (wee_x && wee_var)', function () {
            var response = Weevar.checkForcedQueryParams();
            expect(response).to.be.an('object');
            expect(response).to.have.property('experiment');
            expect(response).to.have.property('variation');
            expect(response.experiment).to.not.be.null;
            expect(response.variation).to.not.be.null;
        });
    });
    describe('guessLocation(): void', function () {
        it('It can guess the user location', function () {
            Weevar.guessLocation();
            var script = document.getElementById(Weevar.config.localStorage.location);
            expect(script).to.not.be.null;
        });
    });
    describe('setLocation(): void', function () {
        it('It can set the user location in local storage', function () {
            Weevar.setLocation("{}");
            expect(window.localStorage.getItem(Weevar.config.localStorage.location)).to.not.be.null;
        });
    });
    describe('getExperimentBucket(): Number', function () {
        it('It can generate a Number to place visitor in experiment bucket', function () {
            var bucket = Weevar.getExperimentBucket();
            expect(bucket).to.not.be.null;
            expect(bucket).to.be.a('Number');
        });
    });
    describe('qualifyUserAgent(experiment): Boolean', function () {
        it('It qualifies the visitor if user agent is not set on experiment', function () {
            var qualified = Weevar.qualifyUserAgent(Weevar.site.data.experiments.data[0]);
            expect(qualified).to.be.true;
        });
        it('It qualifies the visitor if user agent match', function () {
            var experiment = {
                userAgent: 'Chrome'
            };
            Weevar.env.viewport.userAgent = 'Chrome';

            var qualified = Weevar.qualifyUserAgent(experiment);
            expect(qualified).to.be.true;
        });
        it('It does not qualify the visitor if user agents do not match', function () {
            var experiment = {
                userAgent: 'Chrome'
            };
            Weevar.env.viewport.userAgent = 'Firefox';

            var qualified = Weevar.qualifyUserAgent(experiment);
            expect(qualified).to.be.false;
        });;
    });
    describe('qualifyUrl(experiment): Boolean', function () {
        it('It qualifies the visitor if includeUrls is a wildcard', function () {
            var experiment = {
                includeUrls: ['*']
            };

            var qualified = Weevar.qualifyUrl(experiment);
            expect(qualified).to.be.true;

            experiment = {
                includeUrls: ['\*']
            };

            var qualified = Weevar.qualifyUrl(experiment);
            expect(qualified).to.be.true;
        });
        it('It qualifies the visitor if URL is an exact match', function () {
            var experiment = {
                includeUrls: ['testrunner.html']
            };

            var qualified = Weevar.qualifyUrl(experiment);
            expect(qualified).to.be.true;
        });
        it('It qualifies the visitor if URL is a regex match', function () {
            var experiment = {
                includeUrls: ['(wee_x)+']
            };

            var qualified = Weevar.qualifyUrl(experiment);
            expect(qualified).to.be.true;
        });
        it('It qualifies the visitor if no URL is included and no URL is excluded', function () {
            var experiment = {
                includeUrls: [],
                excludeUrls: []
            };

            var qualified = Weevar.qualifyUrl(experiment);
            expect(qualified).to.be.false;
        });
        it('It does not qualify the visitor if URL is not an exact match', function () {
            var experiment = {
                includeUrls: ['/foobar.html'],
                excludeUrls: []
            };

            var qualified = Weevar.qualifyUrl(experiment);
            expect(qualified).to.be.false;
        });
        it('It does not qualify the visitor if URL is not a regex match', function () {
            var experiment = {
                includeUrls: ['(foo)+'],
                excludeUrls: []
            };

            var qualified = Weevar.qualifyUrl(experiment);
            expect(qualified).to.be.false;
        });
        it('It does not qualify the visitor if URL is an exact match but it is excluded', function () {
            var experiment = {
                includeUrls: ['/testrunner.html'],
                excludeUrls: ['/testrunner.html']
            };

            var qualified = Weevar.qualifyUrl(experiment);
            expect(qualified).to.be.false;
        });
        it('It does not qualify the visitor if URL is an regex match but it is excluded', function () {
            var experiment = {
                includeUrls: ['(wee_x)+'],
                excludeUrls: ['(wee_x)+']
            };

            var qualified = Weevar.qualifyUrl(experiment);
            expect(qualified).to.be.false;
        });
        it('It does not qualify the visitor if using wildcard and URL is excluded', function () {
            var experiment = {
                includeUrls: ['*'],
                excludeUrls: ['/testrunner.html']
            };

            var qualified = Weevar.qualifyUrl(experiment);
            expect(qualified).to.be.false;
        });
        it('It does not qualify the visitor if no URL included and URL is excluded with regex', function () {
            var experiment = {
                includeUrls: [],
                excludeUrls: ['(wee_x)+']
            };

            var qualified = Weevar.qualifyUrl(experiment);
            expect(qualified).to.be.false;
        });
    });
    describe('qualifyViewport(experiment): Boolean', function () {
        it('It qualifies the visitor if the viewport width match and no height constraint is set', function () {
            var experiment = {
                viewport: {
                    width: {
                        min: 0,
                        max: 1024
                    }
                }
            };

            Weevar.env.viewport.width = 960;
            Weevar.env.viewport.height = 2000;

            var qualified = Weevar.qualifyViewport(experiment);
            expect(qualified).to.be.true;
        });
        it('It qualifies the visitor if the viewport width and height both match', function () {
            var experiment = {
                viewport: {
                    width: {
                        min: 0,
                        max: 1024
                    },
                    height: {
                        min: 0,
                        max: 2500
                    }
                }
            };

            Weevar.env.viewport.width = 960;
            Weevar.env.viewport.height = 2000;

            var qualified = Weevar.qualifyViewport(experiment);
            expect(qualified).to.be.true;
        });
        it('It does not qualify the visitor if the viewport width does not match', function () {
            var experiment = {
                viewport: {
                    width: {
                        min: 0,
                        max: 1024
                    },
                    height: {
                        min: 0,
                        max: 2500
                    }
                }
            };

            Weevar.env.viewport.width = 1920;
            Weevar.env.viewport.height = 2000;

            var qualified = Weevar.qualifyViewport(experiment);
            expect(qualified).to.be.false;
        });
        it('It does not qualify the visitor if the viewport height does not match', function () {
            var experiment = {
                viewport: {
                    width: {
                        min: 0,
                        max: 960
                    },
                    height: {
                        min: 0,
                        max: 2000
                    }
                }
            };

            Weevar.env.viewport.width = 1024;
            Weevar.env.viewport.height = 2500;

            var qualified = Weevar.qualifyViewport(experiment);
            expect(qualified).to.be.false;
        });
    });
    describe('qualifyForcedQueryParams(experiment): Boolean', function () {
        it('It qualifies the visitor if the experiment forced query param is present and it matches the experiment ID', function () {
            var experiment = {
                id: 1
            };

            var qualified = Weevar.qualifyForcedQueryParams(experiment);
            expect(qualified).to.be.true;
        });
        it('It does not qualify the visitor if the experiment forced query param is present and it does not match the experiment ID', function () {
            var experiment = {
                id: 2
            };

            var qualified = Weevar.qualifyForcedQueryParams(experiment);
            expect(qualified).to.be.false;
        });
    });
    describe('qualifyTrafficRange(experiment): Boolean', function () {
        it('It qualifies the visitor if bucket # is in the traffic percentage allocated', function () {
            var experiment = {
                trafficPercentage: [0, 50.00]
            }

            Weevar.env.visitor.bucket = 25.45;

            var qualified = Weevar.qualifyTrafficRange(experiment);
            expect(qualified).to.be.true;
        });
    });
    describe('qualifyStatus(experiment[, validStatuses: array]): Boolean', function () {
        it('It qualifies the visitor if experiment has "active" status', function () {
            var experiment = {
                status: 'active'
            }

            var qualified = Weevar.qualifyStatus(experiment);
            expect(qualified).to.be.true;
        });
        it('It qualifies the visitor if experiment has "running" status', function () {
            var experiment = {
                status: 'running'
            }

            var qualified = Weevar.qualifyStatus(experiment);
            expect(qualified).to.be.true;
        });
        it('It qualifies the visitor if experiment has "live" status', function () {
            var experiment = {
                status: 'live'
            }

            var qualified = Weevar.qualifyStatus(experiment);
            expect(qualified).to.be.true;
        });
        it('It does not qualify the visitor if experiment has any other status', function () {
            var experiment = {
                status: 'draft'
            }

            var qualified = Weevar.qualifyStatus(experiment);
            expect(qualified).to.be.false;
        });
        it('It can test against any other statuses', function () {
            var experiment = {
                status: 'draft'
            }

            var qualified = Weevar.qualifyStatus(experiment, ['draft']);
            expect(qualified).to.be.true;
            qualified = Weevar.qualifyStatus(experiment, ['paused']);
            expect(qualified).to.be.false;
        });
    });
    describe('alreadyRunning(experiment[, variation]): Boolean', function () {
        it('It can check if experiment is already running', function () {
            var experiment = {
                running: true
            }

            var running = Weevar.alreadyRunning(experiment);
            expect(running).to.be.true;
        });
        it('It can check if experiment is not already running', function () {
            var experiment = {
                running: false
            }

            var running = Weevar.alreadyRunning(experiment);
            expect(running).to.be.false;
        });
        it('It can check that experiment code and variation code are already running', function () {
            var experiment = {
                running: true
            }
            var variation = {
                running: true
            }

            var running = Weevar.alreadyRunning(experiment, variation);
            expect(running).to.be.true;
        });
        it('It can check that experiment code is running but not variation code', function () {
            var experiment = {
                running: true
            }
            var variation = {
                running: true
            }

            var running = Weevar.alreadyRunning(experiment, variation);
            expect(running).to.be.true;
        });
        it('It can check that variation code is already running but not experiment code', function () {
            var experiment = {
                running: false
            }
            var variation = {
                running: true
            }

            var running = Weevar.alreadyRunning(experiment, variation);
            expect(running).to.be.false;
        });
        it('It can check that variation code is not running but experiment code is', function () {
            var experiment = {
                running: true
            }
            var variation = {
                running: false
            }

            var running = Weevar.alreadyRunning(experiment, variation);
            expect(running).to.be.false;
        });
    });
    describe('setGoogleAnalyticsObjectName(objectName): void', function () {
        it('It can set a different name for Google Analytics object', function () {
            Weevar.setGoogleAnalyticsObjectName('GoogleAnalytics');
            expect(Weevar.config.integrations.googleAnalytics).to.be.equal('GoogleAnalytics');
        });
    });
    describe('setHotjarObjectName(objectName): void', function () {
        it('It can set a different name for Hotjar object', function () {
            Weevar.setHotjarObjectName('Hotjar');
            expect(Weevar.config.integrations.hotjar).to.be.equal('Hotjar');
        });
    });
    describe('getElementQuery(selectorType, selectorName): string', function () {
        it('It can get an element with a class name', function () {
            var selector = Weevar.getElementQuery('class', 'keyword');
            expect(selector).to.be.equal('document.getElementsByClassName(\'keyword\')');
        });
        it('It can get an element with a ID', function () {
            var selector = Weevar.getElementQuery('id', 'keyword');
            expect(selector).to.be.equal('document.getElementById(\'keyword\')');
        });
        it('It can get an element with a tag name', function () {
            var selector = Weevar.getElementQuery('tag', 'keyword');
            expect(selector).to.be.equal('document.getElementsByTagName(\'keyword\')');
        });
        it('It can get an element with query selector', function () {
            var selector = Weevar.getElementQuery('query', 'keyword');
            expect(selector).to.be.equal('document.querySelectorAll(\'keyword\')');
        });
    });
    describe('checkElement(element): boolean', function () {
        it('It can check if an element is valid', function () {
            var check = Weevar.checkElement(document.querySelector('#mocha'));
            expect(check).to.be.true;
        });
        it('It can check if an element is invalid', function () {
            var check = Weevar.checkElement(document.querySelector('#foo'));
            expect(check).to.be.false;
        });
    });
    describe('runExperiment(experiment, variation): boolean', function () {
        it('It can run an experiment', function () {
            var experiment = {
                variations: {
                    data: [
                        {
                            id: 1,
                            trafficPercentage: [0, 100]
                        }
                    ]
                }
            }
            var variation = 0;
            var check = Weevar.initializeExperiment(experiment, variation);
            expect(check).to.be.true;
        });
        it('It can\'t run experiment with no variations', function () {
            var experiment = {
                variations: {
                    data: []
                }
            }
            var variation = 0;
            var check = Weevar.initializeExperiment(experiment, variation);
            expect(check).to.be.false;
        });
    });
    describe('runExperiment(experiment, variation): boolean', function () {
        it('It can initialize', function () {
            expect(Weevar.initialized).to.be.true;
        });
    });
});
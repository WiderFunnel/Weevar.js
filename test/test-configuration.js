var assert = chai.assert;
var expect = chai.expect;

describe('Weevar', function () {
    before(function() {
        if(window.location.search.search('wee_x') < 0 || window.location.search.search('wee_var') < 0) {
            var url = addParameter(window.location.href, 'wee_x', 1);
            url = addParameter(url, 'wee_var', 1);
            window.location.href = url;
        }
    });

    after(function() {
        window.localStorage.clear();
    });

    it('Weevar object exists', function () {
        expect(window.Weevar).to.be.an('object');
    });

    describe('Configuration', function () {
        it('Configuration is loaded', function () {
            expect(window.Weevar).to.have.property('config');
            expect(window.Weevar.config).to.be.an('object');
        });
        it('It has query params to force experiment & variation', function () {
            expect(window.Weevar.config).to.have.property('queryParams');
            expect(window.Weevar.config.queryParams).to.be.an('object');
            expect(window.Weevar.config.queryParams).to.have.property('experiment');
            expect(window.Weevar.config.queryParams.experiment).to.be.a('string');
            expect(window.Weevar.config.queryParams).to.have.property('variation');
            expect(window.Weevar.config.queryParams.variation).to.be.a('string');
        });
        it('It has keys for local storage', function () {
            expect(window.Weevar.config).to.have.property('localStorage');
            expect(window.Weevar.config.localStorage).to.be.an('object');
            expect(window.Weevar.config.localStorage).to.have.property('location');
            expect(window.Weevar.config.localStorage.location).to.be.a('string');
            expect(window.Weevar.config.localStorage).to.have.property('bucket');
            expect(window.Weevar.config.localStorage.bucket).to.be.a('string');
        });
        it('It has keys for integrations', function () {
            expect(window.Weevar.config).to.have.property('integrations');
            expect(window.Weevar.config.integrations).to.be.an('object');
            expect(window.Weevar.config.integrations).to.have.property('googleAnalytics');
            expect(window.Weevar.config.integrations.googleAnalytics).to.be.a('string');
            expect(window.Weevar.config.integrations.googleAnalytics).to.be.equal('ga');
            expect(window.Weevar.config.integrations).to.have.property('hotjar');
            expect(window.Weevar.config.integrations.hotjar).to.be.a('string');
            expect(window.Weevar.config.integrations.hotjar).to.be.equal('hj');
        });
        it('It has tracking start property set (w/ time & expires)', function () {
            expect(window.Weevar).to.have.property('trackingStart');
            expect(window.Weevar.trackingStart).to.be.an('object');
            expect(window.Weevar.trackingStart).to.have.property('time');
            expect(window.Weevar.trackingStart).to.have.property('expires');
        });
    });

    describe('Environment', function () {
        it('Environment is loaded', function () {
            expect(window.Weevar).to.have.property('env');
            expect(window.Weevar.env).to.be.an('object');
        });
        it('It contains the current URL (' + window.location + ')', function () {
            expect(window.Weevar.env).to.have.property('url');
            assert.equal(window.location, window.Weevar.env.url);
        });
        it('It contains the viewport info. (width, height, cookies & user agent)', function () {
            expect(window.Weevar.env).to.have.property('viewport');
            expect(window.Weevar.env.viewport).to.be.an('object');
            expect(window.Weevar.env.viewport).to.have.property('width');
            expect(window.Weevar.env.viewport).to.have.property('height');
            expect(window.Weevar.env.viewport).to.have.property('cookies');
            expect(window.Weevar.env.viewport).to.have.property('userAgent');
        });
        it('It contains the visitor info. (forced query params, bucket & doNotTrack)', function () {
            expect(window.Weevar.env).to.have.property('visitor');
            expect(window.Weevar.env.visitor).to.be.an('object');
            expect(window.Weevar.env.visitor).to.have.property('forcedQueryParams');
            expect(window.Weevar.env.visitor).to.have.property('bucket');
            expect(window.Weevar.env.visitor).to.have.property('doNotTrack');
        });
    });
});
var assert = chai.assert;
var expect = chai.expect;

describe('Site', function () {
    describe('Configuration', function () {
        it('Site configuration is loaded', function () {
            expect(window.Weevar.site).to.be.an('Object');
            expect(window.Weevar.site).to.have.property('data');
            expect(window.Weevar.site.data).to.be.an('Object');
        });
        it('Site configuration contains site ID', function () {
            expect(window.Weevar.site.data).to.have.property('id');
        });
        it('Site configuration contains site javascript', function () {
            expect(window.Weevar.site.data).to.have.property('javascript');
        });
        it('Site configuration contains site CSS bundle URL', function () {
            expect(window.Weevar.site.data).to.have.property('cssBundleUrl');
        });
        it('Site javascript has been loaded', function () {
            expect(window.siteJavascriptRan).to.equal(true);
        });
        it('Site CSS bundle is loaded', function () {
            var css = document.getElementById('weevar-css');
            var url = css.getAttribute('href');

            assert.notEqual(null, css);
            assert.equal('test/test.css', url);
        });
        describe('Integrations', function () {
            it('Site can have integrations', function () {
                expect(window.Weevar.site.data).to.have.property('integrations');
            });
            it('Site can contain Google Analytics information', function () {
                expect(window.Weevar.site.data.integrations).to.have.property('googleAnalytics');
                expect(window.Weevar.site.data.integrations.googleAnalytics).to.have.property('tracker_id');
                expect(window.Weevar.site.data.integrations.googleAnalytics).to.have.property('tracker_name');
                expect(window.Weevar.site.data.integrations.googleAnalytics).to.have.property('custom_dimension_slot');
            });
        });

    });
    describe('Experiments', function () {
        it('Experiment has experiments', function () {
            expect(window.Weevar.site.data).to.have.property('experiments');
            expect(window.Weevar.site.data.experiments).to.have.property('data');
            expect(window.Weevar.site.data.experiments.data.length).to.be.equal(2);
        });
        it('Experiment can have javascript code', function () {
            expect(window.Weevar.site.data.experiments.data[0]).to.have.property('javascript');
        });
        it('Experiment can have included URLs', function () {
            expect(window.Weevar.site.data.experiments.data[0]).to.have.property('includeUrls');
            expect(window.Weevar.site.data.experiments.data[0].includeUrls).to.be.an('array');
        });
        it('Experiment can have excluded URLs', function () {
            expect(window.Weevar.site.data.experiments.data[0]).to.have.property('excludeUrls');
            expect(window.Weevar.site.data.experiments.data[0].excludeUrls).to.be.an('array');
        });
        it('Experiment can have traffic percentage', function () {
            expect(window.Weevar.site.data.experiments.data[0]).to.have.property('trafficPercentage');
            expect(window.Weevar.site.data.experiments.data[0].trafficPercentage).to.be.an('array');
        });
        describe('Integrations', function () {
            it('Experiment can have integrations', function () {
                expect(window.Weevar.site.data.experiments.data[0]).to.have.property('integrations');
            });
            it('Site can contain Google Analytics information', function () {
                expect(window.Weevar.site.data.experiments.data[0].integrations).to.have.property('googleAnalytics');
                expect(window.Weevar.site.data.experiments.data[0].integrations.googleAnalytics).to.have.property('customDimensionSlot');
            });
        });
        describe('Viewport', function () {
            it('Experiment can have viewport constraints', function () {
                expect(window.Weevar.site.data.experiments.data[0]).to.have.property('viewport');
                expect(window.Weevar.site.data.experiments.data[0].viewport).to.be.an('object');
            });
            it('Experiment can have viewport width constraints', function () {
                expect(window.Weevar.site.data.experiments.data[0].viewport).to.have.property('width');
                expect(window.Weevar.site.data.experiments.data[0].viewport.width).to.be.an('object');
                expect(window.Weevar.site.data.experiments.data[0].viewport.width).to.have.property('min');
                expect(window.Weevar.site.data.experiments.data[0].viewport.width.min).to.equal(0);
                expect(window.Weevar.site.data.experiments.data[0].viewport.width).to.have.property('max');
                expect(window.Weevar.site.data.experiments.data[0].viewport.width.max).to.equal(1024);
            });
            it('Experiment can have viewport height constraints', function () {
                expect(window.Weevar.site.data.experiments.data[0].viewport).to.have.property('width');
                expect(window.Weevar.site.data.experiments.data[0].viewport.height).to.be.an('object');
                expect(window.Weevar.site.data.experiments.data[0].viewport.height).to.have.property('min');
                expect(window.Weevar.site.data.experiments.data[0].viewport.height.min).to.equal(0);
                expect(window.Weevar.site.data.experiments.data[0].viewport.height).to.have.property('max');
                expect(window.Weevar.site.data.experiments.data[0].viewport.height.max).to.equal(1024);
            });
        });
        describe('Variations', function () {
            it('Experiment can have variations', function () {
                expect(window.Weevar.site.data.experiments.data[0]).to.have.property('variations');
                expect(window.Weevar.site.data.experiments.data[0].variations).to.have.property('data');
                expect(window.Weevar.site.data.experiments.data[0].variations.data.length).to.be.equal(2);
            });
            it('Variation can have an ID', function () {
                expect(window.Weevar.site.data.experiments.data[0].variations.data[0]).to.have.property('id');
            });
            it('Variation can have a name', function () {
                expect(window.Weevar.site.data.experiments.data[0].variations.data[0]).to.have.property('name');
            });
            it('Variation can have traffic percentage', function () {
                expect(window.Weevar.site.data.experiments.data[0].variations.data[0]).to.have.property('trafficPercentage');
                expect(window.Weevar.site.data.experiments.data[0].variations.data[0].trafficPercentage).to.be.an('array');
            });
        });
    });
})
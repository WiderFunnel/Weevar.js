window.Weevar = Weevar = {};

Weevar.site = {
    "data": {
        "id": 1768,
        "cssBundleUrl": "test/test.css",
        "javascript": "window.siteJavascriptRan = true;\n",
        "integrations": {
            "googleAnalytics": {
                "tracker_id": 'Bonzai',
                "tracker_name": 'Bonzai',
                "custom_dimension_slot": 1
            },
            "hotjar": []
        },
        "experiments": {
            "data": [
                {
                    "id": 1,
                    "name": "1.0",
                    "status": "running",
                    "javascript": "console.info('Experiment 1.0')",
                    "includeUrls": [],
                    "excludeUrls": [],
                    "trafficPercentage": [0, 100],
                    "trackOnLoad": true,
                    "integrations": {
                        "googleAnalytics": {
                            "customDimensionSlot": null
                        }
                    },
                    "integrations": {
                        "googleAnalytics": {
                            "customDimensionSlot": 5
                        }
                    },
                    "viewport": {
                        "width": {
                            "min": 0,
                            "max": 1024
                        },
                        "height": {
                            "min": 0,
                            "max": 1024
                        }
                    },
                    "variations": {
                        "data": [
                            {
                                "id": 0,
                                "name": "Control",
                                "trafficPercentage": [0, 50.00],
                                "javascript": "console.log('Control')"
                            },
                            {
                                "id": 1,
                                "name": "Variation A",
                                "trafficPercentage": [51.00, 100],
                                "javascript":"console.log('Variation A')"
                            }
                        ]
                    }
                },
                {
                    "id": 2,
                    "name": "1.1",
                    "status": "draft",
                    "javascript": "// Some experiment js for 1.1\n",
                    "includeUrls": [],
                    "excludeUrls": [],
                    "trafficPercentage": [0, 100],
                    "trackOnLoad": true,
                    "viewport": {
                        "width": {
                            "min": 0,
                            "max": 1024
                        },
                        "height": {
                            "min": 0,
                            "max": 1024
                        }
                    },
                    "variations": {
                        "data": [
                            {
                                "id": 0,
                                "name": "Control",
                                "trafficPercentage": [0, 50.00]
                            },
                            {
                                "id": 1,
                                "name": "Variation A",
                                "trafficPercentage": [51.00, 100]
                            }
                        ]
                    }
                }
            ]
        }
    }
};
window.Weevar = Weevar = {};

Weevar.site = {
    "data": {
        "id": 1768,
        "cssBundleUrl": "example.css",
        "javascript": "//",
        "debug": true,
        "integrations": {
            "googleAnalytics": {
                "trackerId": 'Bonzai',
                "trackerName": 'Bonzai',
                "defaultCustomDimensionSlot": 1
            },
            "hotjar": true
        },
        "experiments": {
            "data": [
                {
                    "id": 1,
                    "name": "1.0",
                    "status": "paused",
                    "javascript": "//",
                    "includeUrls": ['*'],
                    "excludeUrls": [],
                    "trafficPercentage": [0, 100],
                    "trackOnLoad": true,
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
                            "min": -1,
                            "max": -1
                        }
                    },
                    "variations": {
                        "data": [
                            {
                                "id": 0,
                                "name": "Control",
                                "trafficPercentage": [0, 50.00],
                                "javascript": "//"
                            },
                            {
                                "id": 1,
                                "name": "Variation A",
                                "trafficPercentage": [51.00, 100],
                                "javascript":"//"
                            }
                        ]
                    }
                },
                {
                    "id": 2,
                    "name": "1.1",
                    "status": "running",
                    "javascript": "// Some experiment js for 1.1\n",
                    "includeUrls": ['/'],
                    "excludeUrls": [],
                    "trafficPercentage": [0, 100],
                    "trackOnLoad": true,
                    "integrations": {

                    },
                    "viewport": {
                        "width": {
                            "min": -1,
                            "max": -1
                        },
                        "height": {
                            "min": 0,
                            "max": 400
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
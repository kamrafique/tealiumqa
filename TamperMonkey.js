// ==UserScript==
// @name         Tealium Log Capture
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  Capture logs
// @author       KR
// @match        *://*.eurostar.com/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// ==/UserScript==


(function () {
    'use strict';

    console.log("Tampermonkey script loaded and running.");

    let capturedLogs = JSON.parse(localStorage.getItem('capturedLogs')) || [];

    // Define the specific Tealium objects to look for, including dynamic values
    const expectedTealiumObjects = [
        {"isLoggedIn":"false","eventName":"AuthenticationEvent","event":"TealiumLink"},
        {"eventCategory":"Internal Promotion","eventAction":"Impression","eventNonInteraction":"true","eventLabel":"PromoRow_02","promotion_id":["Content Card","Content Card","Content Card"],"promotion_name":["Brussels from £39*","Lille from £39*","Christmas markets in Europe"],"promotion_creative":["Brussels - Grand Place ","Lille in Winter","Family at a Christmas market"],"promotion_position":["02_01","02_02","02_03"],"page_element_cta":"Book now |Book now|Find out more","eventName":"ImpressionEvent","event":"TealiumLink"},
        {"eventCategory":"Internal Promotion","eventAction":"Impression","eventNonInteraction":"true","eventLabel":"HeroCarousel_01","promotion_id":["Hero Carousel"],"promotion_name":["Paris from £39*"],"promotion_creative":["Pari, Eiffel Tower at dusk"],"promotion_position":["01_01"],"page_element_cta":"Book now","eventName":"ImpressionEvent","event":"TealiumLink"},
        {
            eventAction: "Login",
            currency: "GBP",
            funnel_name: "Train",
            page_name: "Login",
            page_category: "Checkout",
            ld_version: "design-system",
            eventCategory: "Login or Register",
            eventLabel: "Check out as a guest",
            formName: "checkout",
            eventName: "InteractionEvent",
            event: "TealiumLink"
        },
        // Add more expected logs as needed...
    ];

    // Store the original console.log function to avoid recursion
    const originalConsoleLog = console.log;

    console.log = function (...args) {
        // Call the original log but process only specific Tealium events
        const logMessage = args.join(' ');
        const eventType = detectTealiumEvent(args);

        // Only log and capture Tealium events (utag.view or utag.link)
        if (eventType) {
            capturedLogs.push({ message: logMessage, eventType: eventType });
            localStorage.setItem('capturedLogs', JSON.stringify(capturedLogs)); // Store logs in localStorage

            // Custom log message for Tealium events
            if (eventType === 'TealiumView') {
                console.log("Tealium - utag.view(): event: TealiumView - Custom", logMessage); // Custom log for utag.view
            } else if (eventType === 'TealiumLink') {
                console.log("Tealium - utag.link(): event: TealiumLink - Custom", logMessage); // Custom log for utag.link
            }
        }

        // Use the original console log for everything else
        originalConsoleLog.apply(console, args);
    };

    // Function to detect Tealium event types (utag.view and utag.link) and filter others
    function detectTealiumEvent(args) {
        // Check if the arguments correspond to Tealium's utag.view or utag.link
        if (args[0] && typeof args[0] === 'string' && args[0].includes('utag.view')) {
            return "TealiumView";
        } else if (args[0] && typeof args[0] === 'string' && args[0].includes('utag.link')) {
            return "TealiumLink";
        }
        return null; // Ignore non-Tealium events
    }

    // Function to get the list of mismatched variables
    function getMismatchDetails(capturedLog, expectedLog) {
        let mismatches = [];
        for (let key in expectedLog) {
            if (expectedLog.hasOwnProperty(key)) {
                if (Array.isArray(expectedLog[key])) {
                    // Compare array contents instead of reference
                    if (!arraysAreEqual(expectedLog[key], capturedLog[key])) {
                        mismatches.push(`${key}: expected [${expectedLog[key]}], got [${capturedLog[key]}]`);
                    }
                } else if (expectedLog[key] !== capturedLog[key]) {
                    mismatches.push(`${key}: expected [${expectedLog[key]}], got [${capturedLog[key]}]`);
                }
            }
        }
        return mismatches;
    }

    // Helper function to compare two arrays for equality
    function arraysAreEqual(arr1, arr2) {
        if (!Array.isArray(arr1) || !Array.isArray(arr2) || arr1.length !== arr2.length) {
            return false;
        }

        // Compare each element in the arrays
        for (let i = 0; i < arr1.length; i++) {
            if (arr1[i] !== arr2[i]) {
                return false;
            }
        }

        return true;
    }

    // Helper function to find matching events by eventAction AND eventLabel
    function findMatchingExpectedLogByActionAndLabel(capturedLog, expectedLogs) {
        return expectedLogs.find(expectedLog =>
            expectedLog.eventAction === capturedLog.eventAction && expectedLog.eventLabel === capturedLog.eventLabel
        );
    }

    // Helper function to find matching TealiumView logs by page_name
    function findMatchingTealiumViewLogByPageName(capturedLog, expectedLogs) {
        return expectedLogs.find(expectedLog =>
                                 expectedLog.event === 'TealiumView' && capturedLog.page_name === expectedLog.page_name
                                );
    }

    // Compare captured logs and Tealium objects based on expected event type
    function compareLogs() {
        capturedLogs.forEach((logEntry, index) => {
            let matchFound = false;
            let issues = [];

            let comparisonResults = {
                Index: index + 1,
                EventType: logEntry.eventType || 'N/A',
                CapturedLog: logEntry.message, // Always output CapturedLog, even if no match
                ExpectedLog: "No matching Tealium object",
                Status: "FAIL"
            };

            try {
                const parsedLogMessage = JSON.parse(logEntry.message); // Parse the captured log

                if (parsedLogMessage) {
                    // Only proceed if the event types match
                    if (logEntry.eventType === 'TealiumView') {
                        // For TealiumView, check if page_name matches
                        const matchingExpectedLog = findMatchingTealiumViewLogByPageName(parsedLogMessage, expectedTealiumObjects);

                        if (matchingExpectedLog) {
                            comparisonResults.CapturedLog = parsedLogMessage;
                            comparisonResults.ExpectedLog = matchingExpectedLog;

                            // Compare the remaining fields if the page_name matches
                            issues = getMismatchDetails(parsedLogMessage, matchingExpectedLog);
                            if (issues.length === 0) {
                                matchFound = true;
                                comparisonResults.Status = "PASS";
                            }
                        }
                    } else if (logEntry.eventType === 'TealiumLink') {
                        // Proceed as normal for TealiumLink and other event types
                        const matchingExpectedLog = findMatchingExpectedLogByActionAndLabel(parsedLogMessage, expectedTealiumObjects);

                        if (matchingExpectedLog) {
                            comparisonResults.CapturedLog = parsedLogMessage;
                            comparisonResults.ExpectedLog = matchingExpectedLog;

                            issues = getMismatchDetails(parsedLogMessage, matchingExpectedLog);
                            if (issues.length === 0) {
                                matchFound = true;
                                comparisonResults.Status = "PASS";
                            }
                        }
                    }
                }
            } catch (e) {
                console.error("Error parsing log entry:", e);
            }

            if (!matchFound && comparisonResults.ExpectedLog !== "No matching Tealium object") {
                comparisonResults.Status = "FAIL";
            }

            // Determine the color for the event type (orange for TealiumView, lighter purple for TealiumLink)
            const eventTypeColor = comparisonResults.EventType === "TealiumView" ? "orange" : "#c38cff";

            // Output nested and collapsible log with "TealiumQA - " prefix, colored event type, and status
            console.groupCollapsed(
                `%cTealiumQA event: %c${comparisonResults.EventType} %c${comparisonResults.Status}`,
                'color: lightblue; font-weight: 400;', // TealiumQA label in light blue
                `color: ${eventTypeColor}; font-weight: 400;`, // Event type color (orange for TealiumView, lighter purple for TealiumLink)
                comparisonResults.Status === "PASS" ? 'color: green; font-weight: bold;' : 'color: red; font-weight: bold;' // Status (PASS/FAIL) in green or red
            );
            console.log("CapturedLog:", comparisonResults.CapturedLog);
            console.log("ExpectedLog:", comparisonResults.ExpectedLog);

            // Only display Issues section if ExpectedLog exists and there are mismatches
            if (comparisonResults.Status === "FAIL" && comparisonResults.ExpectedLog !== "No matching Tealium object" && issues.length > 0) {
                console.log("Issues:", issues); // Output mismatched variables
            }

            console.groupEnd();
        });

        // Clear logs from localStorage after output
        capturedLogs = [];
        localStorage.removeItem('capturedLogs');
    }

    // Function to hook into Tealium as soon as utag and utag_data are available
    function hookIntoTealium() {
        if (typeof utag !== 'undefined' && typeof utag_data !== 'undefined') {
            console.log("Tealium and utag_data found, starting event monitoring.");

            const originalTealiumView = utag.view;
            const originalTealiumLink = utag.link;

            utag.view = function (a, b) {
                const logMessage = JSON.stringify(a);
                console.log("Tealium View Event triggered.");
                capturedLogs.push({ message: logMessage, eventType: 'TealiumView' });
                localStorage.setItem('capturedLogs', JSON.stringify(capturedLogs)); // Store logs in localStorage
                compareLogs(); // Automatically run the comparison after each event and clear logs
                originalTealiumView.apply(this, arguments);
            };

            utag.link = function (a, b) {
                const logMessage = JSON.stringify(a);
                console.log("Tealium Link Event triggered.");
                capturedLogs.push({ message: logMessage, eventType: 'TealiumLink' });
                localStorage.setItem('capturedLogs', JSON.stringify(capturedLogs)); // Store logs in localStorage
                compareLogs(); // Automatically run the comparison after each event and clear logs
                originalTealiumLink.apply(this, arguments);
            };
        } else {
            console.error("Tealium or utag_data object not found.");
        }
    }

    // Immediately try to hook into Tealium, and retry periodically in case it's not available yet
    function waitForTealiumData() {
        if (typeof utag !== 'undefined' && typeof utag_data !== 'undefined') {
            hookIntoTealium();
        } else {
            // Retry every 500ms until Tealium and utag_data are available
            setTimeout(waitForTealiumData, 500);
        }
    }

    // Start monitoring for Tealium and utag_data right away, without waiting for page load
    waitForTealiumData();

})();

// ==UserScript==
// @name         Tealium Log Capture
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Capture logs
// @author       You
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
        {
            eventAction: "Click",
            currency: ["GBP", "EUR", "USD"],
            funnel_name: "Trains",
            page_name: "Checkout",
            page_category: "Checkout",
            ld_version: "design-system",
            eventCategory: "Checkout Interaction",
            eventLabel: "Buy Now",
            eventName: "InteractionEvent",
            event: "TealiumLink"
        },
        {
            eventAction: "Form Submission",
            currency: ["GBP", "EUR", "USD"],
            funnel_name: "Trains",
            page_name: "Checkout",
            page_category: "Checkout",
            ld_version: "design-system",
            eventCategory: "Checkout Interaction",
            paymentDetails: "Card",
            paymentCardType: ["mc", "visa", "jcb", "diners", "discover"],
            eventLabel: "Card Payment",
            eventName: "InteractionEvent",
            event: "TealiumLink"
        },
        {
            event: "TealiumLink",
            eventName: "InteractionEvent",
            eventCategory: "Checkout Interaction",
            eventAction: "From Submission",
            paymentDetails: "Card",
            paymentCardType: ["mc", "visa", "jcb", "diners", "discover"]
        },
        {
            event: "TealiumLink",
            eventName: "InteractionEvent",
            eventCategory: "Checkout Interaction",
            eventAction: "Payment Method Selection",
            paymentDetails: "SavedCard"
        },
        {
            event: "TealiumLink",
            eventName: "InteractionEvent",
            eventCategory: "Checkout Interaction",
            eventAction: "From Submission",
            paymentDetails: "SavedCard",
            paymentCardType: ["mc", "visa", "jcb", "diners", "discover"]
        },
        {"eventAction":"Field Start","currency":["GBP", "EUR", "USD"],"funnel_name":"Trains","page_name":"Checkout","page_category":"Checkout","ld_version":"design-system","eventCategory":"Passenger Details","eventLabel":"passengers.0.firstName","eventName":"InteractionEvent","event":"TealiumLink"},
        {"eventAction":"Field Start","currency":["GBP", "EUR", "USD"],"funnel_name":"Trains","page_name":"Checkout","page_category":"Checkout","ld_version":"design-system","eventCategory":"Passenger Details","eventLabel":"passengers.0.lastName","eventName":"InteractionEvent","event":"TealiumLink"},
        {"eventAction":"Field Start","currency":["GBP", "EUR", "USD"],"funnel_name":"Trains","page_name":"Checkout","page_category":"Checkout","ld_version":"design-system","eventCategory":"Passenger Details","eventLabel":"passengers.0.email","eventName":"InteractionEvent","event":"TealiumLink"},
        {"eventAction":"Field Start","currency":["GBP", "EUR", "USD"],"funnel_name":"Trains","page_name":"Checkout","page_category":"Checkout","ld_version":"design-system","eventCategory":"Passenger Details","eventLabel":"passengers.0.email","eventName":"InteractionEvent","event":"TealiumLink"},
        {"eventAction":"Field Complete","currency":["GBP", "EUR", "USD"],"funnel_name":"Trains","page_name":"Checkout","page_category":"Checkout","ld_version":"design-system","eventCategory":"Passenger Details","eventLabel":"passengers.0.mobile","eventName":"InteractionEvent","event":"TealiumLink"},
        {"eventAction":"Field Start","currency":["GBP", "EUR", "USD"],"funnel_name":"Trains","page_name":"Checkout","page_category":"Checkout","ld_version":"design-system","eventCategory":"Passenger Details","eventLabel":"passengers.1.firstName","eventName":"InteractionEvent","event":"TealiumLink"},
        {"eventAction":"Field Start","currency":["GBP", "EUR", "USD"],"funnel_name":"Trains","page_name":"Checkout","page_category":"Checkout","ld_version":"design-system","eventCategory":"Passenger Details","eventLabel":"passengers.1.lastName","eventName":"InteractionEvent","event":"TealiumLink"},
        {"eventCategory":"Passenger detail","eventAction":"Contact details","eventLabel":"Save contact details:button","eventName":"InteractionEvent","event":"TealiumLink"},
        {
            event: 'TealiumLink',
            eventName: 'InteractionEvent',
            eventCategory: 'Optional question',
            eventAction: 'Reason for travel - Selection',
            eventLabel: ["reasons for this travel : business", "reasons for this travel : holiday", "reasons for this travel : visiting family or friends"]
        },
        {"currency":"GBP","funnel_name":"Trains","page_category":"Checkout","ld_version":"design-system","event":"TealiumView","activityType":"train exchange","isLoggedIn":false,"customer_hashedemail":null,"customer_is_admin":null,"businessID":null,"loyaltyTier":null,"membershipID":null,"membershipDetails":null,"pointsToSpend":null,"pointsToUpgrade":null,"directOrConnection":"direct","sJourneyType":"One way","sFromCode":"7015400","sFromName":"London St Pancras Int'l","sToCode":"8727100","sToName":"Paris Gare du Nord","sDateOutbound":"2024-10-23","sDateInbound":"","sTravelHorizon":0,"sTravelDuration":null,"sPaxTotal":1,"sPaxAdult":1,"sPaxChildren":0,"sPaxInfants":0,"sPaxSenior":0,"sPaxYouth":0,"sPaxCompanion":0,"basket_value_inpoints":0,"pointsOrRegular":"regular booking","promoBooking":"","ecommerce_action":"checkout","payment_methods":"Card|GooglePay|Invoice|PayPal","club_eurostar_discount":"none","basket_value":270,"products_count":1,"product_brand":["ES"],"product_id":["7015400 - 8727100"],"product_category":["trains"],"product_name":["7015400 - 8727100:adult"],"product_price":["270.00"],"product_price_inpoints":["0"],"product_quantity":[1],"product_train_numberofconnections":[1],"product_departure_date":["2024-10-23"],"product_train_departuretime":["18:01"],"product_train_fbccode":["H01PSXASBGX"],"product_train_number":["9046"],"product_variant":["outbound"],"product_hotel_origin_code":[],"product_hotel_destination_code":[],"product_hotel_occupancy":[],"product_hotel_starrating":[],"product_hotel_review_count":[],"product_hotel_review_score":[],"product_hotel_room_extra":[],"product_return_date":[],"product_train_class":["Standard Premier"],"product_train_route":["london route"],"product_train_origin_stationcode":["7015400"],"product_train_destination_stationcode":["8727100"],"product_train_arrivaltime":["21:28"],"product_train_tickettype":["ES_PUB_SP"],"product_train_connectionoperator":[null],"product_train_passenger_type":["adult"],"product_train_fare_name":[],"product_train_fare_type":[],"page_name":"Checkout"}

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
                    if (!expectedLog[key].includes(capturedLog[key])) {
                        mismatches.push(`${key}: expected [${expectedLog[key]}], got [${capturedLog[key]}]`);
                    }
                } else if (expectedLog[key] !== capturedLog[key]) {
                    mismatches.push(`${key}: expected [${expectedLog[key]}], got [${capturedLog[key]}]`);
                }
            }
        }
        return mismatches;
    }

    // Helper function to find matching events by eventAction AND eventLabel
    function findMatchingExpectedLogByActionAndLabel(capturedLog, expectedLogs) {
        return expectedLogs.find(expectedLog =>
            expectedLog.eventAction === capturedLog.eventAction && expectedLog.eventLabel === capturedLog.eventLabel
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
                    // Look for an expected log with the same eventAction AND eventLabel
                    const matchingExpectedLog = findMatchingExpectedLogByActionAndLabel(parsedLogMessage, expectedTealiumObjects);

                    if (matchingExpectedLog) {
                        comparisonResults.CapturedLog = parsedLogMessage;
                        comparisonResults.ExpectedLog = matchingExpectedLog;

                        // If there's a match on eventAction and eventLabel, compare the remaining fields
                        issues = getMismatchDetails(parsedLogMessage, matchingExpectedLog);

                        // If no mismatches, it's a pass
                        if (issues.length === 0) {
                            matchFound = true;
                            comparisonResults.Status = "PASS";
                        }
                    } else {
                        comparisonResults.ExpectedLog = "No matching Tealium object";
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
                `%cevent: TealiumQA - Log #${comparisonResults.Index}: %c${comparisonResults.EventType} %c${comparisonResults.Status}`,
                'color: lightblue; font-weight: bold;', // TealiumQA label in light blue
                `color: ${eventTypeColor}; font-weight: bold;`, // Event type color (orange for TealiumView, lighter purple for TealiumLink)
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

    // Tealium integration: Detecting utag.view and utag.link objects after the page has fully loaded
    window.onload = function () {
        if (typeof utag !== 'undefined') {
            console.log("Tealium found after page load, starting event monitoring.");

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
            console.error("Tealium object not found after page load.");
        }
    };

})();

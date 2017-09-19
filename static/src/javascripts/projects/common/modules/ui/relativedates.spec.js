// @flow

import {
    replaceLocaleTimestamps,
    makeRelativeDate,
    initRelativeDates,
} from './relativedates';

jest.useFakeTimers();

const pad = n => (n < 10 ? `0${n}` : n);

const DATES_TO_TEST = {
    lessThanAMinuteAgo: {
        date: (function() {
            const now = new Date();
            now.setSeconds(now.getSeconds() - 10);
            return now;
        })(),
        expectedOutput: '10s',
        expectedShortOutput: '10s',
        expectedMedOutput: '10s ago',
        expectedLongOutput: '10 seconds ago',
    },
    oneMinuteAgo: {
        date: (function() {
            const now = new Date();
            now.setMinutes(now.getMinutes() - 1);
            return now;
        })(),
        expectedOutput: '1m',
        expectedShortOutput: '1m',
        expectedMedOutput: '1m ago',
        expectedLongOutput: '1 minute ago',
    },
    upToEightMinutesAgo: {
        date: (function() {
            const now = new Date();
            now.setMinutes(now.getMinutes() - 8);
            return now;
        })(),
        expectedOutput: '8m',
        expectedShortOutput: '8m',
        expectedMedOutput: '8m ago',
        expectedLongOutput: '8 minutes ago',
    },
    oneHourAgo: {
        date: (function() {
            const now = new Date();
            now.setHours(now.getHours() - 1);
            return now;
        })(),
        expectedOutput: '1h',
        expectedShortOutput: '1h',
        expectedMedOutput: '1h ago',
        expectedLongOutput: '1 hour ago',
    },
    betweenNinetyMinutesAndTwoHours: {
        date: (function() {
            const now = new Date();
            now.setMinutes(now.getMinutes() - 92);
            return now;
        })(),
        expectedOutput: '2h',
        expectedShortOutput: '2h',
        expectedMedOutput: '2h ago',
        expectedLongOutput: '2 hours ago',
    },
    lessThanFiveHoursAgo: {
        date: (function() {
            const now = new Date();
            now.setMinutes(now.getMinutes() - 240);
            return now;
        })(),
        expectedOutput: '4h',
        expectedShortOutput: '4h',
        expectedMedOutput: '4h ago',
        expectedLongOutput: '4 hours ago',
    },
    moreThanFiveHoursAgo: {
        date: (function() {
            const now = new Date();
            now.setHours(now.getHours() - 10);
            return now;
        })(),
        expectedOutput: '10h',
        expectedShortOutput: '10h',
        expectedMedOutput: '10h ago',
        expectedLongOutput: '10 hours ago',
    },
    yesterday: {
        date: (function() {
            const now = new Date();
            const month = pad(now.getMonth() + 1);

            return new Date(
                `${now.getFullYear()}-${month}-${now.getDate() -
                    1}T08:45:00+01:00`
            );
        })(),
        expectedOutput: 'Yesterday 8:45',
        expectedShortOutput: '1d',
        expectedMedOutput: '1d ago',
        expectedLongOutput: 'Yesterday 8:45',
    },
    yesterdayButWithinTwentyFourHours: {
        date: (function() {
            const now = new Date();
            now.setHours(now.getHours() - 16);
            return now;
        })(),
        expectedOutput: (function() {
            const now = new Date();
            now.setHours(now.getHours() - 16);

            const hour = pad(now.getHours());
            const minute = pad(now.getMinutes());

            return `Yesterday ${hour}:${minute}`;
        })(),
        expectedShortOutput: '16h',
        expectedMedOutput: '16h ago',
    },
    moreThanTwoDaysAgo: {
        date: (function() {
            const now = new Date();
            now.setHours(now.getHours() - 4 * 24);
            return now;
        })(),
        expectedOutput: (function() {
            const days = [
                'Sunday',
                'Monday',
                'Tuesday',
                'Wednesday',
                'Thursday',
                'Friday',
                'Saturday',
            ];
            const shortMonths = [
                'Jan',
                'Feb',
                'Mar',
                'Apr',
                'May',
                'Jun',
                'Jul',
                'Aug',
                'Sep',
                'Oct',
                'Nov',
                'Dec',
            ];

            const now = new Date();
            now.setHours(now.getHours() - 4 * 24);
            const year = now.getFullYear();
            const day = pad(now.getDate());

            return `${days[now.getDay()]} ${day} ${shortMonths[
                now.getMonth()
            ]} ${year}`;
        })(),
        expectedShortOutput: '4d',
        expectedMedOutput: '4d ago',
    },
    moreThanFiveDaysAgo: {
        date: '2012-08-05T21:30:00+01:00',
        expectedOutput: '5 Aug 2012',
        expectedShortOutput: '5 Aug 2012',
        expectedMedOutput: '5 Aug 2012',
        expectedLongOutput: '5 Aug 2012',
    },
    oneMinuteAgoInAnotherTimeZone: {
        date: (function() {
            const now = new Date();
            now.setMinutes(now.getMinutes() - 1);

            const year = now.getFullYear();
            const month = pad(now.getMonth() + 1);
            const day = pad(now.getDate());
            const hour = pad(now.getHours() + 1);
            const minute = pad(now.getMinutes());

            return `${year}-${month}-${day}T${hour}:${minute}:00+02:00`;
        })(),
        expectedOutput: '1m',
        expectedShortOutput: '1m',
        expectedMedOutput: '1m ago',
        expectedLongOutput: '1 minute ago',
    },
};

describe('Relative dates', () => {
    beforeEach(() => {
        if (document.body) {
            document.body.innerHTML = `
                <time id="time-valid"
                      class="js-timestamp"
                      datetime="2012-08-12T18:43:00.000Z">12th August</time>

                <time id="time-invalid"
                      class="js-timestamp"
                      datetime="201-08-12agd18:43:00.000Z">Last Tuesday</time>',

                <time id="time-locale"
                      class="js-locale-timestamp"
                      datetime="2014-06-13T17:00:00+0100"
                      data-timestamp="1402675200000">16:00</time>'
            `;
        }
    });

    Object.keys(DATES_TO_TEST).forEach(key => {
        const value = DATES_TO_TEST[key];
        const {
            date,
            expectedMedOutput,
            expectedOutput,
            expectedShortOutput,
            expectedLongOutput,
        } = value;
        const epoch = Date.parse(date);

        describe(`Show relative dates for timestamps formatted as YYYY-MM-DD HH:MM:SS [${key}]`, () => {
            test('standard', () => {
                expect(makeRelativeDate(epoch)).toBe(expectedOutput);
            });

            test('short', () => {
                expect(makeRelativeDate(epoch, { format: 'short' })).toBe(
                    expectedShortOutput
                );
            });

            test('med', () => {
                expect(makeRelativeDate(epoch, { format: 'med' })).toBe(
                    expectedMedOutput
                );
            });

            if (expectedLongOutput) {
                test('long', () => {
                    expect(makeRelativeDate(epoch, { format: 'long' })).toBe(
                        expectedLongOutput
                    );
                });
            }
        });
    });

    it('Return the input date if said date is in the future', () => {
        expect(makeRelativeDate(Date.parse('2038-01-19T03:14:07'))).toBeFalsy();
    });

    test('Fail politely if given non-date / invalid input for either argument', () => {
        expect(makeRelativeDate('foo')).toBeFalsy();
    });

    test("Fail politely if the date is older than a 'notAfter' value", () => {
        expect(
            makeRelativeDate(
                Date.parse(Date.parse('2012-08-13T12:00:00+01:00')),
                {
                    notAfter: 3600,
                }
            )
        ).toBeFalsy();
    });

    test('Convert valid timestamps in the HTML document into their expected output', () => {
        initRelativeDates();

        expect(document.getElementById('time-valid').innerHTML).toBe(
            'Yesterday 19:43'
        );

        expect(
            document.getElementById('time-valid').getAttribute('title')
        ).toBe('12th August');
    });

    test('Ignore invalid timestamps', () => {
        initRelativeDates();

        expect(document.getElementById('time-invalid').innerHTML).toBe(
            'Last Tuesday'
        );
    });

    test('Should convert timestamps in document to users locale', () => {
        replaceLocaleTimestamps();

        expect(document.getElementById('time-locale').innerHTML).toBe('17:00');
    });

    test.skip('Should convert timestamps in HTML element to users locale', () => {

        replaceLocaleTimestamps(elem);

        expect(elem.querySelector('#time-locale').innerHTML).toBe('17:00');
    });
});

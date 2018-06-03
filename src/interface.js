const XDate = require('xdate');
const Hebcal = require('hebcal');

function padNumber(n) {
  if (n < 10) {
    return '0' + n;
  }
  return n;
}

function dateToData(date, isHebrewCal) {
    if (isHebrewCal) {
        return hdateToData(date);
    } else {
        return xdateToData(date);
    }
}

function xdateToData(xdate) {
  const dateString = xdate.toString('yyyy-MM-dd');
  return {
    year: xdate.getFullYear(),
    month: xdate.getMonth() + 1,
    day: xdate.getDate(),
    timestamp: XDate(dateString, true).getTime(),
    dateString: dateString
  };
}

function hdateToData(hdate) {
    return {
        year: hdate.getFullYear(),
        month: hdate.getMonth(),
        day: hdate.getDate(),
        timestamp: hdate.greg().getTime(),
        dateString: parseXDate(hdate.greg()).toString('yyyy-MM-dd'),
    };
}

function hDateToMonthYear(date) {
    return date.getFullYear().toString() + "-" + date.getMonth().toString() + "-" + date.getDate().toString();
}

function parseDate(d, isHebrewCal) {
    if (isHebrewCal) {
        return parseHDate(d);
    } else {
        return parseXDate(d)
    }
}

function parseXDate(d) {
  if (!d) {
    return;
  } else if (d.timestamp) { // conventional data timestamp
    return XDate(d.timestamp, true);
  } else if (d instanceof XDate) { // xdate
    return XDate(d.toString('yyyy-MM-dd'), true);
  } else if (d.getTime) { // javascript date
    const dateString = d.getFullYear() + '-' + padNumber((d.getMonth() + 1)) + '-' + padNumber(d.getDate());
    return XDate(dateString, true);
  } else if (d.year) {
    const dateString = d.year + '-' + padNumber(d.month) + '-' + padNumber(d.day);
    return XDate(dateString, true);
  } else if (d) { // timestamp nuber or date formatted as string
    return XDate(d, true);
  }
}

function parseHDate(d) {
    if (!d) {
        return;
    } else if (d.timestamp) { // conventional data timestamp
        return Hebcal.HDate(new Date(d.timestamp));
    } else if (typeof d === "string") {
        return Hebcal.HDate(new Date(d));
    } else if (d.getTime) { // javascript date
        const dateString = d.getFullYear() + '-' + padNumber((d.getMonth() + 1)) + '-' + padNumber(d.getDate());
        return Hebcal.HDate(new Date(dateString));
    } else if (d.year) {
        const dateString = d.year + '-' + padNumber(d.month) + '-' + padNumber(d.day);
        return Hebcal.HDate(new Date(dateString));
    } else if (d) { // timestamp nuber or date formatted as string
        return Hebcal.HDate(d);
    }
}

module.exports = {
  dateToData,
  parseDate,
};

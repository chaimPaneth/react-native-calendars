const XDate = require('xdate');
const Hebcal = require('hebcal');
const _ = require('lodash');

/* sameMonth */
function sameMonth(a, b, isHebrewCal) {
    if (isHebrewCal) {
        return sameHMonth(a, b);
    } else {
        return sameXMonth(a, b);
    }
}

function sameXMonth(a, b) {
    return a instanceof XDate && b instanceof XDate &&
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth();
}

function sameHMonth(a, b) {
    return a instanceof Hebcal.HDate && b instanceof Hebcal.HDate &&
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth();
}

/* sameDate */
function sameDate(a, b, isHebrewCal) {
    if (isHebrewCal) {
        return sameHDate(a, b);
    } else {
        return sameXDate(a, b);
    }
}

function sameXDate(a, b) {
  return a instanceof XDate && b instanceof XDate &&
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

function sameHDate(a, b) {
    return a instanceof Hebcal.HDate && b instanceof Hebcal.HDate &&
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate();
}

/* isGTE */
function isGTE(a, b, isHebrewCal) {
    if (isHebrewCal) {
        return isHGTE(a, b);
    } else {
        return isXGTE(a, b);
    }
}

function isXGTE(a, b) {
  return b.diffDays(a) > -1;
}

function isHGTE(a, b) {
    var same = a.isSameDate(b);

    var aY = a.getFullYear();
    var aM = a.getMonth();
    var aD = a.getDate();

    var bY = b.getFullYear();
    var bM = b.getMonth();
    var bD = b.getDate();

    return bY <= aY || bM <= aM || bD <= aD || same;
}

/* isLTE */
function isLTE(a, b, isHebrewCal) {
    if (isHebrewCal) {
        return isHLTE(a, b);
    } else {
        return isXLTE(a, b);
    }
}

function isXLTE(a, b) {
    return a.diffDays(b) > -1;
}

function isHLTE(a, b) {
    var same = a.isSameDate(b);

    var aY = a.getFullYear();
    var aM = a.getMonth();
    var aD = a.getDate();

    var bY = b.getFullYear();
    var bM = b.getMonth();
    var bD = b.getDate();

    return aY <= bY || aM <= bM || aD <= bD || same;
}

function fromTo(a, b) {
  const days = [];
  let from = +a, to = +b;
  for (; from <= to; from = new XDate(from, true).addDays(1).getTime()) {
    days.push(new XDate(from, true));
  }
  return days;
}

function hfromTo(a, b) {
    const days = [];
    let from = +a.greg(), to = +b.greg();
    for (; from <= to; from = new XDate(from, true).addDays(1).getTime()) {
        days.push(new Hebcal.HDate(new Date(from)));
    }
    return days;
}

function month(xd) {
  const year = xd.getFullYear(), month = xd.getMonth();
  const days = new Date(year, month + 1, 0).getDate();

  const firstDay = new XDate(year, month, 1, 0, 0, 0, true);
  const lastDay = new XDate(year, month, days, 0, 0, 0, true);

  return fromTo(firstDay, lastDay);
}

function weekDayNames(firstDayOfWeek = 0) {
  let weekDaysNames = XDate.locales[XDate.defaultLocale].dayNamesShort;
  const dayShift = firstDayOfWeek % 7;
  if (dayShift) {
    weekDaysNames = weekDaysNames.slice(dayShift).concat(weekDaysNames.slice(0, dayShift));
  }
  return weekDaysNames;
}

function page(xd, firstDayOfWeek) {
  const days = month(xd);
  let before = [], after = [];

  const fdow = ((7 + firstDayOfWeek) % 7) || 7;
  const ldow = (fdow + 6) % 7;

  firstDayOfWeek = firstDayOfWeek || 0;

  const from = days[0].clone();
  if (from.getDay() !== fdow) {
    from.addDays(-(from.getDay() + 7 - fdow) % 7);
  }

  const to = days[days.length - 1].clone();
  const day = to.getDay();
  if (day !== ldow) {
    to.addDays((ldow + 7 - day) % 7);
  }

  if (isLTE(from, days[0])) {
    before = fromTo(from, days[0]);
  }

  if (isGTE(to, days[days.length - 1])) {
    after = fromTo(days[days.length - 1], to);
  }

  return before.concat(days.slice(1, days.length - 1), after);
}

function hpage(hd, firstDayOfWeek) {
    const days = hd.getMonthObject().days;
    let before = [], after = [];

    var firstDay = _.cloneDeep(days[0]);
    var from = firstDay.onOrBefore(0);

    var lastDay = _.cloneDeep(days[days.length - 1]);
    var to = lastDay.onOrAfter(6);

    if (isLTE(from, days[0], true)) {
        before = hfromTo(from, days[0]);
    }

    if (isGTE(to, days[days.length - 1], true)) {
        after = hfromTo(days[days.length - 1], to);
    }

    return before.concat(days.slice(1, days.length - 1), after);
}

function hDateToMonthYear(date) {
  return date.getMonthObject().year.toString() + " " + date.getMonthObject().month.toString();
}

function gregToYearMonthDay(date) {
  var mm = date.getMonth() + 1; // getMonth() is zero-based
  var dd = date.getDate();

  return [date.getFullYear(), (mm>9 ? '' : '0') + mm, (dd>9 ? '' : '0') + dd].join('-');
}

module.exports = {
  weekDayNames,
  sameMonth,
  sameDate,
  month,
  page,
  fromTo,
  hfromTo,
  isLTE,
  isGTE,
  hDateToMonthYear,
  gregToYearMonthDay,
  hpage
};

import React, {Component} from 'react';
import {
  View,
  ViewPropTypes
} from 'react-native';
import PropTypes from 'prop-types';

import XDate from 'xdate';
import Hebcal from 'hebcal'
import dateutils from '../dateutils';
import {dateToData, parseDate} from '../interface';
import styleConstructor from './style';
import Day from './day/basic';
import UnitDay from './day/period';
import MultiDotDay from './day/multi-dot';
import MultiPeriodDay from './day/multi-period';
import SingleDay from './day/custom';
import CalendarHeader from './header';
import shouldComponentUpdate from './updater';
import _ from 'lodash';

//Fallback when RN version is < 0.44
const viewPropTypes = ViewPropTypes || View.propTypes;

const EmptyArray = [];

class Calendar extends Component {
  static propTypes = {
    // Specify theme properties to override specific styles for calendar parts. Default = {}
    theme: PropTypes.object,
    // Collection of dates that have to be marked. Default = {}
    markedDates: PropTypes.object,

    // Specify style for calendar container element. Default = {}
    style: viewPropTypes.style,
    // Initially visible month. Default = Date()
    current: PropTypes.any,
    // Minimum date that can be selected, dates before minDate will be grayed out. Default = undefined
    minDate: PropTypes.any,
    // Maximum date that can be selected, dates after maxDate will be grayed out. Default = undefined
    maxDate: PropTypes.any,

    // If firstDay=1 week starts from Monday. Note that dayNames and dayNamesShort should still start from Sunday.
    firstDay: PropTypes.number,

    // Date marking style [simple/period/multi-dot/multi-period]. Default = 'simple' 
    markingType: PropTypes.string,

    // Hide month navigation arrows. Default = false
    hideArrows: PropTypes.bool,
    // Display loading indicador. Default = false
    displayLoadingIndicator: PropTypes.bool,
    // Do not show days of other months in month page. Default = false
    hideExtraDays: PropTypes.bool,

    // Handler which gets executed on day press. Default = undefined
    onDayPress: PropTypes.func,
    // Handler which gets executed on day long press. Default = undefined
    onDayLongPress: PropTypes.func,
    // Handler which gets executed when visible month changes in calendar. Default = undefined
    onMonthChange: PropTypes.func,
    onVisibleMonthsChange: PropTypes.func,
    // Replace default arrows with custom ones (direction can be 'left' or 'right')
    renderArrow: PropTypes.func,
    // Provide custom day rendering component
    dayComponent: PropTypes.any,
    // Month format in calendar title. Formatting values: http://arshaw.com/xdate/#Formatting
    monthFormat: PropTypes.string,
    // Disables changing month when click on days of other months (when hideExtraDays is false). Default = false
    disableMonthChange: PropTypes.bool,
    //  Hide day names. Default = false
    hideDayNames: PropTypes.bool,
    // Disable days by default. Default = false
    disabledByDefault: PropTypes.bool,
    // Show week numbers. Default = false
    showWeekNumbers: PropTypes.bool,
    // Handler which gets executed when press arrow icon left. It receive a callback can go back month
    onPressArrowLeft: PropTypes.func,
    // Handler which gets executed when press arrow icon left. It receive a callback can go next month
    onPressArrowRight: PropTypes.func,
    // Bool to use Hebrew calendar rather then Gregorian
    hebrewCalendar: PropTypes.bool
  };

  constructor(props) {
    super(props);
    this.style = styleConstructor(this.props.theme);
    let currentMonth;
    if (props.current) {
      currentMonth = parseDate(props.current, props.hebrewCalendar);
    } else {
      currentMonth = props.hebrewCalendar ? Hebcal.HDate() : XDate();
    }
    this.state = {
      currentMonth
    };

    this.updateMonth = this.updateMonth.bind(this);
    this.addMonth = this.addMonth.bind(this);
    this.pressDay = this.pressDay.bind(this);
    this.longPressDay = this.longPressDay.bind(this);
    this.shouldComponentUpdate = shouldComponentUpdate;
  }

  componentWillReceiveProps(nextProps) {
    const current = parseDate(nextProps.current, nextProps.hebrewCalendar);
    if (this.isDiffCurrent(current, nextProps)) {
      this.setState({
        currentMonth: nextProps.hebrewCalendar ? _.cloneDeep(current) : current.clone()
      });
    }
  }

  isDiffCurrent(current, nextProps) {
    if (nextProps.hebrewCalendar) {
      return (current && current.toString() !== this.state.currentMonth.toString());
    } else {
      return (current && current.toString('yyyy MM') !== this.state.currentMonth.toString('yyyy MM'));
    }

    return false;
  }

  isDayCurrentMonth(day) {
    if (this.props.hebrewCalendar) {
      return (dateutils.hDateToMonthYear(day) === dateutils.hDateToMonthYear(this.state.currentMonth));
    } else {
      return (day.toString('yyyy MM') === this.state.currentMonth.toString('yyyy MM'));
    }

    return false;
  }

  updateMonth(day, doNotTriggerListeners) {
    if (this.isDayCurrentMonth(day)) {
      return;
    }
    var cloned = this.props.hebrewCalendar ? _.cloneDeep(day) : day.clone();
    this.setState({
      currentMonth: cloned,
    }, () => {
      if (!doNotTriggerListeners) {
        const currMont = this.props.hebrewCalendar ? _.cloneDeep(this.state.currentMonth) : this.state.currentMonth.clone();
        if (this.props.onMonthChange) {
          this.props.onMonthChange(dateToData(currMont, this.props.hebrewCalendar));
        }
        if (this.props.onVisibleMonthsChange) {
          this.props.onVisibleMonthsChange([dateToData(currMont, this.props.hebrewCalendar)]);
        }
      }
    });
  }

  _handleDayInteraction(date, interaction) {
    const day = parseDate(date, this.props.hebrewCalendar);
    const minDate = parseDate(this.props.minDate, this.props.hebrewCalendar);
    const maxDate = parseDate(this.props.maxDate, this.props.hebrewCalendar);
    if (!(minDate && !dateutils.isGTE(day, minDate, this.props.hebrewCalendar)) && !(maxDate && !dateutils.isLTE(day, maxDate, this.props.hebrewCalendar))) {
      const shouldUpdateMonth = this.props.disableMonthChange === undefined || !this.props.disableMonthChange;
      if (shouldUpdateMonth) {
        this.updateMonth(day);
      }
      if (interaction) {
        interaction(dateToData(day, this.props.hebrewCalendar));
      }
    }
  }

  pressDay(date) {
    this._handleDayInteraction(date, this.props.onDayPress);
  }

  longPressDay(date) {
    this._handleDayInteraction(date, this.props.onDayLongPress);
  }

  addMonth(count) {
    this.updateMonth(this.props.hebrewCalendar ? Hebcal.HDate(new Date(parseDate(this.state.currentMonth.greg(), false).clone().addMonths(count, true).getTime())) : this.state.currentMonth.clone().addMonths(count, true));
  }

  renderDay(day, id) {
    const minDate = parseDate(this.props.minDate, this.props.hebrewCalendar);
    const maxDate = parseDate(this.props.maxDate, this.props.hebrewCalendar);
    let state = '';
    if (this.props.disabledByDefault) {
      state = 'disabled';
    } else if ((minDate && !dateutils.isGTE(day, minDate, this.props.hebrewCalendar)) || (maxDate && !dateutils.isLTE(day, maxDate, this.props.hebrewCalendar))) {
      state = 'disabled';
    } else if (!dateutils.sameMonth(day, this.state.currentMonth, this.props.hebrewCalendar)) {
      state = 'disabled';
    } else if (dateutils.sameDate(day, XDate(), this.props.hebrewCalendar)) {
      state = 'today';
    }
    let dayComp;
    if ((!dateutils.sameMonth(day, this.state.currentMonth, this.props.hebrewCalendar)) && this.props.hideExtraDays) {
      if (['period', 'multi-period'].includes(this.props.markingType)) {
        dayComp = (<View key={id} style={{flex: 1}}/>);
      } else {
        dayComp = (<View key={id} style={this.style.dayContainer}/>);
      }
    } else {
      const DayComp = this.getDayComponent();
      const date = this.props.hebrewCalendar ? Hebcal.gematriya(day.getDate()) : day.getDate();
      dayComp = (
        <DayComp
          key={id}
          state={state}
          theme={this.props.theme}
          onPress={this.pressDay}
          onLongPress={this.longPressDay}
          date={dateToData(day, this.props.hebrewCalendar)}
          marking={this.getDateMarking(day)}
          hebrewCalendar={this.props.hebrewCalendar}
        >
          {date}
        </DayComp>
      );
    }
    return dayComp;
  }

  getDayComponent() {
    if (this.props.dayComponent) {
      return this.props.dayComponent;
    }

    switch (this.props.markingType) {
    case 'period':
      return UnitDay;
    case 'multi-dot':
      return MultiDotDay;
    case 'multi-period':
      return MultiPeriodDay;
    case 'custom':
      return SingleDay;
    default:
      return Day;
    }
  }

  getDateMarking(day) {
    if (!this.props.markedDates) {
      return false;
    }
    var key = this.props.hebrewCalendar ? dateutils.gregToYearMonthDay(day.greg()) : day.toString('yyyy-MM-dd');
    const dates = this.props.markedDates[key] || EmptyArray;
    if (dates.length || dates) {
      return dates;
    } else {
      return false;
    }
  }

  renderWeekNumber (weekNumber) {
    return <Day key={`week-${weekNumber}`} theme={this.props.theme} marking={{disableTouchEvent: true}} state='disabled'>{weekNumber}</Day>;
  }

  renderWeek(days, id) {
    const week = [];
    days.forEach((day, id2) => {
      week.push(this.renderDay(day, id2));
    }, this);

    if (this.props.showWeekNumbers) {
      week.unshift(this.renderWeekNumber(days[days.length - 1].getWeek()));
    }

    return (<View style={this.style.week} key={id}>{week}</View>);
  }

  lastMonthOfDay(current) {
    if (!this.props.hebrewCalendar) {
      return current.clone().addMonths(1, true).setDate(1).addDays(-1).toString('yyyy-MM-dd');
    } else {
      return parseDate(current.greg(), false).clone().addMonths(1, true).setDate(1).addDays(-1).toString('yyyy-MM-dd');
    }
  }

  render() {
    const days = this.props.hebrewCalendar ? dateutils.hpage(this.state.currentMonth, this.props.firstDay) : dateutils.page(this.state.currentMonth, this.props.firstDay);
    const weeks = [];
    while (days.length) {
      weeks.push(this.renderWeek(days.splice(0, 7), weeks.length));
    }
    let indicator;
    const current = parseDate(this.props.current, this.props.hebrewCalendar);
    if (current) {
      const lastMonthOfDay = this.lastMonthOfDay(current);
      if (this.props.displayLoadingIndicator &&
          !(this.props.markedDates && this.props.markedDates[lastMonthOfDay])) {
        indicator = true;
      }
    }
    return (
      <View style={[this.style.container, this.props.style]}>
        <CalendarHeader
          hebrewCalendar={this.props.hebrewCalendar}
          weekDayNames={this.props.weekDayNames}
          theme={this.props.theme}
          hideArrows={this.props.hideArrows}
          month={this.state.currentMonth}
          addMonth={this.addMonth}
          showIndicator={indicator}
          firstDay={this.props.firstDay}
          renderArrow={this.props.renderArrow}
          monthFormat={this.props.monthFormat}
          hideDayNames={this.props.hideDayNames}
          weekNumbers={this.props.showWeekNumbers}
          onPressArrowLeft={this.props.onPressArrowLeft}
          onPressArrowRight={this.props.onPressArrowRight}
        />
        <View style={this.style.monthView}>{weeks}</View>
      </View>);
  }
}

export default Calendar;

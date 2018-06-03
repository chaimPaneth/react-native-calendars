import {parseDate} from '../interface';

export default function shouldComponentUpdate(nextProps, nextState) {
  const hebrewCalendar = nextProps.hebrewCalendar;
  let shouldUpdate = (nextProps.selected || []).reduce((prev, next, i) => {
    const currentSelected = (this.props.selected || [])[i];
    if (!currentSelected || !next || (!hebrewCalendar && parseDate(currentSelected).getTime() !== parseDate(next).getTime()) || (hebrewCalendar && parseDate(currentSelected).greg().getTime() !== parseDate(next).greg().getTime())) {
      return {
        update: true,
        field: 'selected'
      };
    }
    return prev;
  }, {update: false});

  shouldUpdate = ['markedDates', 'hideExtraDays'].reduce((prev, next) => {
    if (!prev.update && nextProps[next] !== this.props[next]) {
      return {
        update: true,
        field: next
      };
    }
    return prev;
  }, shouldUpdate);

  shouldUpdate = ['minDate', 'maxDate', 'current'].reduce((prev, next) => {
    const prevDate = parseDate(this.props[next], hebrewCalendar);
    const nextDate = parseDate(nextProps[next], hebrewCalendar);
    if (prev.update) {
      return prev;
    } else if (prevDate !== nextDate) {
      if (prevDate && nextDate && (!hebrewCalendar && (prevDate.getTime() === nextDate.getTime())) || (hebrewCalendar && (prevDate.greg().getTime() === nextDate.greg().getTime()))) {
        return prev;
      } else {
        return {
          update: true,
          field: next
        };
      }
    }
    return prev;
  }, shouldUpdate);

  if (nextState.currentMonth !== this.state.currentMonth) {
    shouldUpdate = {
      update: true,
      field: 'current'
    };
  }
  //console.log(shouldUpdate.field, shouldUpdate.update);
  return shouldUpdate.update;
}

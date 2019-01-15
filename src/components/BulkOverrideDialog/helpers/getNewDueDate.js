export default function getNewDueDate(duration, intervalId, dueDate) {
  const date = new Date(dueDate);

  switch (intervalId) {
    case 'Months':
      return date.setMonth(date.getMonth() + parseInt(duration, 10));
    case 'Weeks':
      return date.setDate(date.getDate() + parseInt(duration, 10) * 7);
    case 'Days':
      return date.setDate(date.getDate() + parseInt(duration, 10));
    case 'Hours':
      return date.setHours(date.getHours() + parseInt(duration, 10));
    case 'Minutes':
      return date.setMinutes(date.getMinutes() + parseInt(duration, 10));
    default:
      return date;
  }
}

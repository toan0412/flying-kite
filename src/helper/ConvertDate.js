import { parseISO, differenceInWeeks, format, isSameDay } from 'date-fns'
import { vi } from 'date-fns/locale'

const convertToDayOfWeek = (dateString) => {
  const date = parseISO(dateString)
  const currentDate = new Date()

  // Kiểm tra nếu cùng ngày
  if (isSameDay(currentDate, date)) {
    // Chuyển đổi sang dạng HH:mm
    return format(date, 'HH:mm', { locale: vi })
  }

  // Kiểm tra nếu ngày hiện tại lớn hơn 1 tuần
  if (differenceInWeeks(currentDate, date) > 1) {
    // Chuyển đổi sang dạng dd/MM/yy
    return format(date, 'dd/MM/yy', { locale: vi })
  }

  // Chuyển đổi sang dạng ngày trong tuần (Thứ Hai, Thứ Ba, ...)
  return format(date, 'iiii', { locale: vi })
}

export { convertToDayOfWeek }

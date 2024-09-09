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

  // Chuyển đổi sang dạng ngày trong tuần rút gọn (T2, T3, T4, ...)
  const dayOfWeek = format(date, 'EEEE', { locale: vi })
  const shortDayMap = {
    'Thứ Hai': 'T2',
    'Thứ Ba': 'T3',
    'Thứ Tư': 'T4',
    'Thứ Năm': 'T5',
    'Thứ Sáu': 'T6',
    'Thứ Bảy': 'T7',
    'Chủ Nhật': 'CN'
  }

  return shortDayMap[dayOfWeek] || dayOfWeek
}

export { convertToDayOfWeek }

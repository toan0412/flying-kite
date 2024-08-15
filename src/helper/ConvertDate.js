import { format, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale'; 

const convertToDayOfWeek = (dateString) => {
    return format(parseISO(dateString), 'iiii', { locale: vi });
};

export {convertToDayOfWeek}

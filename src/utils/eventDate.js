export class EventDate {
    constructor({ precision, start, end } = {}) {
        this.precision = precision || 'day'; // 'year', 'month', 'day'
        this.start = start;
        this.end = end;
    }

    format(shortMonth = false) {
        let formatted = EventDate.formatDate(this.start, this.precision, shortMonth);
        if (this.end) {
            formatted += ' – ' + EventDate.formatDate(this.end, this.precision, shortMonth);
        }
        return formatted;
    }

    getStart() {
        return this.start.split('T')[0]; // return date part only (YYYY-MM-DD)
    }

    getEnd() {
        if (this.end) {
            return this.end.split('T')[0]; // return date part only (YYYY-MM-DD)
        }
    }

    getStartPosition() {
        if(!this.start) { return -1 ;}
        const parts = EventDate.splitDate(this.getStart(), true);
        return Math.round((parts.year + (parts.month - 1) / 12) * 100) / 100; // e.g., 1990.25 for April 1990
    }

    getEndPosition() {
        if(this.getEnd()) {
            const parts = EventDate.splitDate(this.getEnd(), true);
            return Math.round((parts.year + (parts.month - 1) / 12) * 100) / 100; // e.g., 1990.25 for April 1990
        }
        else if (this.precision === 'year') {
            return this.getStartPosition() + 1;
        }
        else if (this.precision === 'month') {
            return this.getStartPosition() + 1/12;
        }
        else if (this.precision === 'day') {
            return this.getStartPosition() + 1/365;
        }
    }

    static monthName(m, shortMonth = false) {
        const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        if (shortMonth) {
            return months[(m || 1) - 1].substring(0, 3);
        }
        return months[(m || 1) - 1];
    }

    static formatDate(dateString, precision, shortMonth = false) {
        const parts = EventDate.splitDate(dateString);
        let formattedDate = '';
        if (precision === 'month' || precision === 'day') {
            formattedDate += EventDate.monthName(parts.month, shortMonth) + ' ';
        }
        if (precision === 'day') {
            formattedDate += Number(parts.day) + ', ';
        }
        formattedDate += parts.year;
        return formattedDate;
    }

    static trimPrecision(dateString, precision) {
        if(!dateString) { return null; }
        const parts = EventDate.splitDate(dateString);

        if (precision === "year") return parts.year;
        if (precision === "month") return `${parts.year}-${parts.month || "01"}`;
        return `${parts.year}-${parts.month || "01"}-${parts.day || "01"}`;
    }

    static splitDate(dateString, useInt = false) {
        const datePart = dateString.split('T')[0];
        const parts = datePart.split('-');
        return {
            year: useInt ? parseInt(parts[0], 10) : parts[0],
            month: useInt ? parseInt(parts[1], 10) || 1 : parts[1] || "01",
            day: useInt ? parseInt(parts[2], 10) || 1 : parts[2] || "01"
        };
    }
}

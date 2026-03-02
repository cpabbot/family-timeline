export class EventDate {
    constructor({ precision, start, end } = {}) {
        this.precision = precision || 'day'; // 'year', 'month', 'day'
        this.start = start;
        this.end = end;
    }

    format() {
        let formatted = EventDate.formatDate(this.start, this.precision);
        if (this.end) {
            formatted += ' – ' + EventDate.formatDate(this.end, this.precision);
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
        const parts = EventDate.splitDate(this.getStart());
        return Math.round(parts.year + (parts.month - 1) / 12); // e.g., 1990.25 for April 1990
    }

    getEndPosition() {
        if(this.getEnd()) {
            const parts = EventDate.splitDate(this.getEnd());
            return Math.round(parts.year + (parts.month - 1) / 12); // e.g., 1990.25 for April 1990
        }
        else if (this.precision === 'year') {
            return this.getStartPosition() + 1;
        }
        else if (this.precision === 'month') {
            return this.getStartPosition() + 1/12;
        }
    }

    static monthName(m) {
        const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        return months[(m || 1) - 1];
    }

    static formatDate(dateString, precision) {
        const parts = EventDate.splitDate(dateString);
        let formattedDate = '';
        if (precision === 'month' || precision === 'day') {
            formattedDate += EventDate.monthName(parts.month) + ' ';
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

    static splitDate(dateString) {
        const datePart = dateString.split('T')[0];
        const parts = datePart.split('-');
        return {
            year: parseInt(parts[0], 10),
            month: parseInt(parts[1], 10) || 1,
            day: parseInt(parts[2], 10) || 1
        };
    }
}

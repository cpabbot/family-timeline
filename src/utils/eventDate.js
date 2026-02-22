export class EventDate {
    constructor({ precision, start, end } = {}) {
        this.precision = precision || 'day'; // 'year', 'month', 'day'
        // Accept ISO strings or Date objects
        this.start = start instanceof Date ? start : new Date(start); // Date object
        this.end = end ? (end instanceof Date ? end : new Date(end)) : null;     // Date object (optional)
    }

    format() {
        let formattedDate = this.start.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
        });
        if(this.end) {
            formattedDate += ' - ' + this.end.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
            });
        }
        return formattedDate;
    }

    getStart() {
        return this.start;
    }

    getEnd() {
        if (this.end) {
            return this.end;
        }
        if (this.precision === 'year') {
            return new Date(this.start.getFullYear() + 1, 0, 0);
        }
        if (this.precision === 'month') {
            return new Date(this.start.getFullYear(), this.start.getMonth() + 1, 0);
        }
        return new Date(this.start.getFullYear(), this.start.getMonth(), this.start.getDate() + 1);
    }

    getStartPosition() {
        if(!this.start) { return -1 ;}
        return this.start.getFullYear() + Math.round(this.start.getMonth() / 11 * 100) / 100;
    }

    getEndPosition() {
        let endPosition = this.getEnd().getFullYear() + Math.round(this.getEnd().getMonth() / 11 * 100) / 100;
        if (endPosition - this.getStartPosition() < 0.01) {
            endPosition = this.getStartPosition() + 0.01; // Minimum width for visibility
        }
        return endPosition;
    }
}

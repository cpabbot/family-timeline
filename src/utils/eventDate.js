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
        return this.end;
    }

    getStartPosition() {
        if(!this.start) { return -1 ;}
        return this.start.getFullYear() + Math.round(this.start.getMonth() / 11 * 100) / 100;
    }

    getEndPosition() {
        // console.log("end position", this.end, this.getStartPosition());
        if(this.end) {
            return this.end.getFullYear() + Math.round(this.end.getMonth() / 11 * 100) / 100;
        } else {
            return this.getStartPosition();
        }
    }
}

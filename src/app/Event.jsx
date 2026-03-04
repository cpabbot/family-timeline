import Link from "next/link";
import styles from "./event.module.css";

function Event({ eventID, eventDate, index, date, title, description, timelineStart, timelineEnd, extra_styles, size }) {
  const startPosition = eventDate.getStartPosition();
  const endPosition = eventDate.getEndPosition();
  let totalYears = timelineEnd - timelineStart;
  let leftPosition = ((startPosition - timelineStart) / totalYears) * 100;
  let width = ((endPosition - startPosition) / totalYears) * 100;
  let eventHeight = 8.5;
  let topPosition = index * eventHeight;
  let classSize = "";

  if(size === 'compact') {
    classSize = styles.eventCompact;
    topPosition = index * (eventHeight / 2);
  }


  return (
    <Link href={`/${eventID}/${title.replace(/\s+/g, '-').toLowerCase()}`}>
      <div className={`${styles.event} ${classSize} flex-column no-gap`} style={{ ...extra_styles, left: `${leftPosition}%`, width: `${width}%`, top: `${topPosition}rem` }}>
        <div className={`padded-sm ${styles.dateContainer}`}>
          <span className={styles.eventDate}>{eventDate.format(true)}</span>
        </div>
        <div className={`padded-sm ${styles.titleContainer}`}>
          <h3 className={styles.title}>{title}</h3>
        </div>
      </div>
    </Link>
  );
}

export default Event;

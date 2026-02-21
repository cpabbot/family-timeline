import React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./event.module.css";

function Event({ eventID, start, end, index, date, title, description, timelineStart, timelineEnd, extra_styles, size }) {
  const router = useRouter();

  let totalYears = timelineEnd - timelineStart;
  let leftPosition = ((start - timelineStart) / totalYears) * 100;
  let width = ((end - start) / totalYears) * 100;
  let eventHeight = 8.5;
  let topPosition = index * eventHeight;
  let classSize = "";

  if(size === 'compact') {
    classSize = styles.eventCompact;
    topPosition = index * (eventHeight / 2);
  }


  return (
    <Link href={`/${eventID}/${title.replace(/\s+/g, '-').toLowerCase()}`}>
      <div className={`${styles.event} ${classSize}`} style={{ ...extra_styles, left: `${leftPosition}%`, width: `${width}%`, top: `${topPosition}rem` }}>
        <h3 className={styles.title}>{title}</h3>
        <div className={styles.content}>
          <span className={styles.date}>{date}</span>
          <p>{description}</p>
        </div>
      </div>
    </Link>
  );
}

export default Event;

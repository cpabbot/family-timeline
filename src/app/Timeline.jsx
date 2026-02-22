"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from 'next/navigation';
import styles from "./timeline.module.css";
import Event from "./Event";
import eventService from "../services/event";

function assignEventIndices(events) {
  // Sort by start time for consistency
  const sorted = [...events].sort((a, b) => a.eventDate.getStartPosition() - b.eventDate.getStartPosition());
  const rows = [];
  sorted.forEach(event => {
    let assigned = false;
    // Find the first row where this event can fit (i.e., starts after the last event in that row ends)
    for (let i = 0; i < rows.length; i++) {
      // If the event starts after the last event in this row ends, it can go in this row
      if (event.eventDate.getStartPosition() >= rows[i]) {
        event.index = i;
        rows[i] = event.eventDate.getEndPosition();
        assigned = true;
        break;
      }
    }
    if (!assigned) {
      event.index = rows.length;
      rows.push(event.eventDate.getEndPosition());
    }
  });
  return sorted;
}

function Timeline() {
  const router = useRouter();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const eventsWithIndices = useMemo(() => {
    const result = events.length > 0 ? assignEventIndices(events) : [];
    console.log("Indexed Events:", result);
    return result;
  }, [events]);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const fetchedEvents = await eventService.getEvents();
        setEvents(fetchedEvents);
        console.log("Fetched events:", fetchedEvents);
      } catch (error) {
        console.error("Failed to load events:", error);
      } finally {
        setLoading(false);
      }
    };
    loadEvents();
  }, []);

  // Total timeline range (never changes - based on all events)
  const timelineStart = useMemo(() =>
    eventsWithIndices.length > 0 ? Math.min(eventsWithIndices[0].eventDate.getStartPosition() - 5, 1970.00) : 0,
    [eventsWithIndices]
  );
  const timelineEnd = useMemo(() =>
    eventsWithIndices.length > 0 ? Math.max(eventsWithIndices[eventsWithIndices.length - 1].eventDate.getEndPosition() + 5, 2020.00) : 0,
    [eventsWithIndices]
  );

  // View range (what's currently visible - changes with zoom)
  const [start, setStart] = useState(1950.00);
  const [end, setEnd] = useState(2030.00);
  const [increment, setIncrement] = useState(5);
  const [compact, setCompact] = useState(false);

  // Initialize view range once
  useEffect(() => {
    setStart(timelineStart);
    setEnd(timelineEnd);
  }, [timelineStart, timelineEnd]);

  // Calculate timeline width based on zoom level
  const totalRange = timelineEnd - timelineStart;
  const viewRange = end - start;
  const timelineWidth = (totalRange / viewRange) * 100; // percentage

  let tickmarks = [];
  for (let year = timelineStart; year <= timelineEnd; year += increment) {
    tickmarks.push(year);
  }

  const zoomIn = () => {
    const currentRange = end - start;
    if (currentRange > 20) { // Prevents over-zooming
      const container = document.querySelector(`.${styles.timelineContainer}`);
      const containerWidth = container.clientWidth;
      const scrollCenter = container.scrollLeft + containerWidth / 2;
      const totalWidth = container.scrollWidth;
      
      // Calculate which year is at the center of the viewport
      const centerRatio = scrollCenter / totalWidth;
      const centerYear = timelineStart + (timelineEnd - timelineStart) * centerRatio;
      
      const newRange = currentRange - 10;
      const newStart = centerYear - newRange / 2;
      const newEnd = centerYear + newRange / 2;
      
      setStart(newStart);
      setEnd(newEnd);
      
      // After state updates, reposition scroll to keep centerYear in the center
      setTimeout(() => {
        const newTotalWidth = container.scrollWidth;
        const newCenterRatio = (centerYear - timelineStart) / (timelineEnd - timelineStart);
        const newScrollCenter = newTotalWidth * newCenterRatio;
        container.scrollLeft = newScrollCenter - containerWidth / 2;
      }, 0);
    }
  };

  const zoomOut = () => {
    const container = document.querySelector(`.${styles.timelineContainer}`);
    const containerWidth = container.clientWidth;
    const scrollCenter = container.scrollLeft + containerWidth / 2;
    const totalWidth = container.scrollWidth;
    
    // Calculate which year is at the center of the viewport
    const centerRatio = scrollCenter / totalWidth;
    const centerYear = timelineStart + (timelineEnd - timelineStart) * centerRatio;
    
    const currentRange = end - start;
    const newRange = currentRange + 10;
    // Constrain to timeline bounds
    const newStart = Math.max(timelineStart, centerYear - newRange / 2);
    const newEnd = Math.min(timelineEnd, centerYear + newRange / 2);
    
    setStart(newStart);
    setEnd(newEnd);
    
    // After state updates, reposition scroll to keep centerYear in the center
    setTimeout(() => {
      const newTotalWidth = container.scrollWidth;
      const newCenterRatio = (centerYear - timelineStart) / (timelineEnd - timelineStart);
      const newScrollCenter = newTotalWidth * newCenterRatio;
      container.scrollLeft = newScrollCenter - containerWidth / 2;
    }, 0);
  };

  const createEvent = () => {
    router.push('/create-event');
  };


  if(loading) {
    return <div>Loading events...</div>;
  }

  return (
    <div className={styles.timelineContainer}>
      <div className={styles.zoomContainer}>
        <button onClick={zoomIn}>Zoom In</button>
        <button onClick={zoomOut}>Zoom Out</button>
        <button onClick={() => setCompact(!compact)}>{compact ? "Regular View" : "Compact View"}</button>
        <button onClick={createEvent}>Create an Event</button>
      </div>

      <div className={styles.timelineBar} style={{ width: `${timelineWidth}%` }}>
        {tickmarks.map((year, idx) => (
          <div key={idx} className={styles.tickmark} style={{ left: `${((year - timelineStart) / totalRange) * 100}%` }}>
            <span className={styles.tickmarkMark}></span>
            <span className={styles.tickmarkLabel}>{year}</span>
          </div>
        ))}
      </div>

      <div className={styles.eventsContainer} style={{ width: `${timelineWidth}%` }}>
        {eventsWithIndices.map((event, idx) => (
          <Event
            key={idx}
            eventID={event.id}
            start={event.eventDate.getStartPosition()}
            end={event.eventDate.getEndPosition()}
            index={event.index}
            date={event.date}
            title={event.title}
            description={event.description}
            timelineStart={timelineStart}
            timelineEnd={timelineEnd}
            size={compact ? "compact" : ""}
          />
        ))}
      </div>
    </div>
  );
}

export default Timeline;

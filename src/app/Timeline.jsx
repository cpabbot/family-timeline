"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from 'next/navigation';
import styles from "./timeline.module.css";
import Event from "./Event";
import eventService from "../services/event";
import { FaMagnifyingGlassPlus, FaMagnifyingGlassMinus, FaPlus } from "react-icons/fa6";
import Button from "../components/Button";

function assignEventIndices(events, pixelsPerYear) {
  // Sort by start time for consistency
  const sorted = [...events].sort((a, b) => a.eventDate.getStartPosition() - b.eventDate.getStartPosition());
  
  // Mimimum width for an event in year units (for modifying end positions)
  const minWidthPixels = 80;
  const minWidthYears = pixelsPerYear > 0 ? minWidthPixels / pixelsPerYear : 0;
  
  const rows = []; // array of end positions for each row
  sorted.forEach(event => {
    const endPosition = Math.max(event.eventDate.getEndPosition(), event.eventDate.getStartPosition() + minWidthYears);
    
    let assigned = false;
    // Find the first row where this event can fit (i.e., starts after the last event in that row ends)
    for (let i = 0; i < rows.length; i++) {
      // If the event starts after the last event in this row ends, it can go in this row
      if (event.eventDate.getStartPosition() >= rows[i]) {
        event.index = i;
        rows[i] = endPosition;
        assigned = true;
        break;
      }
    }
    if (!assigned) {
      event.index = rows.length;
      rows.push(endPosition);
    }
  });
  return sorted;
}

function Timeline() {
  const router = useRouter();
  const timelineContainerRef = useRef(null);
  const lastZoomTimeRef = useRef(0);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [start, setStart] = useState(1950.00);
  const [end, setEnd] = useState(2030.00);
  const [compact, setCompact] = useState(false);

  // Load compact setting from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("compactView");
    if (saved !== null) {
      setCompact(JSON.parse(saved));
    }
  }, []);

  const pixelsPerYear = useMemo(() => {
    const container = timelineContainerRef.current;
    const viewRange = end - start;
    if (container && container.clientWidth > 0 && viewRange > 0) {
      return container.clientWidth / viewRange;
    }
    return 0;
  }, [end, start]);

  const eventsWithIndices = useMemo(() => {
    const result = events.length > 0 ? assignEventIndices(events, pixelsPerYear) : [];
    console.log("Indexed Events:", result);
    return result;
  }, [events, pixelsPerYear]);

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

  // Initialize view range once
  useEffect(() => {
    setStart(timelineStart);
    setEnd(timelineEnd);
  }, [timelineStart, timelineEnd]);

  // Handle trackpad pinch and Ctrl+scroll zoom
  useEffect(() => {
    const container = timelineContainerRef.current;
    if (!container) return;

    const ZOOM_THROTTLE_MS = 30;

    const handleWheel = (event) => {
      // Detect pinch/zoom: ctrlKey is set by browsers on trackpad pinch
      // Also works with Ctrl+scroll or Cmd+scroll manually
      if (!(event.ctrlKey || event.metaKey)) return;

      event.preventDefault();
      
      // Throttle zoom events to reduce sensitivity
      const now = Date.now();
      if (now - lastZoomTimeRef.current < ZOOM_THROTTLE_MS) {
        return;
      }
      lastZoomTimeRef.current = now;

      // Pinch in: deltaY < 0
      // Pinch out: deltaY > 0
      if (event.deltaY < 0) {
        zoomIn(1);
      } else if (event.deltaY > 0) {
        zoomOut(1);
      }
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => container.removeEventListener("wheel", handleWheel);
  }, [start, end, timelineStart, timelineEnd]);

  // Calculate timeline width based on zoom level
  const totalRange = timelineEnd - timelineStart;
  const viewRange = end - start;
  const timelineWidth = (totalRange / viewRange) * 100; // percentage

  const increment = useMemo(() => {
    if (pixelsPerYear >= 80) { return 1; }
    if (pixelsPerYear >= 35) { return 2; }
    return 4;
  }, [pixelsPerYear]);

  const tickmarks = useMemo(() => {
    if (totalRange <= 0) { return []; }

    const marks = [];
    const firstTick = Math.ceil(timelineStart / increment) * increment;

    for (let year = firstTick; year <= timelineEnd; year += increment) {
      marks.push(Number(year.toFixed(2)));
    }

    return marks;
  }, [timelineStart, timelineEnd, increment, totalRange]);

  // zoom factor - number of years to remove from the view range on each zoom in
  const zoomIn = (zoomFactor = 10) => {
    const currentRange = end - start;
    if (currentRange > 20) { // Prevents over-zooming
      const container = timelineContainerRef.current;
      const containerWidth = container.clientWidth;
      const scrollCenter = container.scrollLeft + containerWidth / 2;
      const totalWidth = container.scrollWidth;
      
      // Calculate which year is at the center of the viewport
      const centerRatio = scrollCenter / totalWidth;
      const centerYear = timelineStart + (timelineEnd - timelineStart) * centerRatio;
      
      const newRange = currentRange - zoomFactor;
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

  // zoomFactor - number of years to add to the view range on each zoom out
  const zoomOut = (zoomFactor = 10) => {
    const container = timelineContainerRef.current;
    const containerWidth = container.clientWidth;
    const scrollCenter = container.scrollLeft + containerWidth / 2;
    const totalWidth = container.scrollWidth;
    
    // Calculate which year is at the center of the viewport
    const centerRatio = scrollCenter / totalWidth;
    const centerYear = timelineStart + (timelineEnd - timelineStart) * centerRatio;
    
    const currentRange = end - start;
    const newRange = currentRange + zoomFactor;
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
    <div ref={timelineContainerRef} className={styles.timelineContainer}>
      <div className={`flex-column ${styles.zoomContainer}`}>
        <Button onClick={() => zoomIn()} type="action"><FaMagnifyingGlassPlus /></Button>
        <Button onClick={() => zoomOut()} type="action"><FaMagnifyingGlassMinus /></Button>
        <Button onClick={createEvent} type="action"><FaPlus /> Create an Event</Button>
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
            eventDate={event.eventDate}
            index={event.index}
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

"use client";

import { useState, useEffect } from "react";
import { getEvent, updateEvent } from "../../../services/event";
import styles from "./event-page.module.css";
import EventForm from "../../../components/EventForm";

export default function EventPage({ params }) {
  const [event, setEvent] = useState();

  useEffect(() => {
    async function fetchEvent() {
      try {
        const eventData = await getEvent(params["eventID"]);
        console.log("Fetched event data:", eventData.eventDate.start);
        setEvent(eventData);
      } catch (error) {
        console.error("Failed to fetch event:", error);
      }
    }
    fetchEvent();
  }, [params]);

  const handleSaveDate = async ({ title, description, eventDate }) => {
    console.log("Saving event with data:", { title, description, eventDate });
    try {
      await updateEvent(params["eventID"], {
        title: title,
        description: description,
        eventDate: eventDate
      });
      setEvent({
        ...event,
        title,
        description,
        eventDate
      });
    } catch (error) {
      console.error("Failed to create event:", error);
    }
  };

  if (!event) {
    return <div className={styles.container}>Loading...</div>;
  }
  return (
    <EventForm event={event} onSave={handleSaveDate} />
  );
}

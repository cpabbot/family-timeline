"use client";

import { useState, useEffect } from "react";
import { getEvent, updateEvent, deleteEvent } from "../../../services/event";
import styles from "./event-page.module.css";
import EventForm from "../../../components/EventForm";
import Button from "../../../components/Button";
import { useRouter } from "next/navigation";

export default function EventPage({ params }) {
  const router = useRouter();
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

  const handleDelete = async () => {
    try {
      await deleteEvent(params["eventID"]);
      router.push("/"); // Redirect to home page after deletion
    } catch (error) {
      console.error("Failed to delete event:", error);
    }
  }

  if (!event) {
    return <div className={styles.container}>Loading...</div>;
  }
  return (
    <div>
      <EventForm event={event} onSave={handleSaveDate} />
      <main className="container">
        <p>{event?.description || "New event description"}</p>
        <Button type="delete" onClick={handleDelete}>Delete Event</Button>
      </main>
    </div>
  );
}

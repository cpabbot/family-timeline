"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getEvent, updateEvent } from "../../../services/event";
import { EventDate } from "../../../utils/eventDate";
import styles from "./event-page.module.css";
import BackButton from "../../../components/BackButton";
import Button from "../../../components/Button";

export default function EventPage({ params }) {
  const router = useRouter();
  
  const [event, setEvent] = useState();
  const [isEditing, setIsEditing] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState();
  const [precision, setPrecision] = useState("day");

  useEffect(() => {
    async function fetchEvent() {
      try {
        const eventData = await getEvent(params["eventID"]);
        console.log("Fetched event data:", eventData.eventDate.start);
        setEvent(eventData);
        setStartDate(eventData.eventDate.start.toISOString().split('T')[0]);
        setEndDate(eventData.eventDate.end ? eventData.eventDate.end.toISOString().split('T')[0] : null);
        setPrecision(eventData.eventDate.precision);
      } catch (error) {
        console.error("Failed to fetch event:", error);
      }
    }
    fetchEvent();
  }, [params]);

  const handleSaveDate = async () => {
    try {
      const newEventDate = new EventDate({
        precision: precision,
        start: startDate,
        end: endDate
      });
      let updatedEvent = { ...event, eventDate: newEventDate };
      await updateEvent(params["eventID"], { ...event, eventDate: newEventDate });
      setEvent(updatedEvent);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to save event:", error);
    }
  }

  const eventDateBlock = isEditing ? (
    <div>
    <select defaultValue={event?.eventDate?.precision} onChange={(e) => setPrecision(e.target.value)}>
      <option value="year">Year</option>
      <option value="month">Month</option>
      <option value="day">Day</option>
    </select>
    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
    </div>
  ) : (
    <span className={styles.date}>{event?.eventDate.format()}</span>
  )

  if (!event) {
    return <div className={styles.container}>Loading...</div>;
  }

  return (
    <div className="container">
      <div className={styles.header}>
        <div className="container flex-row">
          <BackButton href="/" />
          <div className="flex-column grow">
            <h1 className={"title"}>{event.title}</h1>
            {eventDateBlock}
            <span className={styles.date}>{event.date}</span>
          </div>
          <Button text={isEditing ? "Save" : "Edit Event"} onClick={isEditing ? handleSaveDate : () => setIsEditing(true)} />
        </div>
      </div>
      <div className="container">
        <p>{event.description}</p>
      </div>
    </div>
  );
}

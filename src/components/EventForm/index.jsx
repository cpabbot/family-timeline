"use client";

import { useState, useEffect } from "react";
// import { getEvent, updateEvent } from "../../../services/event";
import { EventDate } from "../../utils/eventDate";
import styles from "./eventForm.module.css";
import BackButton from "/src/components/BackButton";
import Button from "../../components/Button";

export default function EventForm({ event, onSave, isNewEvent = false }) {
  const [isEditing, setIsEditing] = useState(isNewEvent);
  const [title, setTitle] = useState(event?.title || "");
  const [description, setDescription] = useState(event?.description || "");
  const [startDate, setStartDate] = useState(
    event?.eventDate?.start ? event.eventDate.start.toISOString().split('T')[0] : ""
  );
  const [endDate, setEndDate] = useState(
    event?.eventDate?.end ? event.eventDate.end.toISOString().split('T')[0] : null
  );
  const [precision, setPrecision] = useState(event?.eventDate?.precision || "day");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const eventDate = new EventDate({
      precision,
      start: startDate,
      end: endDate
    });
    
    await onSave({
      title,
      description,
      eventDate
    });
  };

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

  if (!event && !isNewEvent) {
    return <div className={styles.container}>Loading...</div>;
  }

  return (
    <div className="container">
      <div className={styles.header}>
        <div className="container flex-row">
          <BackButton href="/" />
          <div className="flex-column grow">
            { isEditing ? (
              <input 
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            ) : (
              <h1 className={"title"}>{event?.title || "Untitled event"}</h1>
            )}
            {eventDateBlock}
            <span className={styles.date}>{event?.eventDate?.format()}</span>
          </div>
          <Button text={isEditing ? "Save" : "Edit Event"} onClick={isEditing ? handleSubmit : () => setIsEditing(true)} />
        </div>
      </div>
      <div className="container">
        <p>{event?.description || "New event description"}</p>
      </div>
    </div>
  );
}

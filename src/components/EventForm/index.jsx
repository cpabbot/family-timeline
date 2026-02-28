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
  const [isRange, setIsRange] = useState(!!event?.eventDate?.end);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const eventDate = new EventDate({
      precision,
      start: startDate,
      end: isRange ? endDate : null
    });

    await onSave({
      title,
      description,
      eventDate
    });
  };

  // Helper to render the appropriate date input based on precision
  const renderDateInput = (value, onChange, label) => {
    switch (precision) {
      case 'year':
        return (
          <input
            type="number"
            min="1000"
            max="3000"
            value={value ? value.split('-')[0] : ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="YYYY"
            aria-label={label}
            className="input"
          />
        );
      case 'month':
        return (
          <input
            type="month"
            value={value ? value.slice(0, 7) : ''}
            onChange={(e) => onChange(e.target.value)}
            aria-label={label}
          />
        );
      case 'day':
      default:
        return (
          <input
            type="date"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            aria-label={label}
          />
        );
    }
  };

  const eventDateBlock = isEditing ? (
    <div className='flex-column'>
      <div className="flex-row">
        {['year', 'month', 'day'].map((p) => (
          <label key={p} className={`${styles.radioLabel} ${precision === p ? styles.selected : ''}`}>
            <input
              type="radio"
              name="precision"
              value={p}
              checked={precision === p}
              onChange={(e) => setPrecision(e.target.value)}
            />
            {p.charAt(0).toUpperCase() + p.slice(1)}
          </label>
        ))}
      </div>

      <div className="flex-column input-group">
        <label>Start Date:</label>
        {renderDateInput(startDate, setStartDate, "Start date")}
      </div>

      <div className={styles.rangeToggle}>
        <label>
          <input
            type="checkbox"
            checked={isRange}
            onChange={(e) => {
              setIsRange(e.target.checked);
              if (!e.target.checked) setEndDate(null);
            }}
          />
          {' '}Date Range
        </label>
      </div>

      {isRange && (
        <div className={styles.dateField}>
          <label>End Date:</label>
          {renderDateInput(endDate, setEndDate, "End date")}
        </div>
      )}
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
                name="titleInput"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={`input ${styles.titleInput}`}
                placeholder="Event Title"
              />
            ) : (
              <h1 className={"title"}>{event?.title || "Untitled event"}</h1>
            )}
            {eventDateBlock}
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

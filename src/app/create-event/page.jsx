"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createEvent } from "../../services/event";
import styles from "./create-event.module.css";
import { EventDate } from "../../utils/eventDate";
import EventForm from "../../components/EventForm";

export default function CreateEvent() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    precision: "",
    start: "",
    end: ""
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createEvent({
        title: formData.title,
        description: formData.description,
        eventDate: {
          precision: formData.precision,
          start: formData.start,
          end: formData.end
        }
      });
      router.push('/');
    } catch (error) {
      console.error("Failed to create event:", error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <EventForm onSave={handleSubmit} isNewEvent={true} />
    // <div className={styles.container}>
    //   <h1>Create New Event</h1>
    //   <form onSubmit={handleSubmit} className={styles.form}>
    //     <div className={styles.field}>
    //       <label>Title</label>
    //       <input 
    //         type="text" 
    //         name="title" 
    //         value={formData.title} 
    //         onChange={handleChange}
    //         required 
    //       />
    //     </div>
        
    //     <div className={styles.field}>
    //       <label>Description</label>
    //       <textarea 
    //         name="description" 
    //         value={formData.description} 
    //         onChange={handleChange}
    //         rows={4}
    //       />
    //     </div>

    //     <div className={styles.field}>
    //       <label>Date Precision</label>
    //       <input 
    //         type="text" 
    //         name="precision" 
    //         value={formData.precision} 
    //         onChange={handleChange}
    //         required 
    //       />
    //     </div>

    //     <div className={styles.field}>
    //       <label>Start Year</label>
    //       <input 
    //         type="date" 
    //         name="start" 
    //         value={formData.start} 
    //         onChange={handleChange}
    //         step="0.01"
    //         required 
    //       />
    //     </div>

    //     <div className={styles.field}>
    //       <label>End Year</label>
    //       <input 
    //         type="date" 
    //         name="end" 
    //         value={formData.end} 
    //         onChange={handleChange}
    //         step="0.01"
    //         required 
    //       />
    //     </div>

    //     <div className={styles.buttons}>
    //       <button type="button" onClick={() => router.back()}>← Back</button>
    //       <button type="submit">Create Event</button>
    //       <button type="button" onClick={() => router.push('/')}>Cancel</button>
    //     </div>
    //   </form>
    // </div>
  );
}

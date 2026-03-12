"use client";

import { useRouter } from "next/navigation";
import { createEvent } from "../../services/event";
import EventForm from "../../components/EventForm";

export default function CreateEvent() {
  const router = useRouter();

  const handleSubmit = async ({ title, description, eventDate }) => {
    console.log("Submitting event with data:", { title, description, eventDate });
    try {
      await createEvent({
        title: title,
        description: description,
        eventDate: eventDate
      });
      router.push('/');
    } catch (error) {
      console.error("Failed to create event:", error);
    }
  };

  return (
    <EventForm onSave={handleSubmit} isNewEvent={true} />
  );
}

"use client";

import { useState, useEffect } from "react";
import { getEvent, updateEvent, deleteEvent } from "../../../services/event";
import { createContent, getEventContent, updateContent } from "../../../services/eventContent";
import styles from "./event-page.module.css";
import EventForm from "../../../components/EventForm";
import Button from "../../../components/Button";
import { useRouter } from "next/navigation";

export default function EventPage({ params }) {
  const router = useRouter();
  const [event, setEvent] = useState();
  const [eventContent, setEventContent] = useState(null);
  const [isEditingContent, setIsEditingContent] = useState(false);
  const [contentDraft, setContentDraft] = useState("");

  useEffect(() => {
    async function fetchEventAndContent() {
      try {
        const eventData = await getEvent(params["eventID"]);
        const contentEntries = await getEventContent(params["eventID"]);
        const singleContent = contentEntries.length > 0 ? contentEntries[0] : null;
        console.log("Fetched event data:", eventData.eventDate.start);
        setEvent(eventData);
        setEventContent(singleContent);
        setIsEditingContent(false);
        setContentDraft("");
      } catch (error) {
        console.error("Failed to fetch event:", error);
      }
    }
    fetchEventAndContent();
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

  const handleCreateContent = async (eventObject) => {
    eventObject.preventDefault();
    if (!contentDraft?.trim()) {
      return;
    }

    try {
      const createdContent = await createContent(params["eventID"], {
        type: "description",
        body: contentDraft.trim(),
      });
      console.log("Created content:", createdContent);
      setEventContent(createdContent);
      setIsEditingContent(false);
      setContentDraft("");
    } catch (error) {
      console.error("Failed to create content:", error);
    }
  };

  const handleEditContent = () => {
    setIsEditingContent(true);
    setContentDraft(eventContent?.body || "");
  };

  const handleSaveContent = async (eventObject) => {
    eventObject.preventDefault();
    if (!eventContent || !contentDraft.trim()) {
      setIsEditingContent(false);
      return;
    }

    try {
      const updated = await updateContent(eventContent.id, {
        ...eventContent,
        eventId: params["eventID"],
        type: eventContent.type || "description",
        body: contentDraft.trim(),
      });

      setEventContent(updated);
      setIsEditingContent(false);
      setContentDraft("");
    } catch (error) {
      console.error("Failed to save content:", error);
    }
  };

  const handleSubmitContent = (eventObject) => {
    if (isEditingContent) {
      return handleSaveContent(eventObject);
    }
    return handleCreateContent(eventObject);
  };

  if (!event) {
    return <div className={styles.container}>Loading...</div>;
  }
  return (
    <div>
      <EventForm event={event} onSave={handleSaveDate} />
      <main className="container flex-column gap">
        {/* <p>{event?.description || "New event description"}</p> */}
        {!eventContent || isEditingContent ? (
          <form onSubmit={handleSubmitContent}>
            <textarea
              value={contentDraft}
              onChange={(eventObject) => setContentDraft(eventObject.target.value)}
              placeholder="Add description"
              className={`${styles.contentBody} input`}
            />
            <Button buttonType="submit">Save</Button>
          </form>
        ) : (
          <>
            <p className={styles.contentBody}>{eventContent.body}</p>
            <Button onClick={handleEditContent}>Edit</Button>
          </>
        )}

        
        <Button type="delete" onClick={handleDelete}>Delete Event</Button>
      </main>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { getEvent, updateEvent, deleteEvent } from "../../../services/event";
import { createContent, getEventContent, updateContent } from "../../../services/eventContent";
import styles from "./event-page.module.css";
import EventForm from "../../../components/EventForm";
import Button from "../../../components/Button";
import { useRouter } from "next/navigation";

const EventContent = ({
  eventContent,
  isEditingContent,
  handleSubmitContent,
  selectedContentType,
  setSelectedContentType,
  contentDraft,
  setContentDraft,
  handleEditContent,
}) => {
  const CONTENT_TYPE_OPTIONS = [
    { value: "text", label: "Description" },
    { value: "youtube", label: "YouTube" },
    { value: "google-doc", label: "Google Doc" },
    { value: "link", label: "Link" },
  ];

  const displayedContent = (() => {
    function getYouTubeVideoId(url = "") {
      if (!url) return "";

      // Handles: https://www.youtube.com/watch?v=VIDEO_ID
      const watchIndex = url.indexOf("?v=");
      if (watchIndex !== -1) {
        const from = watchIndex + 3;
        const end = url.indexOf("&", from);
        return end === -1 ? url.slice(from) : url.slice(from, end);
      }

      // Handles: https://www.youtube.com/embed/VIDEO_ID?...
      const embedIndex = url.indexOf("/embed/");
      if (embedIndex !== -1) {
        const from = embedIndex + "/embed/".length;
        const end = url.indexOf("?", from);
        return end === -1 ? url.slice(from) : url.slice(from, end);
      }

      return "";
    }

    switch (eventContent?.type) {
      case "text":
        return <p className={styles.contentBody}>{eventContent.body}</p>;
      case "youtube":
        const videoID = getYouTubeVideoId(eventContent.body);
        return (
          <iframe
            width="560"
            height="315"
            src={`https://www.youtube.com/embed/${videoID}`}
            title="YouTube video player"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerpolicy="strict-origin-when-cross-origin"
            allowfullscreen
          ></iframe>
        );
      default:
        return null;
    }
  })();

  if (!eventContent || isEditingContent) {
    return (
      <form onSubmit={handleSubmitContent} className="flex-column gap full-width">
        <textarea
          name="contentBody"
          value={contentDraft}
          onChange={(eventObject) => setContentDraft(eventObject.target.value)}
          placeholder="Add description"
          className={`${styles.contentBody} input`}
        />

        <div>
          <label htmlFor="contentType">Content type:</label>
          <select
            id="contentType"
            className={'input'}
            value={selectedContentType}
            onChange={(eventObject) => setSelectedContentType(eventObject.target.value)}
          >
            {CONTENT_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <Button buttonType="submit">Save</Button>
      </form>
    );
  }

  return (
    <>
      {displayedContent}
      <Button onClick={handleEditContent}>Edit</Button>
    </>
  );
};

export default function EventPage({ params }) {
  const router = useRouter();
  const [event, setEvent] = useState();
  const [eventContent, setEventContent] = useState(null);
  const [isEditingContent, setIsEditingContent] = useState(false);
  const [contentDraft, setContentDraft] = useState("");
  const [selectedContentType, setSelectedContentType] = useState("text");

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
        setSelectedContentType(singleContent?.type || "text");
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
        type: selectedContentType,
        body: contentDraft.trim(),
      });
      console.log("Created content:", createdContent);
      setEventContent(createdContent);
      setIsEditingContent(false);
      setContentDraft("");
      setSelectedContentType(createdContent.type || "text");
    } catch (error) {
      console.error("Failed to create content:", error);
    }
  };

  const handleEditContent = () => {
    setIsEditingContent(true);
    setContentDraft(eventContent?.body || "");
    setSelectedContentType(eventContent?.type || "text");
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
        type: selectedContentType,
        body: contentDraft.trim(),
      });

      setEventContent(updated);
      setIsEditingContent(false);
      setContentDraft("");
      setSelectedContentType(updated.type || "text");
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
        <EventContent
          eventContent={eventContent}
          isEditingContent={isEditingContent}
          handleSubmitContent={handleSubmitContent}
          selectedContentType={selectedContentType}
          setSelectedContentType={setSelectedContentType}
          contentDraft={contentDraft}
          setContentDraft={setContentDraft}
          handleEditContent={handleEditContent}
        />

        
        <Button type="delete" onClick={handleDelete}>Delete Event</Button>
      </main>
    </div>
  );
}

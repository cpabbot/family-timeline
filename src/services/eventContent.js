import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { db } from "../firebase";

const useMockData = false;

class EventContentService {
  /**
   * Fetch all content entries for a given event
   * @param {string} eventID - ID of the event
   * @returns {Promise<Array>} Array of content entries
   */
  async getEventContent(eventID) {
    try {
      if (useMockData) {
        return [
          {
            id: "content-1",
            eventId: eventID,
            type: "text",
            title: "Mock Content",
            body: "This is mock event content.",
          },
        ];
      }

      const q = query(
        collection(db, "eventContents"),
        where("eventId", "==", eventID)
      );
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map((contentDoc) => ({
        id: contentDoc.id,
        ...contentDoc.data(),
      }));
    } catch (error) {
      console.error("Error fetching event content:", error);
      throw error;
    }
  }

  /**
   * Fetch a single content entry by ID
   * @param {string} contentID - ID of the content entry
   * @returns {Promise<Object>} Content entry
   */
  async getContentById(contentID) {
    try {
      if (useMockData) {
        return {
          id: contentID,
          eventId: "mock-event-id",
          type: "text",
          title: "Mock Content",
          body: "This is mock content by ID.",
        };
      }

      const docRef = doc(db, "eventContents", contentID);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        throw new Error("No such content entry!");
      }

      return {
        id: docSnap.id,
        ...docSnap.data(),
      };
    } catch (error) {
      console.error("Error fetching content by ID:", error);
      throw error;
    }
  }

  /**
   * Create a new content entry linked to an event
   * @param {string} eventID - ID of the event this content belongs to
   * @param {Object} contentData - Content payload
   * @returns {Promise<Object>} Created content entry
   */
  async createContent(eventID, contentData) {
    try {
      const payload = {
        eventId: eventID,
        ...contentData,
      };

      const docRef = await addDoc(collection(db, "eventContents"), payload);
      return { id: docRef.id, ...payload };
    } catch (error) {
      console.error("Error creating content:", error);
      throw error;
    }
  }

  /**
   * Update an existing content entry by ID
   * @param {string} contentID - ID of the content entry
   * @param {Object} updatedContentData - Updated content payload
   * @returns {Promise<Object>} Updated content entry
   */
  async updateContent(contentID, updatedContentData) {
    try {
      const contentRef = doc(db, "eventContents", contentID);
      await setDoc(contentRef, updatedContentData);
      return { id: contentID, ...updatedContentData };
    } catch (error) {
      console.error("Error updating content:", error);
      throw error;
    }
  }

  /**
   * Delete a content entry by ID
   * @param {string} contentID - ID of the content entry
   * @returns {Promise<void>}
   */
  async deleteContent(contentID) {
    try {
      await deleteDoc(doc(db, "eventContents", contentID));
    } catch (error) {
      console.error("Error deleting content:", error);
      throw error;
    }
  }
}

const eventContentService = new EventContentService();

export const getEventContent = (eventID) =>
  eventContentService.getEventContent(eventID);
export const getContent = (contentID) =>
  eventContentService.getContentById(contentID);
export const createContent = (eventID, contentData) =>
  eventContentService.createContent(eventID, contentData);
export const updateContent = (contentID, updatedContentData) =>
  eventContentService.updateContent(contentID, updatedContentData);
export const deleteContent = (contentID) =>
  eventContentService.deleteContent(contentID);

export default eventContentService;
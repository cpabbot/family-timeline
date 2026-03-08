import { getFirestore, collection, getDoc, getDocs, addDoc, setDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase"
import { EventDate } from "../utils/eventDate";
import { getEventContent } from "./eventContent";

const useMockData = false;

class EventService {
  /**
   * Fetch all events
   * @returns {Promise<Array>} Array of event objects
   */
  async getEvents() {
    try {
      if (useMockData) {
        return [
          { id: 1, start: 2001.00, end: 2002.00, title: "title", description: "description", eventDate: new EventDate({ precision: 'month', start: '2001-05', end: null }) },
          { id: 2, start: 2005.00, end: 2010.00, title: "Another Event", description: "This is another event description.", eventDate: new EventDate({ precision: 'year', start: '2005-01', end: '2010-12' }) },
          { id: 3, start: 2001.00, end: 2003.00, title: "Third Event", description: "Details about the third event go here.", eventDate: new EventDate({ precision: 'year', start: '2001-01', end: '2003-12' }) },
          { id: 4, start: 1995.00, end: 2007.00, title: "Long Event", description: "Information about the fourth event.", eventDate: new EventDate({ precision: 'year', start: '1995-01', end: '2007-12' }) },
          { id: 5, start: 1950.00, end: 1951.00, title: "Old Event", description: "Description of the old event.", eventDate: new EventDate({ precision: 'year', start: '1950-01', end: '1951-12' }) }
        ];
      }

      const querySnapshot = await getDocs(collection(db, "events"));
      const events = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return { 
          id: doc.id, 
          ...data,
          eventDate: new EventDate(data.eventDate)
        };
      });
      return events;
    } catch (error) {
      console.error('Error fetching events:', error);
      throw error;
    }
  }

  /**
   * Fetch single event by ID
   * @param {string} eventID - ID of the event to fetch
   * @returns {Promise<Object>} Event object
   */
  async getEventById(eventID, options = {}) {
    try {
      const include = Array.isArray(options.include) ? options.include : [];
      const includeContent = include.includes("content");

      if (useMockData) {
        const mockEvent = {
          id: eventID,
          start: 2001.00,
          end: 2002.00,
          title: "Mock Event",
          description: "This is a mock event description.",
          eventDate: new EventDate({ precision: 'month', start: '2001-06', end: null })
        };

        if (includeContent) {
          mockEvent.content = await getEventContent(eventID);
        }

        return mockEvent;
      }

      const docRef = doc(db, "events", eventID);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        let event = {
          id: docSnap.id, ...docSnap.data(),
          eventDate: new EventDate(docSnap.data().eventDate)
        };
        if (includeContent) {
          event.content = await getEventContent(eventID);
        }

        console.log(event)
        return event;
      } else {
        throw new Error("No such event!");
      }
    } catch (error) {
      console.error('Error fetching event by ID:', error);
      throw error;
    }
  }

  /**
   * Create a new event
   * @param {Object} eventData - Data for the new event
   * @returns {Promise<Object>} Created event object
   */
  async createEvent(eventData) {
    try {
      const docRef = await addDoc(collection(db, "events"), eventData);
      return { id: docRef.id, ...eventData };
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  }

  /**
   * Update an event by ID
   * @param {string} eventID - ID of the event to update
   * @param {Object} updatedEventData - Updated event data
   * @returns {Promise<Object>} Updated event object
   */
  async updateEvent(eventID, updatedEventData) {
    try {
      const eventRef = doc(db, "events", eventID);
      const eventDate = { 
        precision: updatedEventData.eventDate.precision,
        start: updatedEventData.eventDate.getStart(),
        end: updatedEventData.eventDate.getEnd() ?? null
       };
       updatedEventData.eventDate = eventDate;
      await setDoc(eventRef, updatedEventData);
      return { id: eventID, ...updatedEventData };
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  }

  /**
   * Delete an event by ID
   * @param {string} eventID - ID of the event to delete
   * @returns {Promise<void>}
   */
  async deleteEvent(eventID) {
    try {
      await deleteDoc(doc(db, "events", eventID));
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
  }
}

const eventService = new EventService();

// Named exports for convenience
export const createEvent = (eventData) => eventService.createEvent(eventData);
export const getEvents = () => eventService.getEvents();
export const getEvent = (eventID, options) => eventService.getEventById(eventID, options);
export const updateEvent = (eventID, updatedEventData) => eventService.updateEvent(eventID, updatedEventData);
export const deleteEvent = (eventID) => eventService.deleteEvent(eventID);
export default eventService;

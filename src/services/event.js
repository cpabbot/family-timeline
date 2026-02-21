import { getFirestore, collection, getDoc, getDocs, addDoc, setDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase"
import { EventDate } from "../utils/eventDate";

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
          { id: 1, start: 2001.00, end: 2002.00, date: "June 2001", title: "title", description: "description", eventDate: new EventDate({ type: 'single', precision: 'month', start: new Date(2001, 5), end: null }) },
          { id: 2, start: 2005.00, end: 2010.00, date: "2005 - 2010", title: "Another Event", description: "This is another event description.", eventDate: new EventDate({ type: 'range', precision: 'year', start: new Date(2005, 0), end: new Date(2010, 11) }) },
          { id: 3, start: 2001.00, end: 2003.00, date: "2001 - 2003", title: "Third Event", description: "Details about the third event go here.", eventDate: new EventDate({ type: 'range', precision: 'year', start: new Date(2001, 0), end: new Date(2003, 11) }) },
          { id: 4, start: 1995.00, end: 2007.00, date: "1995 - 2007", title: "Long Event", description: "Information about the fourth event.", eventDate: new EventDate({ type: 'range', precision: 'year', start: new Date(1995, 0), end: new Date(2007, 11) }) },
          { id: 5, start: 1950.00, end: 1951.00, date: "1950 - 1951", title: "Old Event", description: "Description of the old event.", eventDate: new EventDate({ type: 'range', precision: 'year', start: new Date(1950, 0), end: new Date(1951, 11) }) }
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
  async getEventById(eventID) {
    try {
      if (useMockData) {
        return { id: eventID, start: 2001.00, end: 2002.00, date: "June 2001", title: "Mock Event", description: "This is a mock event description." };
      }

      const docRef = doc(db, "events", eventID);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        let event = {
          id: docSnap.id, ...docSnap.data(),
          eventDate: new EventDate(docSnap.data().eventDate)
        };
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
        start: updatedEventData.eventDate.getStart().toISOString(),
        end: updatedEventData.eventDate.getEnd() ? updatedEventData.eventDate.getEnd().toISOString() : null
       };
       updatedEventData.eventDate = eventDate;
      await setDoc(eventRef, updatedEventData);
      return { id: eventID, ...updatedEventData };
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  }
}

const eventService = new EventService();

// Named exports for convenience
export const createEvent = (eventData) => eventService.createEvent(eventData);
export const getEvents = () => eventService.getEvents();
export const getEvent = (eventID) => eventService.getEventById(eventID);
export const updateEvent = (eventID, updatedEventData) => eventService.updateEvent(eventID, updatedEventData);

export default eventService;

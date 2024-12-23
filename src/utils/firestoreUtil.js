import {addDoc, collection, doc, getDocs, orderBy, query, serverTimestamp, updateDoc, where} from 'firebase/firestore';
import {db} from '../config/firebaseConfig';
import {RequestStatus} from "./RequestStatus";

export const fetchUsers = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, "users"));
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error("Error fetching users:", error);
        throw error;
    }
};

/**
 * Function to send a new request to Firestore.
 * @param {Object} requestData - The request data object containing type, phone, name, and user_email.
 * @returns {Promise} - Resolves with the document reference or rejects with an error.
 */
export const sendRequest = async (requestData) => {
    try {
        const docRef = await addDoc(collection(db, "user_requests"), {
            ...requestData,
            created_at: serverTimestamp(),
            status: "waiting",
        });
        console.log("Request sent with ID: ", docRef.id);
        return docRef;
    } catch (error) {
        console.error("Error sending request: ", error);
        throw new Error("Failed to send request.");
    }
};

export const fetchRequests = async ({userEmail, userRole}) => {
    try {
        // Base query
        let baseQuery = collection(db, 'user_requests');
        const conditions = [];

        // If userRole is not 'Agronomist' and userEmail is valid, filter by user email
        if (!['Agronomist', 'Admin'].includes(userRole) && userEmail) {
            conditions.push(where('user_email', '==', userEmail));
        }

        // Add ordering
        conditions.push(orderBy('created_at', 'desc'));

        // Construct the full query
        const q = conditions.length > 0 ? query(baseQuery, ...conditions) : baseQuery;
        const snapshot = await getDocs(q);

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));
    } catch (error) {
        console.error('Error fetching requests:', error);
        throw error;
    }
};

/**
 * Updates request status and creates status history record
 * @param {string} requestId - Request document ID
 * @param {{
 *   status: string,
 *   agronomistEmail?: string,
 *   agronomistPhone?: string,
 *   scheduledDate?: Date,
 *   cancellationReason?: string,
 *   notes?: string
 * }} statusData - Status update data
 */
export const updateRequestStatus = async (requestId, statusData) => {
    try {
        const {status, ...additionalData} = statusData;

        console.log(statusData)
        // Update the request document
        const requestRef = doc(db, 'user_requests', requestId);
        await updateDoc(requestRef, {
            status,
            updated_at: serverTimestamp(),
            ...(status === RequestStatus.APPROVED && {
                agronomist_email: additionalData.agronomist_email,
                agronomist_phone: additionalData.agronomistPhone,
                scheduled_date: additionalData.scheduledDate
            })
        });

        // Create status history record
        await addDoc(collection(db, 'request_status_history'), {
            request_id: requestId,
            status,
            created_at: serverTimestamp(),
            ...additionalData
        });

    } catch (error) {
        console.error('Error updating request status:', error);
        throw new Error('Failed to update request status');
    }
};

/**
 * Fetches status history for a request
 * @param {string} requestId - Request document ID
 */
export const fetchRequestStatusHistory = async (requestId) => {
    try {
        const q = query(
            collection(db, 'request_status_history'),
            where('request_id', '==', requestId)
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            created_at: doc.data().created_at?.toDate()
        }));
    } catch (error) {
        console.error('Error fetching status history:', error);
        throw new Error('Failed to fetch status history');
    }
};
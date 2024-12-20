import {
    addDoc,
    collection,
    getDocs,
    query,
    where,
    orderBy,
    serverTimestamp
} from 'firebase/firestore';import {db} from '../config/firebaseConfig';

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

export const fetchRequests = async ({ userEmail, userRole }) => {
    try {
        // Base query
        let baseQuery = collection(db, 'user_requests');
        const conditions = [];

        // If not an agronomist, filter by user email
        if (userRole !== 'Agronomist') {
            conditions.push(where('user_email', '==', userEmail));
        }

        // Add ordering
        conditions.push(orderBy('created_at', 'desc'));

        // Construct the full query
        const q = query(baseQuery, ...conditions);
        const snapshot = await getDocs(q);

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error fetching requests:', error);
        throw error;
    }
};
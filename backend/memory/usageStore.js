// memory/usageStore.js

let usageData = {};

const usageStore = {

    // Save latest metrics for a user
    setUsage(userId, data) {
        usageData[userId] = {
            ...data,
            lastSeen: new Date().toISOString()
        };
    },

    // Get a single user's latest metrics
    getUsage(userId) {
        return usageData[userId] || null;
    },

    // Get all users under a specific host room
    // Only returns users seen in the last 60 seconds (auto-filters offline users)
    getAllForHost(hostCode) {
        const now = Date.now();
        let result = {};
        for (let userId in usageData) {
            if (usageData[userId].hostCode === hostCode) {
                const lastSeen = new Date(usageData[userId].lastSeen).getTime();
                const secondsAgo = (now - lastSeen) / 1000;
                // Only include users active in last 60 seconds
                if (secondsAgo <= 60) {
                    result[userId] = usageData[userId];
                }
            }
        }
        return result;
    },

    // Get all users who have gone silent (no update in X seconds)
    getStaleUsers(thresholdSeconds = 30) {
        const now = Date.now();
        let stale = [];
        for (let userId in usageData) {
            const lastSeen = new Date(usageData[userId].lastSeen).getTime();
            if ((now - lastSeen) / 1000 > thresholdSeconds) {
                stale.push(userId);
            }
        }
        return stale;
    },

    // Auto-remove stale users from memory
    // Call this on an interval to keep memory clean
    cleanStale(thresholdSeconds = 60) {
        const stale = this.getStaleUsers(thresholdSeconds);
        stale.forEach(userId => delete usageData[userId]);
        if (stale.length > 0) {
            console.log(`Cleaned ${stale.length} stale user(s) from memory`);
        }
    },

    // Remove a user from memory
    removeUser(userId) {
        delete usageData[userId];
    },

    // Clear all users in a room
    clearRoom(hostCode) {
        for (let userId in usageData) {
            if (usageData[userId].hostCode === hostCode) {
                delete usageData[userId];
            }
        }
    },

    // Get total active user count
    getUserCount() {
        return Object.keys(usageData).length;
    },

    // Get a snapshot of all data (useful for debugging)
    getAll() {
        return { ...usageData };
    }
};

// Auto-clean stale users every 60 seconds
setInterval(() => usageStore.cleanStale(60), 60000);

export default usageStore;
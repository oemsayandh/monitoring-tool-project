// memory/usageStore.js

let usageData = {};  

// We create an object containing our functions
const usageStore = {
    setUsage(userId, data) {
        usageData[userId] = data;
    },

    getUsage(userId) {
        return usageData[userId] || null;
    },

    getAllForHost(hostCode) {
        let result = {};
        for (let userId in usageData) {
            if (usageData[userId].hostCode === hostCode) {
                result[userId] = usageData[userId];
            }
        }
        return result;
    }
};

// Now we export it as the "default" so your other files can import it
export default usageStore;
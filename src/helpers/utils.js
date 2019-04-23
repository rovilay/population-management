export const cleanObject = (obj) => {
    const cleanedObject = { ...obj };
    Object.keys(cleanedObject).forEach((key) => {
        if (cleanedObject[key] == null || cleanedObject[key] === undefined) {
            delete cleanedObject[key];
        }
    });

    return cleanedObject;
};

export default cleanObject;

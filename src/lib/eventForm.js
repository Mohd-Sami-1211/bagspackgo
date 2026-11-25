export const EVENT_PARTICIPANT_FIELDS = [
    { id: 'name', label: 'Full Name' },
    { id: 'age', label: 'Age' },
    { id: 'phone', label: 'Mobile Number' },
    { id: 'gender', label: 'Gender' },
    { id: 'nationality', label: 'Nationality' },
    { id: 'idType', label: 'ID Type' },
    { id: 'idNumber', label: 'ID Number' },
    { id: 'idProofImage', label: 'ID Proof Upload' },
];

export function getEventParticipantFields(fields) {
    return EVENT_PARTICIPANT_FIELDS
        .filter(({ id }) => !Array.isArray(fields) || fields.includes(id))
        .map(({ id }) => id);
}

export function getEventCustomFormFields(event) {
    if (event.applicationFormType !== 'customized') return [];

    const enabledIds = new Set();
    return (event.customFormFields || []).filter((field) => {
        if (!field || field.enabled === false || (field.dependsOn && !enabledIds.has(field.dependsOn))) return false;
        enabledIds.add(field.id);
        return true;
    });
}

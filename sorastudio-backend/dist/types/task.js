export const TaskSchema = {
    type: 'object',
    required: ['task_id', 'type', 'payload'],
    properties: {
        task_id: { type: 'string' },
        type: { type: 'string' },
        payload: { type: 'object' }
    },
    additionalProperties: false,
};

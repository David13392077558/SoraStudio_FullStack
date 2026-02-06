"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskSchema = void 0;
exports.TaskSchema = {
    type: 'object',
    required: ['task_id', 'type', 'payload'],
    properties: {
        task_id: { type: 'string' },
        type: { type: 'string' },
        payload: { type: 'object' }
    },
    additionalProperties: false,
};

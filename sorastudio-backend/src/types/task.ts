// 统一任务类型定义与 JSON Schema
export interface TaskPayload {
  [key: string]: any;
}

export interface Task {
  task_id: string; // uuid
  type: string; // 任务类型，例如 video_generation, analyze_video, digital_human
  payload: TaskPayload;
}

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

export default Task;

import { apiPost, apiGet } from "./apiClient";

export function submitTask(videoUrl: string, taskType: string) {
  return apiPost("/ai/submit-task", { videoUrl, taskType });
}

export function getTaskStatus(taskId: string) {
  return apiGet(`/ai/task-status/${taskId}`);
}
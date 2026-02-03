import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const getTasks = () => {
  return axios.get(`${API_BASE_URL}/api/tasks`);
};

export const getTask = (taskId) => {
  return axios.get(`${API_BASE_URL}/api/tasks/${taskId}`);
};

export const submitTask = (taskData) => {
  return axios.post(`${API_BASE_URL}/api/tasks`, taskData);
};

export const getProvidersStatus = () => {
  return axios.get(`${API_BASE_URL}/api/providers/status`);
};

export const getMetrics = (params) => {
  return axios.get(`${API_BASE_URL}/api/metrics`, { params });
};

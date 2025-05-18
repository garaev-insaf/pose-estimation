import axios, { type AxiosInstance, type AxiosRequestConfig } from "axios";
import { successInterceptor } from "./interceptors";

const axiosRequestConfig: AxiosRequestConfig = {
	baseURL: `http://localhost:4000/api`,
	responseType: "json",
	headers: {
		"Content-Type": "application/json",
	},
};

const api: AxiosInstance = axios.create(axiosRequestConfig);

// const chirpApi: AxiosInstance = axios.create(axiosChirpRequestConfig);

api.interceptors.response.use(successInterceptor);

export const customApi = {
	get: <T>(...args: Parameters<typeof api.get<T>>) =>
		api.get<T>(...args).then((responseBody) => responseBody.data),
	post: <T>(...args: Parameters<typeof api.post<T>>) =>
		api.post<T>(...args).then((responseBody) => responseBody.data),
	put: <T>(...args: Parameters<typeof api.put<T>>) =>
		api.put<T>(...args).then((responseBody) => responseBody.data),
	patch: <T>(...args: Parameters<typeof api.patch<T>>) =>
		api.patch<T>(...args).then((responseBody) => responseBody.data),
	delete: <T>(...args: Parameters<typeof api.delete<T>>) =>
		api.delete<T>(...args).then((responseBody) => responseBody.data),
};

export { api };

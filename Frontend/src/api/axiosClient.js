import axios from "axios";

const API_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const axiosClient = axios.create({
    baseURL: API_URL,
    withCredentials: true, // needed for refreshToken httpOnly cookie
});

let accessToken = null;
let onUnauthorized = null;

export const setAccessToken = (token) => {
    accessToken = token;
};

export const getAccessToken = () => {
    return accessToken;
};

export const setOnUnauthorized = (fn) => {
    onUnauthorized = fn;
};

axiosClient.interceptors.request.use((config) => {
    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
});

let isRefreshing = false;
let pendingQueue = [];

const processQueue = (error, token = null) => {
    pendingQueue.forEach((p) => {
        if (error) {
            p.reject(error);
        } else {
            p.resolve(token);
        }
    });

    pendingQueue = [];
};

axiosClient.interceptors.response.use(
    (res) => res,
    async (error) => {
        const originalRequest = error.config;
        const status = error?.response?.status;
        const message = error?.response?.data?.message || "";

        const isAuthRoute =
            originalRequest?.url?.includes("/auth/login") ||
            originalRequest?.url?.includes("/auth/register") ||
            originalRequest?.url?.includes("/auth/refresh");

        if (
            status === 401 &&
            !originalRequest._retry &&
            !isAuthRoute
        ) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    pendingQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        originalRequest.headers.Authorization =
                            `Bearer ${token}`;

                        return axiosClient(originalRequest);
                    })
                    .catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const { data } = await axiosClient.post("/auth/refresh");

                accessToken = data.accessToken;

                processQueue(null, accessToken);

                originalRequest.headers.Authorization =
                    `Bearer ${accessToken}`;

                return axiosClient(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);

                accessToken = null;

                if (onUnauthorized) {
                    onUnauthorized();
                }

                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    },
);

export default axiosClient;
import axios from "axios";

const API_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const axiosClient = axios.create({
    baseURL: API_URL,
    withCredentials: true,
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

// add access token
axiosClient.interceptors.request.use(
    (config) => {
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }

        return config;
    },
    (error) => Promise.reject(error),
);

let isRefreshing = false;
let pendingQueue = [];

const processQueue = (error, token = null) => {
    pendingQueue.forEach(({ resolve, reject }) => {
        if (error) {
            reject(error);
        } else {
            resolve(token);
        }
    });

    pendingQueue = [];
};

// refresh expired access token
axiosClient.interceptors.response.use(
    (response) => response,

    async (error) => {
        const originalRequest = error.config;
        const status = error?.response?.status;

        if (!originalRequest) {
            return Promise.reject(error);
        }

        const isAuthRoute =
            originalRequest.url?.includes("/auth/login") ||
            originalRequest.url?.includes("/auth/register") ||
            originalRequest.url?.includes("/auth/refresh");

        // access token expired
        if (
            status === 401 &&
            !originalRequest._retry &&
            !isAuthRoute
        ) {
            // another request is already refreshing
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    pendingQueue.push({
                        resolve,
                        reject,
                    });
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
                // get new access token using refresh cookie
                const { data } = await axiosClient.post("/auth/refresh");

                const newAccessToken = data.accessToken;

                setAccessToken(newAccessToken);

                // retry waiting requests
                processQueue(null, newAccessToken);

                // retry original request
                originalRequest.headers.Authorization =
                    `Bearer ${newAccessToken}`;

                return axiosClient(originalRequest);
            } catch (refreshError) {
                // refresh token/session is no longer valid
                processQueue(refreshError, null);

                setAccessToken(null);

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
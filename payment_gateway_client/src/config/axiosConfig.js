import axios, { AxiosError, AxiosHeaders } from "axios";

const { REACT_APP_BASE_URL } = process.env;

const axiosInstance = axios.create({
    baseURL: `${REACT_APP_BASE_URL}`,
    headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type" : "application/json"
    },
});

axiosInstance.interceptors.request.use(
    async (config) => {
        // const token = await getItem("jwtToken");
        // if (config.headers)
        //     config.headers.set("Authorization", `Bearer ${token}`);
        return config;
    },
    (error) => Promise.reject(error),
);

axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        // if (error instanceof AxiosError && error.response?.status === 401) {
        //     useAuthStore.setState({ signedInAs: undefined });
        // }
        return Promise.reject(error);
    },
);

export default axiosInstance;
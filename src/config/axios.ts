import axios from "axios";

export const axiosClient = axios.create({
  baseURL: "http://localhost/api/mppd-api/api/",
});

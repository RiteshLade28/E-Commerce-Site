import axios from "axios";



const apiClient = axios.create({
  baseURL: `${process.env.git}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

export default apiClient;

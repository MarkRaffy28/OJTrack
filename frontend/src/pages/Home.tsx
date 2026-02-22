import { useEffect } from "react";
import API from "../api/api";

const Home = () => {

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await API.get("/auth/test");
        console.log(response.data);
      } catch (error) {
        console.error("Error:", error);
      }
    };

    fetchData();
  }, []);

  return (
  <div>
    <h1>Homes</h1>;
    <a href="/register">Register</a>
  </div>
  )
};

export default Home;

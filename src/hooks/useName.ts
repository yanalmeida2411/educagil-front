import { useEffect, useState } from "react";

export const useName = () => {
  const [fullName, setFullName] = useState("");

  useEffect(() => {
    const getUserData = () => {
      const cookies = document.cookie
        .split("; ")
        .reduce((acc: Record<string, string>, current) => {
          const [key, value] = current.split("=");
          acc[key] = decodeURIComponent(value);
          return acc;
        }, {});

      if (cookies.fullName) {
        setFullName(cookies.fullName);
      }
    };
    getUserData();
  }, []);

  return {
    fullName,
  };
};
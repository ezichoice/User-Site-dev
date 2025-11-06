"use client";

import React, { useEffect } from "react";

const SnowFall: React.FC = () => {
  useEffect(() => {
    const createSnowflake = () => {
      const snowflake = document.createElement("div");
      snowflake.className = "snowflake";

      // Randomize properties
      const size = `${Math.random() * 5 + 5}px`;
      const opacity = Math.random() * 0.5 + 0.5;
      const duration = `${Math.random() * 10 + 5}s`;
      const delay = `${Math.random() * 5}s`;
      const translateX = `${Math.random() * 20 - 10}vw`;

      snowflake.style.setProperty("--size", size);
      snowflake.style.setProperty("--opacity", opacity.toString());
      snowflake.style.setProperty("--duration", duration);
      snowflake.style.setProperty("--delay", delay);
      snowflake.style.setProperty("--translate-x", translateX);

      snowflake.style.left = `${Math.random() * 100}vw`;

      // Add the snowflake to the DOM
      document.body.appendChild(snowflake);

      // Remove the snowflake after its animation completes
      setTimeout(() => {
        snowflake.remove();
      }, (parseFloat(duration) + parseFloat(delay)) * 1000);
    };

    // Create snowflakes at an interval
    const snowInterval = setInterval(createSnowflake, 300);

    return () => {
      clearInterval(snowInterval);
    };
  }, []);

  return null;
};

export default SnowFall;

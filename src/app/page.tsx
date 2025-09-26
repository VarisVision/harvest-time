"use client"

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { ApplicationContext } from "@sitecore-marketplace-sdk/client";
import { useMarketplaceClient } from "../utils/hooks/useMarketplaceClient";

function App() {
  const { client, error, isInitialized } = useMarketplaceClient();
  const [appContext, setAppContext] = useState<ApplicationContext>();
  const router = useRouter();

  useEffect(() => {
    if (!error && isInitialized && client) {
      console.log("Marketplace client initialized successfully.");

      // Make a query to retrieve the application context
      client.query("application.context")
        .then((res) => {
          console.log("Success retrieving application.context:", res.data);
          setAppContext(res.data);
        })
        .catch((error) => {
          console.error("Error retrieving application.context:", error);
        });
    } else if (error) {
      console.error("Error initializing Marketplace client:", error);
    }
  }, [client, error, isInitialized]);

  return (
    <div className="flex flex-col justify-center items-center min-h-screen w-full max-w-lg p-4 m-auto">
      <h1 className="text-2xl font-bold mb-8 text-center">Welcome to {appContext?.name || "Harvest Time"}</h1>
      
      <div className="space-y-4 w-full">
        <button
          onClick={() => router.push('/time-entry')}
          className="w-full bg-blue-600 text-white font-bold px-6 py-4 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-3"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path fill="currentColor" d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10s10-4.5 10-10S17.5 2 12 2m4.2 14.2L11 13V7h1.5v5.2l4.5 2.7z"/>
          </svg>
          Track Time
        </button>
        
        <button
          onClick={() => router.push('/todo')}
          className="w-full bg-green-600 text-white font-bold px-6 py-4 rounded-lg hover:bg-green-700 flex items-center justify-center gap-3"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path fill="currentColor" d="M10 17l-4-4l1.41-1.41L10 14.17l6.59-6.59L18 9z"/>
          </svg>
          Todo List
        </button>
      </div>
    </div>
  );
}

export default App;

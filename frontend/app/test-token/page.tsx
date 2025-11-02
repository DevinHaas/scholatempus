"use client";

import { useAuth } from "@clerk/nextjs";
import { useState } from "react";

export default function TestTokenPage() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const [token, setToken] = useState<string | null>(null);

  const fetchToken = async () => {
    const jwt = await getToken();
    setToken(jwt);
  };

  if (!isLoaded) return <div>Loading...</div>;
  if (!isSignedIn) return <div>Please sign in</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Clerk JWT Token</h1>
      <button
        onClick={fetchToken}
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
      >
        Get Token
      </button>

      {token && (
        <div className="mt-4">
          <h2 className="font-semibold mb-2">Your JWT Token:</h2>
          <textarea
            value={token}
            readOnly
            className="w-full h-32 p-2 border rounded font-mono text-sm"
          />
          <p className="text-sm text-gray-600 mt-2">
            Copy this token and use it in your API requests with:
            <br />
            <code>Authorization: Bearer {"{token}"}</code>
          </p>
        </div>
      )}
    </div>
  );
}

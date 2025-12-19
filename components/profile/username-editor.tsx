"use client";

import { useState, useEffect } from "react";

interface UsernameEditorProps {
  initialUsername: string | null;
  initialDisplayName: string;
  canChangeUsername: boolean;
}

export function UsernameEditor({ 
  initialUsername, 
  initialDisplayName, 
  canChangeUsername 
}: UsernameEditorProps) {
  const [username, setUsername] = useState(initialUsername || "");
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [hasChanged, setHasChanged] = useState(!canChangeUsername);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      setError("Username is required");
      return;
    }

    if (username.trim().length < 3) {
      setError("Username must be at least 3 characters");
      return;
    }

    if (username.trim().length > 30) {
      setError("Username must be 30 characters or less");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/profile/username", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim() }),
      });

      const result = await response.json();

      if (!result.success) {
        setError(result.error || "Failed to set username");
        return;
      }

      setDisplayName(result.username);
      setSuccess(true);
      setHasChanged(true);
      setIsEditing(false);
    } catch (err) {
      setError("Failed to update username. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setUsername(initialUsername || "");
    setError(null);
    setIsEditing(false);
  };

  return (
    <div className="space-y-3">
      {/* Display Name Section */}
      <div>
        <dt className="font-bold text-gray-500 uppercase tracking-wider text-xs">
          Display Name
        </dt>
        <dd className="text-white font-medium mt-1 flex items-center gap-2">
          <span 
            className={`${displayName.startsWith("anon#") ? "text-gray-400 italic" : "text-blue-400 font-bold"}`}
          >
            {displayName}
          </span>
          {displayName.startsWith("anon#") && (
            <span className="text-xs text-gray-500">(anonymous)</span>
          )}
        </dd>
      </div>

      {/* Username Editor Section */}
      <div>
        <dt className="font-bold text-gray-500 uppercase tracking-wider text-xs flex items-center gap-2">
          Username
          {hasChanged && (
            <span className="text-xs text-yellow-500 normal-case font-normal">
              (locked - one-time change used)
            </span>
          )}
        </dt>
        
        {!isEditing ? (
          <dd className="mt-1">
            {initialUsername ? (
              <span className="text-blue-400 font-bold">{initialUsername}</span>
            ) : (
              <span className="text-gray-400 italic">Not set</span>
            )}
            
            {canChangeUsername && !hasChanged && (
              <button
                onClick={() => setIsEditing(true)}
                className="ml-3 px-3 py-1 text-xs font-bold uppercase tracking-wider bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                style={{ clipPath: 'polygon(5% 0%, 100% 0%, 95% 100%, 0% 100%)' }}
              >
                {initialUsername ? "Change" : "Set Username"}
              </button>
            )}
          </dd>
        ) : (
          <form onSubmit={handleSubmit} className="mt-2 space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username..."
                disabled={isLoading}
                className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-600 text-white text-sm focus:outline-none focus:border-blue-500 disabled:opacity-50"
                style={{ clipPath: 'polygon(1% 0%, 100% 0%, 99% 100%, 0% 100%)' }}
                maxLength={30}
                minLength={3}
                autoFocus
              />
            </div>
            
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isLoading || !username.trim()}
                className="px-4 py-2 text-xs font-bold uppercase tracking-wider bg-green-600 hover:bg-green-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ clipPath: 'polygon(3% 0%, 100% 0%, 97% 100%, 0% 100%)' }}
              >
                {isLoading ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={isLoading}
                className="px-4 py-2 text-xs font-bold uppercase tracking-wider border border-zinc-600 hover:border-white text-white transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>

            {/* Warning message */}
            <p className="text-xs text-yellow-500 flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              You can only set your username ONCE. Choose wisely!
            </p>
          </form>
        )}

        {/* Error message */}
        {error && (
          <p className="mt-2 text-sm text-red-400 flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </p>
        )}

        {/* Success message */}
        {success && (
          <p className="mt-2 text-sm text-green-400 flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Username set successfully!
          </p>
        )}
      </div>
    </div>
  );
}

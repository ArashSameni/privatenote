import React, { useCallback, useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Encryptor from "../services/Encryptor";

interface NoteData {
  encryptedText: string;
  lastModifiedToken: string;
  salt: string;
  iv: string;
}

const NotePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const initialPassword = (location.state as { password?: string })?.password || "";

  const [loading, setLoading] = useState(true);
  const [readPassword, setReadPassword] = useState(initialPassword);
  const [updatePassword, setUpdatePassword] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [encryptedText, setEncryptedText] = useState<string | null>(null);
  const [decryptedText, setDecryptedText] = useState("");
  const [lastModifiedToken, setLastModifiedToken] = useState<string | null>(null);
  const [salt, setSalt] = useState<string | null>(null);
  const [iv, setIv] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Fetch note on mount
  useEffect(() => {
    if (!slug) return;

    setLoading(true);
    fetch(`/api/notes/${slug}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch note");
        const data: NoteData = await res.json();
        setEncryptedText(data.encryptedText);
        setLastModifiedToken(data.lastModifiedToken);
        setSalt(data.salt);
        setIv(data.iv);
      })
      .catch(() => {
        toast.error("Failed to load note");
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const unlockNote = useCallback(async () => {
    if (!encryptedText || !salt || !iv) return;
    try {
      const decrypted = Encryptor.decrypt({
        encryptedText,
        salt,
        iv
      }, readPassword);
      setDecryptedText(decrypted);
      setIsUnlocked(true);
      toast.dismiss();
    } catch {
      toast.error("Password is not correct");
    }
  }, [encryptedText, readPassword, salt, iv]);

  useEffect(() => {
    if (encryptedText && initialPassword && !isUnlocked) {
      unlockNote();
    }
  }, [encryptedText, initialPassword, isUnlocked, unlockNote]);

  const updateNote = async () => {
    if (!slug) return;
    if (lastModifiedToken === null) {
      toast.error("Missing lastModifiedToken");
      return;
    }

    setSaving(true);

    try {
      const encrypted = Encryptor.encrypt(decryptedText, readPassword);
      const res = await fetch(`/api/notes/${slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...encrypted,
          updatePassword,
          lastModifiedToken,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Update failed");
      }

      const responseData: { lastModifiedToken: string } = await res.json();

      setEncryptedText(encrypted.encryptedText);
      setSalt(encrypted.salt);
      setIv(encrypted.iv);
      setLastModifiedToken(responseData.lastModifiedToken);
      toast.success("Note updated successfully!");
    } catch (error) {
      let errorMessage = "Failed to update note";
      if (error && typeof error === "object" && "message" in error)
        errorMessage = String(error.message);
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-center mt-10">Loading note...</p>;

  if (!isUnlocked) {
    return <PasswordInput password={readPassword} setPassword={setReadPassword} unlockNote={unlockNote} />;
  }

  const copyNoteUrl = () => {
    if (!slug) return;
    const url = `${window.location.origin}/note/${slug}`;
    navigator.clipboard.writeText(url)
      .then(() => {
        toast.success("Note URL copied to clipboard!");
      })
      .catch(() => {
        toast.error("Failed to copy URL");
      });
  };

  const refreshNote = async () => {
    if (!slug) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/notes/${slug}`);
      if (!res.ok) throw new Error("Failed to fetch note");

      const data: NoteData = await res.json();
      setEncryptedText(data.encryptedText);
      setLastModifiedToken(data.lastModifiedToken);
      setSalt(data.salt);
      setIv(data.iv);

      const decrypted = Encryptor.decrypt(data, readPassword);
      setDecryptedText(decrypted);
      toast.success("Note refreshed");
    } catch {
      toast.error("Failed to refresh note");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="max-w-xl mx-auto mt-12 p-4 space-y-4">
      <div className="flex justify-between mb-6">
        <h2 className="text-2xl font-bold">Update Note</h2>
        <button
          onClick={refreshNote}
          disabled={loading}
          className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition"
        >
          Refresh
        </button>
      </div>
      <div>
        <label className="block font-medium mb-1">Link (Click to copy)</label>
        <input
          type="text"
          value={`${window.location.origin}/note/${slug}`}
          readOnly
          onClick={(e) => {
            e.currentTarget.select();
            copyNoteUrl();
          }}
          className="w-full text-blue-600 px-3 py-2 rounded border cursor-pointer hover:bg-gray-100 transition"
        />
      </div>

      <div>
        <label className="block font-medium mb-1">Read Password</label>
        <input
          type="text"
          value={readPassword}
          readOnly
          className="w-full px-3 py-2 border rounded-md"
        />
      </div>

      <div>
        <label className="block font-medium mb-1">Update Password</label>
        <input
          type="text"
          value={updatePassword}
          onChange={(e) => setUpdatePassword(e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
        />
      </div>

      <div>
        <label className="block font-medium mb-1">Note</label>
        <textarea
          value={decryptedText}
          onChange={(e) => setDecryptedText(e.target.value)}
          rows={6}
          className="w-full px-3 py-2 border rounded-md"
        />
      </div>

      <button
        onClick={updateNote}
        disabled={saving}
        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
      >
        {saving ? "Updating..." : "Update Note"}
      </button>
    </div>
  );
};

interface PasswordInputProps {
  password: string;
  setPassword: React.Dispatch<React.SetStateAction<string>>;
  unlockNote: () => void;
}

const PasswordInput: React.FC<PasswordInputProps> = ({ password, setPassword, unlockNote }) => (
  <form
    onSubmit={(e) => {
      e.preventDefault();
      unlockNote();
    }}
    className="max-w-xl mx-auto mt-12 p-4"
  >
    <h2 className="text-2xl font-bold mb-6">Enter password to unlock note</h2>
    <input
      type="text"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      className="w-full px-3 py-2 border rounded-md mb-4"
      placeholder="Password"
      required
      autoFocus
    />
    <button
      type="submit"
      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
    >
      Unlock
    </button>
  </form>
);

export default NotePage;

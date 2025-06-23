import React, { useCallback, useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import CryptoJS from "crypto-js";
import { toast } from "react-toastify";

interface NoteData {
  encryptedText: string;
  lastModifiedToken: string;
}

const NotePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const initialPassword = (location.state as { password?: string })?.password || "";

  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState(initialPassword);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [encryptedText, setEncryptedText] = useState<string | null>(null);
  const [decryptedText, setDecryptedText] = useState("");
  const [lastModifiedToken, setLastModifiedToken] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

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
      })
      .catch(() => {
        toast.error("Failed to load note");
      })
      .finally(() => setLoading(false));
  }, [slug]);

  // Unlock note with password
  const unlockNote = useCallback(() => {
    if (!encryptedText) return;
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedText, password);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      if (!decrypted) {
        toast.error("Wrong password");
        return;
      }
      setDecryptedText(decrypted);
      setIsUnlocked(true);
      toast.dismiss();
    } catch {
      toast.error("Decryption error");
    }
  }, [encryptedText, password]);

  useEffect(() => {
    if (encryptedText && initialPassword && !isUnlocked) {
      unlockNote();
    }
  }, [encryptedText, initialPassword, isUnlocked, unlockNote]);

  // Update note
  const updateNote = async () => {
    if (!slug) return;
    if (lastModifiedToken === null) {
      toast.error("Missing lastModifiedToken");
      return;
    }

    setSaving(true);
    setSuccess(false);

    try {
      const newEncrypted = CryptoJS.AES.encrypt(decryptedText, password).toString();
      const res = await fetch(`/api/notes/${slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          encryptedText: newEncrypted,
          lastModifiedToken: lastModifiedToken,
        }),
      });

      if (!res.ok) {
        throw new Error("Update failed");
      }

      // Parse the response JSON to get the new token
      const responseData: { lastModifiedToken: string } = await res.json();

      setEncryptedText(newEncrypted);
      setLastModifiedToken(responseData.lastModifiedToken); // update token here
      setSuccess(true);
      toast.success("Note updated successfully!");
    } catch {
      toast.error("Failed to update note");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-center mt-10">Loading note...</p>;

  if (!isUnlocked) {
    return <PasswordInput password={password} setPassword={setPassword} unlockNote={unlockNote} />;
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

  return (
    <div className="max-w-xl mx-auto mt-12 p-4 space-y-4">
      <h2 className="text-2xl font-bold mb-6">Update Note</h2>
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
        <label className="block font-medium mb-1">Password</label>
        <input
          type="text"
          value={password}
          readOnly
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

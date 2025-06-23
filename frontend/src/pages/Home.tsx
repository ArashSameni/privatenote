import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { nanoid } from "nanoid"
import { toast } from "react-toastify"
import Encryptor from "../services/Encryptor"

const Home: React.FC = () => {
    const [slug, setSlug] = useState(nanoid(8).toLowerCase())
    const [readPassword, setReadPassword] = useState("")
    const [updatePassword, setUpdatePassword] = useState("")
    const [note, setNote] = useState("")
    const navigate = useNavigate()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!readPassword || !note) {
            toast.error('Password and Note are required');
            return
        }

        const encrypted = Encryptor.encrypt(note, readPassword);
        const res = await fetch("/api/notes", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                slug: slug,
                encryptedText: encrypted.encryptedText,
                updatePassword,
                salt: encrypted.salt,
                iv: encrypted.iv,
            }),
        })

        if (res.ok) {
            navigate(`/note/${slug}`, { state: { password: readPassword } })
        } else {
            toast.error("Failed to create note")
        }
    }

    return (
        <div className="max-w-xl mx-auto mt-12 p-4">
            <h2 className="text-2xl font-bold mb-6">Create a Private Note</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block font-medium mb-1">Slug (Link)</label>
                    <input
                        type="text"
                        value={slug}
                        onChange={(e) => setSlug(e.target.value.toLocaleLowerCase())}
                        className="w-full px-3 py-2 border rounded-md"
                    />
                </div>
                <div>
                    <label className="block font-medium mb-1">Read Password</label>
                    <input
                        type="text"
                        value={readPassword}
                        onChange={(e) => setReadPassword(e.target.value)}
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
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        rows={6}
                        className="w-full px-3 py-2 border rounded-md"
                    />
                </div>
                <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                >
                    Save Note
                </button>
            </form>
        </div>
    )
}

export default Home

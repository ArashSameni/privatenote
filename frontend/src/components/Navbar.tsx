import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const Navbar: React.FC = () => {
  const [slug, setSlug] = useState("");
  const navigate = useNavigate();

  const handleGo = (e: React.FormEvent) => {
    e.preventDefault();
    if (slug.trim()) {
      navigate(`/note/${slug.trim()}`);
    }
  };

  return (
    <nav className="w-full bg-white border-b border-gray-200 shadow-sm px-4 py-3 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <h1 className="text-xl font-bold">
          <Link to="/" className="text-blue-600">
            Private
            <span className="text-gray-800">Note</span>
          </Link>
        </h1>

        <form onSubmit={handleGo} className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="Enter slug..."
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg transition font-medium"
          >
            Go
          </button>
        </form>
      </div>
    </nav>
  );
};

export default Navbar;

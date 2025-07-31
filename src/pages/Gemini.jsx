import { GoogleGenAI } from "@google/genai";
import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useNavigate } from "react-router";

export default function Gemini() {
  const [mood, setMood] = useState("");
  const [genre, setGenre] = useState("");
  const [timeAvailable, setTimeAvailable] = useState("");
  const [result, setResult] = useState("");
  const [tmdbId, setTmdbId] = useState("");
  const [type, settype] = useState(""); // movie or tv
  const [movieDetails, setMovieDetails] = useState(null);
  const navigate = useNavigate();

  const ai = new GoogleGenAI({
    apiKey: import.meta.env.VITE_GEMINI_API_KEY,
  });

  const { mutate: fetchRecommendation, isPending } = useMutation({
    mutationFn: async () => {
      if (!mood.trim() || !timeAvailable.trim()) return "";

      const prompt = `I am in a ${mood} mood, I prefer ${genre || "any"} genre, and I have ${timeAvailable} to watch something. Recommend me one film or TV show.
Respond exactly like this: Movie: <title>, tmdbid: <id>, type: <movie|tv>`;

      const resp = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: prompt,
      });

      return resp?.text || "";
    },
    onSuccess: (data) => {
      setResult(data);

      const idMatch = data.match(/tmdbid[:\s]*([0-9]+)/i);
      const typeMatch = data.match(/type[:\s]*(movie|tv)/i);

      if (idMatch && idMatch[1]) {
        setTmdbId(idMatch[1]);
      } else {
        setTmdbId("");
        setMovieDetails(null);
      }

      if (typeMatch && typeMatch[1]) {
        settype(typeMatch[1]);
      } else {
        settype("");
      }
    },
    onError: (error) => {
      console.error("Error:", error);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchRecommendation();
  };

  const fetchMovieDetails = async () => {
    try {
      const res = await axios.get(
        `https://api.themoviedb.org/3/${type}/${tmdbId}`,
        {
          params: {
            api_key: import.meta.env.VITE_TMDB_API_KEY,
          },
        }
      );
      setMovieDetails(res.data);
    } catch (error) {
      console.error("Failed to fetch movie/tv details:", error);
    }
  };

  useEffect(() => {
    if (tmdbId && type) {
      fetchMovieDetails();
    }
  }, [tmdbId, type]);

  return (
    <div className="min-h-screen p-4">
      <h2 className="text-2xl font-bold mb-4">Gemini</h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-md">
        <input
          className="input input-bordered"
          value={mood}
          onChange={(e) => setMood(e.target.value)}
          placeholder="Enter your mood..."
          required
        />
        <input
          className="input input-bordered"
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
          placeholder="Preferred genre (optional)"
        />
        <input
          className="input input-bordered"
          value={timeAvailable}
          onChange={(e) => setTimeAvailable(e.target.value)}
          placeholder="How much time you have? (e.g. 2 hours)"
          required
        />
        <button className="btn btn-primary" type="submit">
          {isPending ? "Thinking..." : "Get Suggestion"}
        </button>
      </form>

      <div className="mt-6">
        {result && (
          <p className="text-lg font-semibold mb-2">
            Gemini Suggests: {result}
          </p>
        )}
        {movieDetails && (
          <div className="p-4 border rounded shadow-md max-w-md bg-white">
            <h3 className="text-xl font-bold">
              {movieDetails.title || movieDetails.name}
            </h3>
            <p>{movieDetails.overview}</p>
            <p className="text-sm text-gray-500 mt-2">
              Release Date:{" "}
              {movieDetails.release_date || movieDetails.first_air_date}
            </p>
            <p className="text-sm text-blue-500 mt-1">
              Type: {type === "movie" ? "Movie" : "TV Show"}
            </p>
            {movieDetails.poster_path && (
              <img
                src={`https://image.tmdb.org/t/p/w300${movieDetails.poster_path}`}
                alt={movieDetails.title || movieDetails.name}
                className="mt-4 rounded"
              />
            )}
            <button
              className="btn mt-4"
              onClick={() => navigate(`/${type}/${tmdbId}`)}
            >
              See
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

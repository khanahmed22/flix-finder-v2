"use client"

import { useState, useEffect } from "react"
import { useMutation } from "@tanstack/react-query"
import axios from "axios"
import { useNavigate } from "react-router"
import { GoogleGenAI } from "@google/genai"
import { motion } from "motion/react"

export default function Gemini() {
  const [mood, setMood] = useState("")
  const [genre, setGenre] = useState("")
  const [timeAvailable, setTimeAvailable] = useState("")
  const [result, setResult] = useState("")
  const [tmdbId, setTmdbId] = useState("")
  const [type, setType] = useState("") // movie or tv
  const [movieDetails, setMovieDetails] = useState(null)
  const navigate = useNavigate()

  const ai = new GoogleGenAI({
    apiKey: import.meta.env.VITE_GEMINI_API_KEY 
  })

  const { mutate: fetchRecommendation, isPending } = useMutation({
    mutationFn: async () => {
      if (!mood.trim() || !timeAvailable.trim()) return ""
      const prompt = `I am in a ${mood} mood, I prefer ${genre || "any"} genre, and I have ${timeAvailable} to watch something. Recommend me one film or TV show.Respond exactly like this: Movie: <title>, tmdbid: <id>, type: <movie|tv>`
      const resp = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      })
      
      return resp.text || ""
    },
    onSuccess: (data) => {
      setResult(data)
      const idMatch = data.match(/tmdbid[:\s]*([0-9]+)/i)
      const typeMatch = data.match(/type[:\s]*(movie|tv)/i)
      if (idMatch && idMatch[1]) {
        setTmdbId(idMatch[1])
      } else {
        setTmdbId("")
        setMovieDetails(null)
      }
      if (typeMatch && typeMatch[1]) {
        setType(typeMatch[1])
      } else {
        setType("")
      }
    },
    onError: (error) => {
      console.error("Error:", error)
      setResult("Failed to get a recommendation. Please try again.") 
      setMovieDetails(null)
      setTmdbId("")
      setType("")
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    fetchRecommendation()
  }

  const fetchMovieDetails = async () => {
    try {
      const res = await axios.get(`https://api.themoviedb.org/3/${type}/${tmdbId}`, {
        params: {
          api_key: import.meta.env.VITE_TMDB_API_KEY , 
        },
      })
      setMovieDetails(res.data)
    } catch (error) {
      console.error("Failed to fetch movie/tv details:", error)
      setMovieDetails(null) 
    }
  }

  useEffect(() => {
    if (tmdbId && type) {
      fetchMovieDetails()
    }
  }, [tmdbId, type])

  return (
    <motion.div className="min-h-screen mt-3 bg-gray-900 text-white p-4 relative overflow-hidden" 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.5, ease: "easeIn" }}
    > 
     
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-purple-600 to-blue-500 opacity-30 blur-3xl animate-pulse-slow z-0"></div>
      <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-gradient-to-tl from-yellow-400 to-orange-500 opacity-20 blur-3xl animate-pulse-slow-reverse z-0"></div>

      <h2 className="text-3xl font-bold mb-6 text-center text-yellow-400 relative z-10">Gemini AI Movie Recommender</h2>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 max-w-md mx-auto bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700 relative z-10"
      >
        <input
          className="input input-bordered w-full bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-yellow-400 focus:ring-yellow-400"
          value={mood}
          onChange={(e) => setMood(e.target.value)}
          placeholder="Enter your mood (e.g., happy, sad, adventurous)..."
          required
        />
        <input
          className="input input-bordered w-full bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-yellow-400 focus:ring-yellow-400"
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
          placeholder="Preferred genre (e.g., sci-fi, comedy, thriller) (optional)"
        />
        <input
          className="input input-bordered w-full bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-yellow-400 focus:ring-yellow-400"
          value={timeAvailable}
          onChange={(e) => setTimeAvailable(e.target.value)}
          placeholder="How much time do you have? (e.g., 2 hours, 90 minutes)"
          required
        />
        <button
          className="btn btn-primary bg-yellow-600 hover:bg-yellow-700 text-black font-semibold py-3"
          type="submit"
          disabled={isPending}
        >
          {isPending ? "Thinking..." : "Get Suggestion"}
        </button>
      </form>

      <div className="mt-8 max-w-md mx-auto relative z-10">
        {isPending && (
          <div className="flex flex-col items-center justify-center gap-4 py-8">
            {/* AI Visualizer (moving mouth) */}
            <div className="flex items-center space-x-1 h-6">
              <div className="w-1 h-full bg-yellow-400 rounded-full animate-pulse-bar-1"></div>
              <div className="w-1 h-full bg-yellow-400 rounded-full animate-pulse-bar-2"></div>
              <div className="w-1 h-full bg-yellow-400 rounded-full animate-pulse-bar-3"></div>
              <div className="w-1 h-full bg-yellow-400 rounded-full animate-pulse-bar-4"></div>
            </div>
            <p className="text-lg text-gray-400">Gemini is thinking...</p>
          </div>
        )}

        {result && !isPending && (
          <p className="text-lg font-semibold mb-4 text-center">
            Gemini Suggests: <span className="text-yellow-400">{result}</span>
          </p>
        )}

        {movieDetails && (
          <div className="card bg-gray-800 border border-gray-700 text-white shadow-xl">
            <div className="card-body p-6">
              <h3 className="card-title text-2xl font-bold text-yellow-400">
                {movieDetails.title || movieDetails.name}
              </h3>
              <p className="text-gray-300 mb-4">{movieDetails.overview}</p>
              <p className="text-sm text-gray-400 mb-1">
                Release Date: {movieDetails.release_date || movieDetails.first_air_date}
              </p>
              <p className="text-sm text-gray-400 mb-4">Type: {type === "movie" ? "Movie" : "TV Show"}</p>
              {movieDetails.poster_path && (
                <img
                  src={`https://image.tmdb.org/t/p/w300${movieDetails.poster_path}`}
                  alt={movieDetails.title || movieDetails.name}
                  className="mt-4 rounded-lg shadow-md mx-auto w-[300px]"
                />
              )}
              <button
                className="btn btn-primary w-full bg-yellow-600 hover:bg-yellow-700 text-black font-semibold mt-6"
                onClick={() => navigate(`/${type}/${tmdbId}`)}
              >
                See Details
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}

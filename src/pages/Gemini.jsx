import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import axios from "axios"
import { useNavigate } from "react-router"
import { GoogleGenAI } from "@google/genai" 
import { motion } from "motion/react" 

export default function Gemini() {
  const [mood, setMood] = useState("")
  const [genre, setGenre] = useState("")
  const [timeAvailable, setTimeAvailable] = useState("")
  const [region, setRegion] = useState("")
  const [ageRating, setAgeRating] = useState("")
  const [result, setResult] = useState("")
  const [tmdbId, setTmdbId] = useState("")
  const [type, setType] = useState("") 
  const [movieDetails, setMovieDetails] = useState(null)
  const [loadingMovieDetails, setLoadingMovieDetails] = useState(false)
  const navigate = useNavigate()

  const ai = new GoogleGenAI({
    apiKey: import.meta.env.VITE_GEMINI_API_KEY, 
  })

  const moodOptions = [
    { value: "", label: "Select your mood" },
    { value: "happy", label: "Happy" },
    { value: "sad", label: "Sad" },
    { value: "adventurous", label: "Adventurous" },
    { value: "relaxed", label: "Relaxed" },
    { value: "thrilled", label: "Thrilled" },
    { value: "thought-provoking", label: "Thought-provoking" },
    { value: "lighthearted", label: "Lighthearted" },
  ]

  const genreOptions = [
    { value: "", label: "Select a genre" },
    { value: "action", label: "Action" },
    { value: "comedy", label: "Comedy" },
    { value: "drama", label: "Drama" },
    { value: "sci-fi", label: "Sci-Fi" },
    { value: "horror", label: "Horror" },
    { value: "romance", label: "Romance" },
    { value: "thriller", label: "Thriller" },
    { value: "animation", label: "Animation" },
    { value: "documentary", label: "Documentary" },
    { value: "fantasy", label: "Fantasy" },
    { value: "mystery", label: "Mystery" },
    { value: "crime", label: "Crime" },
    { value: "family", label: "Family" },
    { value: "musical", label: "Musical" },
    { value: "western", label: "Western" },
  ]

  const timeAvailableOptions = [
    { value: "", label: "How much time do you have?" },
    { value: "30 minutes", label: "30 minutes or less" },
    { value: "1 hour", label: "Around 1 hour" },
    { value: "1.5 hours", label: "Around 1.5 hours" },
    { value: "2 hours", label: "Around 2 hours" },
    { value: "2.5 hours", label: "Around 2.5 hours" },
    { value: "3 hours or more", label: "3 hours or more" },
  ]

  const regionOptions = [
    { value: "", label: "Select a region" },
    { value: "American", label: "American" },
    { value: "Japanese", label: "Japanese" },
    { value: "Korean", label: "Korean" },
    { value: "Indian", label: "Indian" },
    { value: "British", label: "British" },
    { value: "French", label: "French" },
    { value: "Spanish", label: "Spanish" },
    { value: "German", label: "German" },
    { value: "Chinese", label: "Chinese" },
    { value: "Canadian", label: "Canadian" },
    { value: "Australian", label: "Australian" },
  ]

  const ageRatingOptions = [
    { value: "", label: "Select age rating" },
    { value: "G", label: "G (General Audiences)" },
    { value: "PG", label: "PG (Parental Guidance Suggested)" },
    { value: "PG-13", label: "PG-13 (Parents Strongly Cautioned)" },
    { value: "R", label: "R (Restricted)" },
    { value: "NC-17", label: "NC-17 (No One 17 and Under Admitted)" },
  ]

  const fetchMovieDetails = async (idFromAI, typeFromAI, titleFromAI) => {
    setLoadingMovieDetails(true)
    setMovieDetails(null)
    setResult("")

    const fetchedId = idFromAI
    const fetchedType = typeFromAI
    const fetchedTitle = titleFromAI

    try {
     
      if (fetchedId && fetchedType) {
        try {
          const res = await axios.get(`https://api.themoviedb.org/3/${fetchedType}/${fetchedId}`, {
            params: {
              api_key: import.meta.env.VITE_TMDB_API_KEY,
            },
          })
          if (res.data) {
            setMovieDetails(res.data)
            setType(fetchedType)
            setTmdbId(fetchedId)
            setResult(`AI Suggests: ${fetchedTitle || res.data.title || res.data.name}`)
            setLoadingMovieDetails(false)
            return
          }
        } catch (error) {
          console.warn("Failed to fetch by direct TMDB ID, attempting search fallback:", error)
        }
      }

    
      if (fetchedTitle) {
        const searchRes = await axios.get(`https://api.themoviedb.org/3/search/multi`, {
          params: {
            api_key: import.meta.env.VITE_TMDB_API_KEY,
            query: fetchedTitle,
          },
        })
        const firstResult = searchRes.data.results?.[0]

        if (firstResult) {
          const detailsRes = await axios.get(
            `https://api.themoviedb.org/3/${firstResult.media_type}/${firstResult.id}`,
            {
              params: {
                api_key: import.meta.env.VITE_TMDB_API_KEY,
              },
            },
          )
          setMovieDetails(detailsRes.data)
          setType(firstResult.media_type)
          setTmdbId(firstResult.id.toString())
          setResult(`AI Suggests: ${firstResult.title || firstResult.name} (Found via search)`)
        } else {
          setMovieDetails(null)
          setResult("AI suggested a title, but no matching details found on TMDB.")
        }
      } else {
        setMovieDetails(null)
        setResult("AI did not provide a valid title or ID. Please try again.")
      }
    } catch (error) {
      console.error("Failed to fetch movie/tv details or search:", error)
      setMovieDetails(null)
      setResult("Failed to get a recommendation or find details. Please try again.")
    } finally {
      setLoadingMovieDetails(false)
    }
  }

  const { mutate: fetchRecommendation, isPending: isAiPending } = useMutation({
    mutationFn: async () => {
      if (!mood.trim() || !timeAvailable.trim() || !ageRating.trim() || !genre.trim() || !region.trim()) {
        setResult("Please fill in all required fields.")
        return ""
      }

      let prompt = `I am in a ${mood} mood, I prefer ${genre} genre, and I have ${timeAvailable} to watch something.`
      prompt += ` I am looking for ${region} movies or TV shows.`
      prompt += ` The age rating should be ${ageRating}.`
      prompt += ` Recommend me one film or TV show. Respond exactly like this: Movie: <title>, tmdbid: <id>, type: <movie|tv>`

      const resp = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      })
      return resp.text || ""
    },
    onSuccess: (data) => {
      const idMatch = data.match(/tmdbid[:\s]*([0-9]+)/i)
      const typeMatch = data.match(/type[:\s]*(movie|tv)/i)
      const titleMatch = data.match(/Movie: ([^,]+),/i)

      const extractedId = idMatch ? idMatch[1].trim() : ""
      const extractedType = typeMatch ? typeMatch[1].trim() : ""
      const extractedTitle = titleMatch ? titleMatch[1].trim() : ""

      fetchMovieDetails(extractedId, extractedType, extractedTitle)
    },
    onError: (error) => {
      console.error("Error:", error)
      setResult(`Failed to get a recommendation from AI: ${error.message}. Please check your API key and try again.`)
      setMovieDetails(null)
      setTmdbId("")
      setType("")
      setLoadingMovieDetails(false)
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    fetchRecommendation()
  }

  return (
    <motion.div
      className="min-h-screen mt-3 bg-gray-900 text-white p-4 relative overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.5, ease: "easeIn" }}
    >
      {/* Giant Glowing Orb */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-purple-600 to-blue-500 opacity-30 blur-3xl animate-pulse-slow z-0"></div>
      <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-gradient-to-tl from-yellow-400 to-orange-500 opacity-20 blur-3xl animate-pulse-slow-reverse z-0"></div>
      <h2 className="text-3xl font-bold mb-6 text-center text-yellow-400 relative z-10">AI Movie Recommender</h2>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 max-w-md mx-auto bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700 relative z-10"
      >
        <select
          className="select cursor-pointer select-bordered w-full bg-gray-700 border-gray-600 text-white focus:border-yellow-400 focus:ring-yellow-400"
          value={mood}
          onChange={(e) => setMood(e.target.value)}
          required
        >
          {moodOptions.map((option) => (
            <option key={option.value} value={option.value} disabled={option.value === ""}>
              {option.label}
            </option>
          ))}
        </select>

        <select
          className="select cursor-pointer select-bordered w-full bg-gray-700 border-gray-600 text-white focus:border-yellow-400 focus:ring-yellow-400"
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
          required
        >
          {genreOptions.map((option) => (
            <option key={option.value} value={option.value} disabled={option.value === ""}>
              {option.label}
            </option>
          ))}
        </select>

        <select
          className="select cursor-pointer select-bordered w-full bg-gray-700 border-gray-600 text-white focus:border-yellow-400 focus:ring-yellow-400"
          value={timeAvailable}
          onChange={(e) => setTimeAvailable(e.target.value)}
          required
        >
          {timeAvailableOptions.map((option) => (
            <option key={option.value} value={option.value} disabled={option.value === ""}>
              {option.label}
            </option>
          ))}
        </select>

        <select
          className="select cursor-pointer select-bordered w-full bg-gray-700 border-gray-600 text-white focus:border-yellow-400 focus:ring-yellow-400"
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          required
        >
          {regionOptions.map((option) => (
            <option key={option.value} value={option.value} disabled={option.value === ""}>
              {option.label}
            </option>
          ))}
        </select>

        <select
          className="select cursor-pointer select-bordered w-full bg-gray-700 border-gray-600 text-white focus:border-yellow-400 focus:ring-yellow-400"
          value={ageRating}
          onChange={(e) => setAgeRating(e.target.value)}
          required
        >
          {ageRatingOptions.map((option) => (
            <option key={option.value} value={option.value} disabled={option.value === ""}>
              {option.label}
            </option>
          ))}
        </select>

        <button
          className="btn btn-primary bg-yellow-600 hover:bg-yellow-700 text-black font-semibold py-3"
          type="submit"
          disabled={isAiPending || loadingMovieDetails}
        >
          {isAiPending ? "Thinking..." : "Get Suggestion"}
        </button>
      </form>
      <div className="mt-8 max-w-md mx-auto relative z-10">
        {(isAiPending || loadingMovieDetails) && (
          <div className="flex flex-col items-center justify-center gap-4 py-8">
            {/* AI Visualizer (moving mouth) */}
            <div className="flex items-center space-x-1 h-6">
              <div className="w-1 h-full bg-yellow-400 rounded-full animate-pulse-bar-1"></div>
              <div className="w-1 h-full bg-yellow-400 rounded-full animate-pulse-bar-2"></div>
              <div className="w-1 h-full bg-yellow-400 rounded-full animate-pulse-bar-3"></div>
              <div className="w-1 h-full bg-yellow-400 rounded-full animate-pulse-bar-4"></div>
            </div>
            <p className="text-lg text-gray-400">AI is thinking...</p>
          </div>
        )}
        {result && !isAiPending && !loadingMovieDetails && (
          <p className="text-lg font-semibold mb-4 text-center">{result}</p>
        )}
        {movieDetails && !isAiPending && !loadingMovieDetails && (
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
                  className="mt-4 rounded-lg shadow-md mx-auto w-[300px] object-cover h-[350px]"
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

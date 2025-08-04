

import axios from "axios"
import { useParams, useNavigate, Link } from "react-router"
import { useQuery, useMutation } from "@tanstack/react-query"
import { supabase } from "../db/supabase"
import { toast } from "sonner"
import { useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { Star, Plus, Trash2, Clock, Calendar, Users, Globe, Film, Award, ArrowLeftCircle, Loader2 } from "lucide-react"
import { motion } from "motion/react"
import { useAuth } from "../authStore/authStore"
export default function MovieView() {
  const queryClient = useQueryClient();
  const [review, setReview] = useState("")
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const { tmdbid, type } = useParams()
  const { session } = useAuth()
  const navigate = useNavigate()
  

  const user = session?.user
  const email = user?.email
  const user_id = session?.user?.id
  const username = user?.user_metadata?.full_name || user?.user_metadata?.name || email

  if(isNaN(Number(tmdbid)) || (type !== 'movie' && type !== 'tv')){
    return navigate('/notfound')
  } 


 

  const fetchTitleDetails = async () => {
    try {
      const TMDB = `https://api.themoviedb.org/3/${type}/${tmdbid}?api_key=${import.meta.env.VITE_TMDB_API_KEY}`
      const res = await axios.get(TMDB)
      return res.data || {}
    } catch (error) {
      console.log(error)
    }
  }

  const fetchCredits = async () => {
    try {
      const CREDITS = `https://api.themoviedb.org/3/${type}/${tmdbid}/credits?api_key=${import.meta.env.VITE_TMDB_API_KEY}`
      const res = await axios.get(CREDITS)
      return res.data || {}
    } catch (error) {
      console.log(error)
    }
  }

 // const fetchExternalIds = async () => {
 //   try {
  //    const EXTERNAL = `https://api.themoviedb.org/3/${type}/${tmdbid}/external_ids?api_key=${import.meta.env.VITE_TMDB_API_KEY}`
  //    const res = await axios.get(EXTERNAL)
  //    return res.data || {}
 //   } catch (error) {
 //     console.log(error)
 //   }
 // }

  const checkWatchlistStatus = async () => {
    if (!user_id) return false
    try {
      const { data, error } = await supabase
        .from("movieNew")
        .select("id")
        .eq("tmID", tmdbid)
        .eq("user_id", user_id)
        .maybeSingle()

      if (error && error.code !== "PGRST116") {
        console.log(error)
      }
      return !!data
    } catch (error) {
      console.log(error)
      return false
    }
  }

  const { data: titleDetails, isPending } = useQuery({
    queryKey: ["fetchSingleTitle", tmdbid],
    queryFn: fetchTitleDetails,
  })

  const { data: credits } = useQuery({
    queryKey: ["fetchCredits", tmdbid],
    queryFn: fetchCredits,
  })

 // const { data: externalIds } = useQuery({
 //   queryKey: ["fetchExternalIds", tmdbid],
 //   queryFn: fetchExternalIds,
 // })

  const { data: isInWatchlist, refetch: refetchWatchlist } = useQuery({
    queryKey: ["checkWatchlist", tmdbid, user_id],
    queryFn: checkWatchlistStatus,
    enabled: !!user_id,

  })

  const addMovie = async ({ title, poster_path, tmID }) => {
    const { data: supabaseData, error } = await supabase
      .from("movieNew")
      .insert({ title: title, user_id: user_id, poster: poster_path, tmID: tmID })
    if (error) {
      console.log(error)
      toast.info("Title Already Added")
    }
    return supabaseData
  }

  const { mutate } = useMutation({
    mutationKey: ["addMovie"],
    mutationFn: addMovie,
    onSuccess: () => {
      toast.success("Added to Watchlist")
      refetchWatchlist()
    },
    onError: () => toast.info("Title Already exists"),
  })

  const addReview = async ({ tmID, review, title, poster }) => {
    const { data: reviewData, error } = await supabase
      .from("reviews")
      .insert({ title: title, tmID: tmID, user_id: user_id, review: review, username: username, rating: rating, poster: poster })
    if (error) {
      console.log(error)
    }
    return reviewData
  }

  const { mutate: reviewAdder } = useMutation({
    mutationKey: ["reviewADD"],
    mutationFn: addReview,
    onSuccess: () => {
      toast.success("Review Added")
      setReview("")
      setRating(0)
      queryClient.invalidateQueries({ queryKey: ["fetchReview",tmdbid] })
      
    },
  })

  const fetchReviews = async () => {
    const { data: movieReviewData, error } = await supabase.from("reviews").select().eq("tmID", tmdbid)
    if (error) {
      console.log(error)
    }
    return movieReviewData || []
  }

  const { data: movieQuery, refetch: refetchMovieReviews } = useQuery({
    queryKey: ["fetchReview", tmdbid],
    queryFn: fetchReviews,
  })

  const deleteReview = async ({ tmID }) => {
    const { data: deleteReviewData, error } = await supabase
      .from("reviews")
      .delete()
      .eq("user_id", user_id)
      .eq("tmID", tmID)
    if (error) {
      console.log(error)
    }
    return deleteReviewData
  }

  const { mutate: deleteReviewM, isPending: DeletePending } = useMutation({
    mutationKey: ["deleteReviewM"],
    mutationFn: deleteReview,
    onSuccess: () => {
      toast.success("Review Deleted")
      refetchMovieReviews()
    },
  })

  const deleteTitle = async ({ tmID }) => {
    const { data: deleteData, error } = await supabase.from("movieNew").delete().eq("tmID", tmID).eq("user_id", user_id)
    if (error) {
      console.log(error)
    }
    return deleteData
  }

  const { mutate: deleteWatch } = useMutation({
    mutationKey: ["deleteTitle"],
    mutationFn: deleteTitle,
    onSuccess: () => {
      toast.success("Removed from Watchlist")
      refetchWatchlist()
    },
  })

  const formatRuntime = (minutes) => {
    if (!minutes) return "N/A"
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatCurrency = (amount) => {
    if (!amount) return "N/A"
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const mockRatings = {
    imdb: "8.1",
    rottenTomatoes: "92%",
    metacritic: "78",
    letterboxd: "4.2",
  }

   if (isPending) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-yellow-400"></div>
      </div>
    )
  }

  const director = credits?.crew?.find((person) => person.job === "Director")
  const writers = credits?.crew?.filter((person) => person.job === "Writer" || person.job === "Screenplay")
  const producers = credits?.crew?.filter((person) => person.job === "Producer").slice(0, 3)

 

  return (
    <motion.div className="min-h-screen bg-gray-900 text-white" 
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 20,
        mass: 0.8,
        delay: 0.2,
      }}>
      <div className="container mx-auto px-4 py-8">
      <div className="breadcrumbs mb-4" onClick={()=> navigate(-1)}>
        <span className="label cursor-pointer hover:text-white">← Back</span>
      </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-lg overflow-hidden mb-6">
              <img
                src={`https://image.tmdb.org/t/p/w500/${titleDetails?.poster_path}`}
                alt={titleDetails?.title || titleDetails?.name}
                className="w-full aspect-[2/3] object-cover"
              />
            </div>

            <div className="bg-gray-800 rounded-lg p-4 space-y-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Award className="w-5 h-5" />
                Ratings
              </h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-yellow-400 font-semibold">TMDB</span>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span>{titleDetails?.vote_average?.toFixed(1) || "N/A"}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-yellow-400 font-semibold">IMDb</span>
                  <span>{mockRatings.imdb}/10</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-red-500 font-semibold">Rotten Tomatoes</span>
                  <span>{mockRatings.rottenTomatoes}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-green-500 font-semibold">Metacritic</span>
                  <span>{mockRatings.metacritic}/100</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-blue-400 font-semibold">Letterboxd</span>
                  <span>{mockRatings.letterboxd}/5</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div>
              <h1 className="text-4xl max-md:text-2xl font-bold mb-2">{titleDetails?.title || titleDetails?.name}</h1>

              {titleDetails?.tagline && <p className="text-xl max-md:text-lg text-gray-400 italic mb-4">"{titleDetails.tagline}"</p>}

              <div className="flex flex-wrap items-center gap-4 mb-4 max-md:text-sm">
                <div className="flex items-center gap-1 text-gray-300">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(titleDetails?.release_date || titleDetails?.first_air_date)}</span>
                </div>

                {titleDetails?.runtime && (
                  <div className="flex items-center gap-1 text-gray-300">
                    <Clock className="w-4 h-4" />
                    <span>{formatRuntime(titleDetails.runtime)}</span>
                  </div>
                )}

                {titleDetails?.spoken_languages && titleDetails.spoken_languages.length > 0 && (
                  <div className="flex items-center gap-1 text-gray-300">
                    <Globe className="w-4 h-4" />
                    <span>{titleDetails.spoken_languages[0].english_name}</span>
                  </div>
                )}

                {titleDetails?.adult !== undefined && (
                  <span
                    className={`px-2 py-1 rounded text-sm font-semibold ${
                      titleDetails.adult ? "bg-red-600" : "bg-green-600"
                    }`}
                  >
                    {titleDetails.adult ? "R" : "PG-13"}
                  </span>
                )}
              </div>

              {titleDetails?.genres && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {titleDetails.genres.map((genre) => (
                    <span key={genre.id} className="bg-gray-700 text-gray-200 px-3 py-1 rounded-full text-sm">
                      {genre.name}
                    </span>
                  ))}
                </div>
              )}

              <p className="text-gray-300 text-lg max-md:text-sm leading-relaxed mb-6">{titleDetails?.overview}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {titleDetails?.budget && titleDetails.budget > 0 && (
                  <div>
                    <h4 className="text-sm text-gray-400 mb-1">Budget</h4>
                    <p className="flex items-center gap-1">
                      
                      {formatCurrency(titleDetails.budget)}
                    </p>
                  </div>
                )}

                {titleDetails?.revenue && titleDetails.revenue > 0 && (
                  <div>
                    <h4 className="text-sm text-gray-400 mb-1">Box Office</h4>
                    <p className="flex items-center gap-1">
                      
                      {formatCurrency(titleDetails.revenue)}
                    </p>
                  </div>
                )}

                {titleDetails?.production_companies && titleDetails.production_companies.length > 0 && (
                  <div>
                    <h4 className="text-sm text-gray-400 mb-1">Production</h4>
                    <p>{titleDetails.production_companies[0].name}</p>
                  </div>
                )}

                {titleDetails?.production_countries && titleDetails.production_countries.length > 0 && (
                  <div>
                    <h4 className="text-sm text-gray-400 mb-1">Country</h4>
                    <p>{titleDetails.production_countries[0].name}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                {session ? (
                  <>
                    {!isInWatchlist ? (
                      <button
                        onClick={() =>
                          mutate({
                            title: titleDetails?.title || titleDetails?.name,
                            poster_path: titleDetails?.poster_path,
                            tmID: titleDetails?.id,
                          })
                        }
                        className="bg-yellow-600 hover:bg-yellow-700 text-black font-semibold px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        Add to Watchlist
                      </button>
                    ) : (
                      <button
                        onClick={() => deleteWatch({ tmID: titleDetails?.id })}
                        className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Remove from Watchlist
                      </button>
                    )}
                  </>
                ) : (
                  <button
                    onClick={() => navigate("/sign-in")}
                    className="bg-yellow-600 hover:bg-yellow-700 text-black font-semibold px-6 py-3 rounded-lg transition-colors"
                  >
                    Sign in to Add to Watchlist
                  </button>
                )}
              </div>
            </div>

            {credits && (
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Film className="w-6 h-6" />
                  Cast & Crew
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {director && (
                    <div>
                      <h4 className="text-lg font-semibold text-yellow-400 mb-2">Director</h4>
                      <p className="text-gray-300">{director.name}</p>
                    </div>
                  )}

                  {writers && writers.length > 0 && (
                    <div>
                      <h4 className="text-lg font-semibold text-yellow-400 mb-2">Writers</h4>
                      <p className="text-gray-300">{writers.map((w) => w.name).join(", ")}</p>
                    </div>
                  )}

                  {producers && producers.length > 0 && (
                    <div>
                      <h4 className="text-lg font-semibold text-yellow-400 mb-2">Producers</h4>
                      <p className="text-gray-300">{producers.map((p) => p.name).join(", ")}</p>
                    </div>
                  )}
                </div>

                {credits.cast && credits.cast.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-yellow-400 mb-4">Main Cast</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {credits.cast.slice(0, 8).map((actor) => (
                        <div key={actor.id} className="text-center">
                          <img
                            src={
                              actor.profile_path
                                ? `https://image.tmdb.org/t/p/w185/${actor.profile_path}`
                                : "/placeholder.svg?height=185&width=185"
                            }
                            alt={actor.name}
                            className="w-full aspect-[2/3] object-cover rounded-lg mb-2"
                          />
                          <p className="font-semibold text-sm">{actor.name}</p>
                          <p className="text-gray-400 text-xs">{actor.character}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-2xl max-md:text-lg font-bold mb-4 flex items-center gap-2">
                <Users className="w-6 h-6" />
                User Reviews
              </h3>

              <div className="space-y-4 mb-6">
                {movieQuery && movieQuery.length > 0 ? (
                  movieQuery.map((r, index) => (
                    <div key={index} className="border-b border-gray-700 pb-4 last:border-b-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex max-md:flex-col max-md:items-start items-center gap-2">
                          <span className="font-semibold text-yellow-400">{r.username.split("@")[0]}</span>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < r.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-600"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        {user_id === r.user_id && (
                          <button
                            onClick={() => deleteReviewM({ tmID: r.tmID })}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm flex items-center gap-1 transition-colors"
                          > {
                              DeletePending?<span><Loader2 className="animate-spin"/> </span>:<div className="flex items-center gap-x-2">  <Trash2 className="w-3 h-3" />
                            <span className="max-md:hidden">Delete</span></div>
                            }
                          
                          </button>
                        )}
                      </div>
                      <p className="text-gray-300 italic">"{r.review}"</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-center py-8 max-md:text-sm">No reviews yet. Be the first to review!</p>
                )}
              </div>

              {session ? (
                movieQuery && movieQuery.some((r) => r.user_id === user_id) ? (
                  <div className="text-center py-8">
                    <p className="text-gray-400 mb-4">You have already reviewed this title.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold">Write a Review</h4>

                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-400">Rate it:</span>
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-6 h-6 cursor-pointer transition-colors ${
                              i < (hoverRating || rating)
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-600 hover:text-yellow-400"
                            }`}
                            onMouseEnter={() => setHoverRating(i + 1)}
                            onMouseLeave={() => setHoverRating(0)}
                            onClick={() => setRating(i + 1)}
                          />
                        ))}
                      </div>
                    </div>

                    <textarea
                      placeholder="Share your thoughts about this title..."
                      value={review}
                      onChange={(e) => setReview(e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 text-white placeholder-gray-400 p-3 rounded-lg resize-none max-md:text-sm"
                      rows={4}
                    />

                    <button
                      type="submit"
                      onClick={() => {
                        if (review.trim() && rating > 0) {
                          reviewAdder({
                            tmID: tmdbid,
                            review: review,
                            title: titleDetails?.title || titleDetails?.name,
                            poster: titleDetails?.poster_path
                          })
                        }
                      }}
                      disabled={!review.trim() || rating === 0}
                      className="bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-black font-semibold px-6 py-3 rounded-lg transition-colors"
                    >
                      Post Review
                    </button>
                  </div>
                )
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-400 mb-4">Sign in to write a review</p>
                  <button
                    onClick={() => navigate("/sign-in")}
                    className="bg-yellow-600 hover:bg-yellow-700 text-black font-semibold px-6 py-3 rounded-lg transition-colors"
                  >
                    Sign In
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}



import axios from "axios"
import { useQuery } from "@tanstack/react-query"
import { useNavigate } from "react-router"
import { useParams } from "react-router"
import { ChevronLeft, ChevronRight, Star, Plus, Eye, Calendar } from "lucide-react"
import { motion } from "motion/react"

export default function TopRatedMovies() {
  const navigate = useNavigate()
  const { pgno } = useParams()
 // const { session } = useAuth()
  //const user_id = session?.user?.id

  const fetchTopRatedMovies = async () => {
    try {
      const TMDB = `https://api.themoviedb.org/3/movie/top_rated?api_key=${import.meta.env.VITE_TMDB_API_KEY}&language=en-US&page=${pgno}`
      const res = await axios.get(TMDB)
      return res.data || {}
    } catch (error) {
      console.log(error)
      return { results: [], total_pages: 1 }
    }
  }

  const { data: movieData, isPending } = useQuery({
    queryKey: ["topRatedMovies", pgno],
    queryFn: fetchTopRatedMovies,
    staleTime: 1000 * 60 * 5,
  })

//  const addMovie = async ({ title, poster_path, tmID }) => {
//    const { data: supabaseData, error } = await supabase
 //     .from("movieNew")
 //     .insert({ title: title, user_id: user_id, poster: poster_path, tmID: tmID })
 //   if (error) {
 //     console.log(error)
 //     toast.error("Failed to add movie")
 //   }
 //   return supabaseData
 // }

 // const { mutate } = useMutation({
 //   mutationKey: ["addMovie"],
 //   mutationFn: addMovie,
 //   onSuccess: () => toast.success("Added to Watchlist"),
 //   onError: () => toast.error("Movie already in watchlist"),
 // })

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    return new Date(dateString).getFullYear()
  }

  if (isPending) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded w-64 mb-8"></div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {[...Array(20)].map((_, index) => (
                <div key={index} className="space-y-4">
                  <div className="bg-gray-700 rounded-lg aspect-[2/3]"></div>
                  <div className="h-4 bg-gray-700 rounded"></div>
                  <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const topRatedMovies = movieData?.results || []
  const totalPages = movieData?.total_pages || 1
  const currentPage = Number(pgno)

  return (
    <motion.div className="min-h-screen bg-gray-900 text-white" initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.4, ease: "easeIn" }}>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl max-md:text-xl font-bold mb-2">Top Rated Movies</h1>
          <p className="text-gray-400">Discover the highest-rated movies of all time</p>
        </div>

        {topRatedMovies.length > 0 ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 max-md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-12">
              {topRatedMovies.map((movie, index) => (
                <div
                  key={index}
                  className="bg-gray-800 rounded-lg overflow-hidden hover:transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl group"
                >
                  <div className="relative">
                    <img
                      src={`https://image.tmdb.org/t/p/w500/${movie.poster_path}`}
                      alt={movie.title}
                      className="w-[500px] aspect-[2/3] object-cover"
                      sizes="(max-width: 500px) 100vw, 50vw"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-300 flex items-center justify-center">
                      <button
                        onClick={() => navigate(`/movie/${movie.id}`)}
                        className="opacity-0 group-hover:opacity-100 bg-yellow-600 hover:bg-yellow-700 text-black font-semibold px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0"
                      >
                        <Eye className="w-4 h-4" />
                        View 
                      </button>
                    </div>
                    <div className="absolute top-2 right-2 bg-black bg-opacity-75 rounded-full px-2 py-1 flex items-center gap-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs font-semibold">{movie.vote_average?.toFixed(1)}</span>
                    </div>
                  </div>

                  <div className="p-4 space-y-3">
                    <h3 className="font-bold text-lg  max-md:text-sm leading-tight line-clamp-2 min-h-[3.5rem]">{movie.title}</h3>

                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(movie.release_date)}</span>
                    </div>

                    
                  </div>
                </div>
              ))}
            </div>

            <div className="flex max-md:flex-col items-center justify-center gap-4">
              <button
                disabled={currentPage <= 1}
                onClick={() => navigate(`/top-rated-movies/${currentPage - 1}`)}
                className="flex items-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>

              <div className="flex items-center gap-2">
                {currentPage > 2 && (
                  <>
                    <button
                      onClick={() => navigate(`/top-rated-movies/1`)}
                      className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
                    >
                      1
                    </button>
                    {currentPage > 3 && <span className="text-gray-400">...</span>}
                  </>
                )}

                {currentPage > 1 && (
                  <button
                    onClick={() => navigate(`/top-rated-movies/${currentPage - 1}`)}
                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
                  >
                    {currentPage - 1}
                  </button>
                )}

                <span className="px-4 py-2 bg-yellow-600 text-black font-bold rounded-lg">{currentPage}</span>

                {currentPage < totalPages && (
                  <button
                    onClick={() => navigate(`/top-rated-movies/${currentPage + 1}`)}
                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
                  >
                    {currentPage + 1}
                  </button>
                )}

                {currentPage < totalPages - 1 && (
                  <>
                    {currentPage < totalPages - 2 && <span className="text-gray-400">...</span>}
                    <button
                      onClick={() => navigate(`/top-rated-movies/${totalPages}`)}
                      className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
                    >
                      {totalPages}
                    </button>
                  </>
                )}
              </div>

              <button
                disabled={currentPage >= totalPages}
                onClick={() => navigate(`/top-rated-movies/${currentPage + 1}`)}
                className="flex items-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="text-center max-md:text-sm mt-6 text-gray-400">
              Page {currentPage} of {totalPages.toLocaleString()}
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🎬</div>
            <h3 className="text-2xl font-bold mb-2">No Movies Found</h3>
            <p className="text-gray-400">Try refreshing the page or check back later.</p>
          </div>
        )}
      </div>
    </motion.div>
  )
}

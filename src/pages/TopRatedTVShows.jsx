

import axios from "axios"
import { useQuery} from "@tanstack/react-query"
import { useNavigate } from "react-router"
import { useParams } from "react-router"
import { ChevronLeft, ChevronRight, Star, Plus, Eye, Calendar, Tv } from "lucide-react"
import { motion } from "motion/react"


export default function TopRatedTVShows() {
  const navigate = useNavigate()
  const { pgno } = useParams()
 // const { session } = useAuth()
 // const user_id = session?.user?.id

  const fetchTopRatedTVShows = async () => {
    try {
      const TMDB = `https://api.themoviedb.org/3/tv/top_rated?api_key=${import.meta.env.VITE_TMDB_API_KEY}&language=en-US&page=${pgno}`
      const res = await axios.get(TMDB)
      return res.data || {}
    } catch (error) {
      console.log(error)
      return { results: [], total_pages: 1 }
    }
  }

  const { data: tvData, isPending } = useQuery({
    queryKey: ["topRatedTVShows", pgno],
    queryFn: fetchTopRatedTVShows,
    staleTime: 1000 * 60 * 5,
  })

//  const addTV = async ({ name, poster_path, tmID }) => {
//    const { data: supabaseData, error } = await supabase
//      .from("movieNew")
//      .insert({ title: name, user_id: user_id, poster: poster_path, tmID: tmID })

//    if (error) {
 //     console.log(error)
 //     toast.error("Failed to add TV show")
//    }
//    return supabaseData
//  }

  //const { mutate } = useMutation({
 //   mutationKey: ["addTV"],
  //  mutationFn: addTV,
 //   onSuccess: () => toast.success("Added to Watchlist"),
 //   onError: () => toast.error("TV show already in watchlist"),
//  })

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

  const topRatedTVShows = tvData?.results || []
  const totalPages = tvData?.total_pages || 1
  const currentPage = Number(pgno)

  return (
    <motion.div className="min-h-screen bg-gray-900 text-white" initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.5, ease: "easeIn" }}>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl max-md:text-xl font-bold mb-2 flex items-center gap-3">
            <Tv className="w-10 h-10 text-yellow-400" />
            Top Rated TV Shows
          </h1>
          <p className="text-gray-400">Discover the highest-rated television series of all time</p>
        </div>

        {topRatedTVShows.length > 0 ? (
          <>
            <div className="grid grid-cols-2 max-md:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-12">
              {topRatedTVShows.map((show, index) => (
                <div
                  key={index}
                  className="bg-gray-800 rounded-lg overflow-hidden hover:transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl group"
                >
                  <div className="relative">
                    <img
                      src={`https://image.tmdb.org/t/p/w500/${show.poster_path}`}
                      alt={show.name}
                      className="w-full aspect-[2/3] object-cover"
                      sizes="(max-width: 500px) 100vw, 50vw"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-300 flex items-center justify-center">
                      <button
                        onClick={() => navigate(`/tv/${show.id}`)}
                        className="opacity-0 group-hover:opacity-100 bg-yellow-600 hover:bg-yellow-700 text-black font-semibold px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                    </div>
                    <div className="absolute top-2 right-2 bg-black bg-opacity-75 rounded-full px-2 py-1 flex items-center gap-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs font-semibold">{show.vote_average?.toFixed(1)}</span>
                    </div>
                    <div className="absolute top-2 left-2 bg-blue-600 bg-opacity-90 rounded-full px-2 py-1">
                      <Tv className="w-3 h-3" />
                    </div>
                  </div>

                  <div className="p-4 space-y-3">
                    <h3 className="font-bold text-lg max-md:text-sm leading-tight line-clamp-2 min-h-[3.5rem]">{show.name}</h3>

                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(show.first_air_date)}</span>
                    </div>

                    {show.origin_country && show.origin_country.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {show.origin_country.slice(0, 2).map((country, idx) => (
                          <span key={idx} className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
                            {country}
                          </span>
                        ))}
                      </div>
                    )}


                  </div>
                </div>
              ))}
            </div>

            <div className="flex max-md:flex-col items-center justify-center gap-4">
              <button
                disabled={currentPage <= 1}
                onClick={() => navigate(`/top-rated-tv-shows/${currentPage - 1}`)}
                className="flex items-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>

              <div className="flex items-center gap-2">
                {currentPage > 2 && (
                  <>
                    <button
                      onClick={() => navigate(`/top-rated-tv-shows/1`)}
                      className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
                    >
                      1
                    </button>
                    {currentPage > 3 && <span className="text-gray-400">...</span>}
                  </>
                )}

                {currentPage > 1 && (
                  <button
                    onClick={() => navigate(`/top-rated-tv-shows/${currentPage - 1}`)}
                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
                  >
                    {currentPage - 1}
                  </button>
                )}

                <span className="px-4 py-2 bg-yellow-600 text-black font-bold rounded-lg">{currentPage}</span>

                {currentPage < totalPages && (
                  <button
                    onClick={() => navigate(`/top-rated-tv-shows/${currentPage + 1}`)}
                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
                  >
                    {currentPage + 1}
                  </button>
                )}

                {currentPage < totalPages - 1 && (
                  <>
                    {currentPage < totalPages - 2 && <span className="text-gray-400">...</span>}
                    <button
                      onClick={() => navigate(`/top-rated-tv-shows/${totalPages}`)}
                      className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
                    >
                      {totalPages}
                    </button>
                  </>
                )}
              </div>

              <button
                disabled={currentPage >= totalPages}
                onClick={() => navigate(`/top-rated-tv-shows/${currentPage + 1}`)}
                className="flex items-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="text-center mt-6 text-gray-400 max-md:text-sm">
              Page {currentPage} of {totalPages.toLocaleString()}
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📺</div>
            <h3 className="text-2xl font-bold mb-2">No TV Shows Found</h3>
            <p className="text-gray-400">Try refreshing the page or check back later.</p>
          </div>
        )}
      </div>
    </motion.div>
  )
}

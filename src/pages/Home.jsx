

import { useQuery } from "@tanstack/react-query"
import { useNavigate } from "react-router"
import axios from "axios"
import { Play, TrendingUp, Star, Film, Tv, Calendar, Eye } from "lucide-react"
import { motion } from "motion/react"

export default function Home() {
  const navigate = useNavigate()

  const fetchTopRatedMovies = async () => {
    try {
      const TMDB = `https://api.themoviedb.org/3/movie/top_rated?api_key=${import.meta.env.VITE_TMDB_API_KEY}&language=en-US&page=1`
      const res = await axios.get(TMDB)
      return res.data.results || []
    } catch (error) {
      console.log(error)
    }
  }
  const { data: topRatedMovies } = useQuery({
    queryKey: ["topRatedMovies"],
    queryFn: fetchTopRatedMovies,
    staleTime: 1000 * 60 * 5,
  })

  const fetchTopRatedTVShows = async () => {
    try {
      const TMDB = `https://api.themoviedb.org/3/tv/top_rated?api_key=${import.meta.env.VITE_TMDB_API_KEY}&language=en-US&page=1`
      const res = await axios.get(TMDB)
      return res.data.results || []
    } catch (error) {
      console.log(error)
    }
  }
  const { data: topRatedTVShows, isPending } = useQuery({
    queryKey: ["topRatedTVShows"],
    queryFn: fetchTopRatedTVShows,
    staleTime: 1000 * 60 * 5,
  })

  const fetchTrendingMovies = async () => {
    try {
      const TMDB = `https://api.themoviedb.org/3/trending/movie/week?api_key=${import.meta.env.VITE_TMDB_API_KEY}`
      const res = await axios.get(TMDB)
      return res.data.results || []
    } catch (error) {
      console.log(error)
    }
  }
  const { data: trendingMovies } = useQuery({
    queryKey: ["trendingMovies"],
    queryFn: fetchTrendingMovies,
    staleTime: 1000 * 60 * 5,
  })

  const fetchTrendingTVShows = async () => {
    try {
      const TMDB = `https://api.themoviedb.org/3/trending/tv/week?api_key=${import.meta.env.VITE_TMDB_API_KEY}`
      const res = await axios.get(TMDB)
      return res.data.results || []
    } catch (error) {
      console.log(error)
    }
  }
  const { data: trendingTVShows } = useQuery({
    queryKey: ["trendingTVShows"],
    queryFn: fetchTrendingTVShows,
    staleTime: 1000 * 60 * 5,
  })

  const fetchFeaturedTitle = async () => {
    try {
      const TMDB = `https://api.themoviedb.org/3/trending/all/week?api_key=${import.meta.env.VITE_TMDB_API_KEY}`
      const res = await axios.get(TMDB)
      return res.data.results || []
    } catch (error) {
      console.log(error)
    }
  }
  const { data: FeaturedTitleData } = useQuery({
    queryKey: ["FeaturedTitle"],
    queryFn: fetchFeaturedTitle,
    staleTime: 1000 * 60 * 5,
  })
  const trendingTitleToDay = FeaturedTitleData?.[0]

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    return new Date(dateString).getFullYear()
  }

  if (isPending) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-yellow-400"></div>
      </div>
    )
  }

  return (
    <motion.div className="min-h-screen bg-gray-900 text-white" 
     initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.5, ease: "easeIn" }}
      >
      <div className="container mx-auto px-4 py-8">
        <section className="relative w-full h-[500px] rounded-lg overflow-hidden mb-12 shadow-xl">
          <div className="absolute inset-0">
            {trendingTitleToDay ? (
              <img
                className="w-full h-full object-cover max-md:object-center"
                src={`https://image.tmdb.org/t/p/original${trendingTitleToDay?.backdrop_path}`}
                alt={trendingTitleToDay?.title || trendingTitleToDay?.name}
                sizes="(max-width: 900px) 100vw, 50vw"
                      
              
              />
            ) : (
              <div className="w-full h-full bg-gray-800 flex items-center justify-center text-xl font-medium text-gray-400">
                Loading Featured Title...
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent flex flex-col justify-end items-start text-white px-8 pb-8">
              <h1 className="text-4xl max-md:text-2xl md:text-6xl font-extrabold mb-4 text-yellow-400 drop-shadow-lg">
                {trendingTitleToDay?.title || trendingTitleToDay?.name}
              </h1>
              <p className="text-lg max-md:text-sm  md:text-xl text-gray-300 mb-6 max-w-3xl line-clamp-3 drop-shadow-md">
                {trendingTitleToDay?.overview}
              </p>
              <button
                className="bg-yellow-600 hover:bg-yellow-700 text-black font-semibold px-8 py-3 rounded-lg flex items-center gap-2 transition-colors text-lg shadow-lg"
                onClick={() => navigate(`/${trendingTitleToDay?.media_type || "movie"}/${trendingTitleToDay.id}`)}
              >
                <Play className="w-6 h-6" />
                <span className="max-md:hidden">View Details</span>
              </button>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl max-md:text-lg font-bold mb-6 flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-yellow-400 max-md:w-6 max-md:h-6" />
            Trending Movies This Week
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {trendingMovies && trendingMovies.length > 0 ? (
              trendingMovies.slice(0, 6).map((m, index) => (
                <div
                  key={index}
                  className="bg-gray-800 rounded-lg overflow-hidden hover:transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl group"
                >
                  <div className="relative">
                    <img
                      src={`https://image.tmdb.org/t/p/w500/${m.poster_path}`}
                      alt={m.title}
                      className="w-full aspect-[2/3] object-cover"
                      sizes="(max-width: 500px) 100vw, 50vw"
                      
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-300 flex items-center justify-center">
                      <button
                        onClick={() => navigate(`/movie/${m.id}`)}
                        className="opacity-0 group-hover:opacity-100 bg-yellow-600 hover:bg-yellow-700 text-black font-semibold px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                    </div>
                    <div className="absolute top-2 right-2 bg-black bg-opacity-75 rounded-full px-2 py-1 flex items-center gap-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs font-semibold">{m.vote_average?.toFixed(1)}</span>
                    </div>
                    <div className="absolute top-2 left-2 bg-green-600 bg-opacity-90 rounded-full px-2 py-1">
                      <Film className="w-3 h-3" />
                    </div>
                  </div>
                  <div className="p-4 space-y-3">
                    <h3 className="font-bold text-lg max-md:text-sm leading-tight line-clamp-2 min-h-[3.5rem]">
                      {m.title}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(m.release_date)}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-8 text-gray-400">No movies found.</div>
            )}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl max-md:text-lg font-bold mb-6 flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-yellow-400 max-md:w-6 max-md:h-6" />
            Trending TV Shows This Week
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {trendingTVShows && trendingTVShows.length > 0 ? (
              trendingTVShows.slice(0, 6).map((m, index) => (
                <div
                  key={index}
                  className="bg-gray-800 rounded-lg overflow-hidden hover:transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl group"
                >
                  <div className="relative">
                    <img
                      src={`https://image.tmdb.org/t/p/w500/${m.poster_path}`}
                      alt={m.name}
                      className="w-full aspect-[2/3] object-cover"
                      sizes="(max-width: 500px) 100vw, 50vw"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-300 flex items-center justify-center">
                      <button
                        onClick={() => navigate(`/tv/${m.id}`)}
                        className="opacity-0 group-hover:opacity-100 bg-yellow-600 hover:bg-yellow-700 text-black font-semibold px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                    </div>
                    <div className="absolute top-2 right-2 bg-black bg-opacity-75 rounded-full px-2 py-1 flex items-center gap-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs font-semibold">{m.vote_average?.toFixed(1)}</span>
                    </div>
                    <div className="absolute top-2 left-2 bg-blue-600 bg-opacity-90 rounded-full px-2 py-1">
                      <Tv className="w-3 h-3" />
                    </div>
                  </div>
                  <div className="p-4 space-y-3">
                    <h3 className="font-bold text-lg max-md:text-sm leading-tight line-clamp-2 min-h-[3.5rem]">
                      {m.name}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(m.first_air_date)}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-8 text-gray-400">No TV shows found.</div>
            )}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl max-md:text-lg font-bold mb-6 flex items-center gap-3">
            <Star className="w-8 h-8 max-md:w-6 max-md:h-6 text-yellow-400" />
            Top Rated Movies
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {topRatedMovies && topRatedMovies.length > 0 ? (
              topRatedMovies.slice(0, 6).map((m, index) => (
                <div
                  key={index}
                  className="bg-gray-800 rounded-lg overflow-hidden hover:transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl group"
                >
                  <div className="relative">
                    <img
                      src={`https://image.tmdb.org/t/p/w500/${m.poster_path}`}
                      alt={m.title}
                      className="w-full aspect-[2/3] object-cover"
                      sizes="(max-width: 500px) 100vw, 50vw"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-300 flex items-center justify-center">
                      <button
                        onClick={() => navigate(`/movie/${m.id}`)}
                        className="opacity-0 group-hover:opacity-100 bg-yellow-600 hover:bg-yellow-700 text-black font-semibold px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                    </div>
                    <div className="absolute top-2 right-2 bg-black bg-opacity-75 rounded-full px-2 py-1 flex items-center gap-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs font-semibold">{m.vote_average?.toFixed(1)}</span>
                    </div>
                    <div className="absolute top-2 left-2 bg-green-600 bg-opacity-90 rounded-full px-2 py-1">
                      <Film className="w-3 h-3" />
                    </div>
                  </div>
                  <div className="p-4 space-y-3">
                    <h3 className="font-bold text-lg max-md:text-sm leading-tight line-clamp-2 min-h-[3.5rem]">
                      {m.title}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(m.release_date)}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-8 text-gray-400">No movies found.</div>
            )}
          </div>
          <div className="flex items-center justify-center mt-6">
            <button
              onClick={() => navigate("/top-rated-movies/1")}
              className="bg-gray-800 hover:bg-gray-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              See More
            </button>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl max-md:text-lg font-bold mb-6 flex items-center gap-3">
            <Star className="w-8 h-8 text-yellow-400 max-md:w-6 max-md:h-6" />
            Top Rated TV Shows
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {topRatedTVShows && topRatedTVShows.length > 0 ? (
              topRatedTVShows.slice(0, 6).map((m, index) => (
                <div
                  key={index}
                  className="bg-gray-800 rounded-lg overflow-hidden hover:transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl group"
                >
                  <div className="relative">
                    <img
                      src={`https://image.tmdb.org/t/p/w500/${m.poster_path}`}
                      alt={m.name}
                      className="w-full aspect-[2/3] object-cover"
                      sizes="(max-width: 500px) 100vw, 50vw"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-300 flex items-center justify-center">
                      <button
                        onClick={() => navigate(`/tv/${m.id}`)}
                        className="opacity-0 group-hover:opacity-100 bg-yellow-600 hover:bg-yellow-700 text-black font-semibold px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                    </div>
                    <div className="absolute top-2 right-2 bg-black bg-opacity-75 rounded-full px-2 py-1 flex items-center gap-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs font-semibold">{m.vote_average?.toFixed(1)}</span>
                    </div>
                    <div className="absolute top-2 left-2 bg-blue-600 bg-opacity-90 rounded-full px-2 py-1">
                      <Tv className="w-3 h-3" />
                    </div>
                  </div>
                  <div className="p-4 space-y-3">
                    <h3 className="font-bold text-lg max-md:text-sm leading-tight line-clamp-2 min-h-[3.5rem]">
                      {m.name}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(m.first_air_date)}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-8 text-gray-400">No TV shows found.</div>
            )}
          </div>
          <div className="flex items-center justify-center mt-6">
            <button
              onClick={() => navigate("/top-rated-tv-shows/1")}
              className="bg-gray-800 hover:bg-gray-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              See More
            </button>
          </div>
        </section>
      </div>
    </motion.div>
  )
}



import { useAuth } from "../context/AuthProvider"
import { supabase } from "../db/supabase"
import { useNavigate } from "react-router"
import { useMutation, useQuery } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  User,
  Star,
  Trash2,
  Film,
  LogOut,
  Mail,
  Calendar,
  MessageSquare,
  Loader2,
  List,
  Settings,
  Eye,
  TrendingUp,
  Award,
} from "lucide-react"
import { useQueryClient } from "@tanstack/react-query"
import { useEffect } from "react"

export default function Account() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { session } = useAuth()
  const user_id = session?.user?.id
  const user = session?.user
  const email = user?.email
  const username = user?.user_metadata?.full_name || user?.user_metadata?.name || email

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    navigate("/")
    toast.success("Signed out successfully")
  }

  const fetchWatchList = async () => {
    const { data: supabaseData, error } = await supabase.from("movieNew").select().eq("user_id", user_id)
    if (error) {
      console.log(error)
    }
    return supabaseData || []
  }

  const { data: watchList, isPending: watchlistPending } = useQuery({
    queryKey: ["watchlist", user_id],
    queryFn: fetchWatchList,
    enabled: !!user_id,
    staleTime: 1000 * 60 * 1,
  })

  const fetchMyReviews = async () => {
    const { data: reviewData, error } = await supabase.from("reviews").select().eq("user_id", user_id)
    if (error) {
      console.log(error)
    }
    return reviewData || []
  }

  const {
    data: reviewQuery,
    isPending: reviewsPending,
    refetch: refetchUserReviews,
  } = useQuery({
    queryKey: ["fetchUserReviewInAccount", user_id],
    queryFn: fetchMyReviews,
    enabled: !!user_id,
    staleTime: 1000 * 60 * 1,
  })

  const fetchUserLists = async () => {
    const { data: listsData, error } = await supabase.from("movie_lists").select("*").eq("user_id", user_id)
    if (error) {
      console.log(error)
    }
    return listsData || []
  }

  const { data: userLists, isPending: listsLoading } = useQuery({
    queryKey: ["user-lists", user_id],
    queryFn: fetchUserLists,
    enabled: !!user_id,
    staleTime: 1000 * 60 * 1,
  })

  useEffect(() => {
    if (user_id) {
      refetchUserReviews()
    }
  }, [user_id])

  const deleteTitle = async ({ tmID }) => {
    const { data: deleteData, error } = await supabase.from("movieNew").delete().eq("tmID", tmID).eq("user_id", user_id)
    if (error) {
      console.log(error)
    }
    return deleteData
  }

  const { mutate: deleteFromWatchlist } = useMutation({
    mutationKey: ["deleteTitle"],
    mutationFn: deleteTitle,
    onSuccess: () => {
      toast.success("Removed from Watchlist")
      queryClient.invalidateQueries({ queryKey: ["watchlist", user_id] })
    },
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

  const { mutate: deleteUserReview, isPending: DeletePending } = useMutation({
    mutationKey: ["deleteUserReview"],
    mutationFn: deleteReview,
    onSuccess: () => {
      toast.success("Review Deleted")
      queryClient.invalidateQueries({ queryKey: ["fetchUserReviewInAccount", user_id] })
    },
  })

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-2xl font-bold mb-2">Please Sign In</h2>
          <p className="text-gray-400 mb-6">You need to be signed in to view your account</p>
          <button
            onClick={() => navigate("/sign-in")}
            className="bg-yellow-600 hover:bg-yellow-700 text-black font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl max-md:text-xl font-bold mb-2 flex items-center gap-3">
                <User className="w-10 h-10 max-md:w-8 max-md:h-8 text-yellow-400" />
                My Dashboard
              </h1>
              <p className="text-gray-400 max-md:text-sm">Manage your profile, watchlist, reviews, and custom lists</p>
            </div>
            <button
              onClick={() => navigate("/lists")}
              className="bg-yellow-600 hover:bg-yellow-700 text-black font-semibold px-6 py-3 rounded-lg flex items-center gap-2 transition-colors max-md:px-4 max-md:py-2"
            >
              <List className="w-5 h-5 max-md:w-4 max-md:h-4" />
              <span className="max-md:hidden">My Lists</span>
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gray-800 rounded-lg p-4 text-center">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Star className="w-6 h-6 text-white" />
              </div>
              <p className="text-2xl font-bold text-blue-400">{watchList?.length || 0}</p>
              <p className="text-sm text-gray-400">Watchlist</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-4 text-center">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <p className="text-2xl font-bold text-green-400">{reviewQuery?.length || 0}</p>
              <p className="text-sm text-gray-400">Reviews</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-4 text-center">
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                <List className="w-6 h-6 text-white" />
              </div>
              <p className="text-2xl font-bold text-purple-400">{userLists?.length || 0}</p>
              <p className="text-sm text-gray-400">Custom Lists</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-4 text-center">
              <div className="w-12 h-12 bg-yellow-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Award className="w-6 h-6 text-black" />
              </div>
              <p className="text-2xl font-bold text-yellow-400">
                {reviewQuery?.length
                  ? Math.round((reviewQuery.reduce((acc, r) => acc + r.rating, 0) / reviewQuery.length) * 10) / 10
                  : 0}
              </p>
              <p className="text-sm text-gray-400">Avg Rating</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Profile Sidebar */}
          <div className="xl:col-span-1">
            <div className="bg-gray-800 rounded-lg p-6 space-y-6 sticky top-8">
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-12 h-12 text-black" />
                </div>
                <h2 className="text-xl font-bold mb-2">{username?.split("@")[0]}</h2>
                <div className="flex items-center justify-center gap-2 text-gray-400 mb-2">
                  <Mail className="w-4 h-4" />
                  <span className="text-sm truncate">{email}</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-gray-400">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">Member since {formatDate(user?.created_at)}</span>
                </div>
              </div>

              <div className="border-t border-gray-700 pt-6 space-y-3">
                <button
                  onClick={() => navigate("/lists")}
                  className="w-full bg-yellow-600 hover:bg-yellow-700 text-black font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  <List className="w-4 h-4" />
                  Manage Lists
                </button>
                <button
                  onClick={() => navigate("/settings")}
                  className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </button>
                <button
                  onClick={handleSignOut}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="xl:col-span-3 space-y-8">
            {/* Recent Activity */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-yellow-400" />
                Recent Activity
              </h3>
              <div className="space-y-3">
                {reviewQuery?.slice(0, 3).map((review, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg">
                    <MessageSquare className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-300">
                        You reviewed <span className="text-yellow-400 font-semibold">{review.title}</span>
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-600"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
                {watchList?.slice(0, 2).map((item, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg">
                    <Star className="w-5 h-5 text-blue-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-300">
                        Added <span className="text-yellow-400 font-semibold">{item.title}</span> to watchlist
                      </p>
                    </div>
                  </div>
                ))}
                {!reviewQuery?.length && !watchList?.length && (
                  <div className="text-center py-8 text-gray-400">
                    <TrendingUp className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                    <p>No recent activity</p>
                    <p className="text-sm">Start watching and reviewing movies!</p>
                  </div>
                )}
              </div>
            </div>

            {/* Watchlist Section */}
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-400" />
                  My Watchlist ({watchList?.length || 0})
                </h3>
                {watchList?.length > 6 && (
                  <button
                    onClick={() => navigate("/watchlist")}
                    className="text-yellow-400 hover:text-yellow-300 text-sm font-semibold"
                  >
                    View All
                  </button>
                )}
              </div>

              {watchlistPending ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {[...Array(6)].map((_, index) => (
                    <div key={index} className="animate-pulse">
                      <div className="bg-gray-700 rounded-lg aspect-[2/3] mb-2"></div>
                      <div className="h-4 bg-gray-700 rounded mb-2"></div>
                      <div className="h-8 bg-gray-700 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : watchList && watchList.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {watchList.slice(0, 6).map((item, index) => (
                    <div
                      key={index}
                      className="bg-gray-700 rounded-lg overflow-hidden group hover:transform hover:scale-105 transition-all duration-300"
                    >
                      <div className="relative">
                        <img
                          src={`https://image.tmdb.org/t/p/w500/${item.poster}`}
                          alt={item.title}
                          className="w-full aspect-[2/3] object-cover"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-300 flex items-center justify-center gap-2">
                          <button
                            onClick={() => navigate(`/movie/${item.tmID}`)}
                            className="opacity-0 group-hover:opacity-100 bg-yellow-600 hover:bg-yellow-700 text-black font-semibold p-2 rounded-full transition-all duration-300"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteFromWatchlist({ tmID: item.tmID })}
                            className="opacity-0 group-hover:opacity-100 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full transition-all duration-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="p-3">
                        <h4 className="font-semibold text-sm line-clamp-2">{item.title}</h4>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Film className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                  <h4 className="text-xl font-semibold mb-2">Your Watchlist is Empty</h4>
                  <p className="text-gray-400 mb-6">
                    Start adding movies and TV shows to keep track of what you want to watch
                  </p>
                  <button
                    onClick={() => navigate("/")}
                    className="bg-yellow-600 hover:bg-yellow-700 text-black font-semibold px-6 py-3 rounded-lg transition-colors"
                  >
                    Browse Movies
                  </button>
                </div>
              )}
            </div>

            {/* Reviews Section */}
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-yellow-400" />
                  My Reviews ({reviewQuery?.length || 0})
                </h3>
                {reviewQuery?.length > 3 && (
                  <button
                    onClick={() => navigate("/reviews")}
                    className="text-yellow-400 hover:text-yellow-300 text-sm font-semibold"
                  >
                    View All
                  </button>
                )}
              </div>

              {reviewsPending ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, index) => (
                    <div key={index} className="animate-pulse bg-gray-700 rounded-lg p-4">
                      <div className="h-4 bg-gray-600 rounded mb-2"></div>
                      <div className="h-3 bg-gray-600 rounded mb-2 w-3/4"></div>
                      <div className="h-16 bg-gray-600 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : reviewQuery && reviewQuery.length > 0 ? (
                <div className="space-y-4">
  {reviewQuery.slice(0, 3).map((review, index) => (
    <div key={index} className="bg-slate-900 rounded-xl p-4 shadow-md">
      <div className="flex flex-col md:flex-row gap-4">
        <img
          className="w-20 h-28 md:w-16 md:h-24 rounded-lg object-cover"
          src={`https://image.tmdb.org/t/p/w200${review.poster}`}
          alt={`${review.title} poster`}
        />
        
        <div className="flex-1 min-w-0 space-y-1">
          <h4 className="text-yellow-400 font-semibold text-lg truncate">{review.title}</h4>
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-600"
                }`}
              />
            ))}
            <span className="text-sm text-gray-400 ml-1">{review.rating}/5</span>
          </div>
          <p className="text-gray-300 text-sm line-clamp-2 italic">"{review.review}"</p>
        </div>

        <div className="flex items-start md:items-center justify-end md:ml-4">
          <button
            onClick={() => deleteUserReview({ tmID: review.tmID })}
            disabled={DeletePending}
            className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white p-2 rounded-lg transition-colors"
            aria-label="Delete Review"
          >
            {DeletePending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  ))}
</div>

              ) : (
                <div className="text-center py-12">
                  <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                  <h4 className="text-xl font-semibold mb-2">No Reviews Yet</h4>
                  <p className="text-gray-400 mb-6">Share your thoughts about movies and TV shows you've watched</p>
                  <button
                    onClick={() => navigate("/")}
                    className="bg-yellow-600 hover:bg-yellow-700 text-black font-semibold px-6 py-3 rounded-lg transition-colors"
                  >
                    Start Reviewing
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

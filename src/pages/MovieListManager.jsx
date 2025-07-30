

import { useState, useRef } from "react" // Import useRef
import { supabase } from "../db/supabase"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { toast } from "sonner"
import domtoimage from "dom-to-image-more" // Import dom-to-image-more
import {
  Plus,
  Search,
  Trash2,
  Film,
  List,
  Star,
  Calendar,
  Loader2,
  FolderPlus,
  FilmIcon as MovieIcon,
  Grid3X3,
  X,
  ChevronLeft,
  ChevronRight,
  GripVertical,
  Share2,
} from "lucide-react"

export default function MovieListManager() {
  const [title, setTitle] = useState("")
  const [selectedList, setSelectedList] = useState(null)
  const [search, setSearch] = useState("")
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showAddMovieModal, setShowAddMovieModal] = useState(false)
  const [isGeneratingImage, setIsGeneratingImage] = useState(false)
  const queryClient = useQueryClient()
  const [draggedItem, setDraggedItem] = useState(null)
  const [dragOverItem, setDragOverItem] = useState(null)

  const listContainerRef = useRef(null) 

 
  const { data: searchResults, isLoading: searchLoading } = useQuery({
    queryKey: ["tmdb-search", search],
    queryFn: async () => {
      if (!search) return []
      const res = await axios.get(
        `https://api.themoviedb.org/3/search/movie?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&query=${search}`,
      )
      return res.data.results
    },
    enabled: !!search,
  })

  
  const { data: lists, isLoading: loadingLists } = useQuery({
    queryKey: ["user-lists"],
    queryFn: async () => {
      const { data, error } = await supabase.from("movie_lists").select("*").order("created_at", { ascending: false })
      if (error) throw error
      return data
    },
  })

  
  const createList = useMutation({
    mutationFn: async () => {
      const user = await supabase.auth.getUser()
      const { error } = await supabase.from("movie_lists").insert({ title, user_id: user.data.user.id })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["user-lists"])
      setTitle("")
      setShowCreateForm(false)
      toast.success("List created successfully!")
    },
    onError: () => {
      toast.error("Failed to create list")
    },
  })

 
  const deleteList = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from("movie_lists").delete().eq("id", id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["user-lists"])
      toast.success("List deleted")
      if (selectedList?.id === arguments[0]) {
        setSelectedList(null)
      }
    },
    onError: () => {
      toast.error("Failed to delete list")
    },
  })

  
  const { data: movies, isLoading: loadingMovies } = useQuery({
    queryKey: ["movies", selectedList?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("movie_list_items")
        .select("*")
        .eq("list_id", selectedList.id)
        .order("rank", { ascending: true })
      if (error) throw error
      return data
    },
    enabled: !!selectedList?.id,
  })


  const addMovie = useMutation({
    mutationFn: async (movie) => {
    
      const { data: existingMovies } = await supabase
        .from("movie_list_items")
        .select("rank")
        .eq("list_id", selectedList.id)
        .order("rank", { ascending: false })
        .limit(1)

      const nextRank = existingMovies && existingMovies.length > 0 ? existingMovies[0].rank + 1 : 1

      const { error } = await supabase.from("movie_list_items").insert({
        list_id: selectedList.id,
        tmdb_id: movie.id.toString(),
        title: movie.title,
        poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
        rank: nextRank,
      })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["movies", selectedList.id])
      toast.success("Movie added to list!")
      setSearch("")
    },
    onError: () => {
      toast.error("Failed to add movie")
    },
  })


  const deleteMovie = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from("movie_list_items").delete().eq("id", id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["movies", selectedList.id])
      toast.success("Movie removed from list")
    },
    onError: () => {
      toast.error("Failed to remove movie")
    },
  })

 
  const updateMovieRank = useMutation({
    mutationFn: async ({ movieId, newRank }) => {
      const { error } = await supabase.from("movie_list_items").update({ rank: newRank }).eq("id", movieId)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["movies", selectedList.id])
    },
    onError: () => {
      toast.error("Failed to update movie position")
    },
  })


  const reorderMovies = async (sourceIndex, destinationIndex) => {
    if (!movies || sourceIndex === destinationIndex) return

    const reorderedMovies = [...movies]
    const [movedMovie] = reorderedMovies.splice(sourceIndex, 1)
    reorderedMovies.splice(destinationIndex, 0, movedMovie)

 
    const updates = reorderedMovies.map((movie, index) => ({
      id: movie.id,
      rank: index + 1,
    }))

    try {
      for (const update of updates) {
        await supabase.from("movie_list_items").update({ rank: update.rank }).eq("id", update.id)
      }
      queryClient.invalidateQueries(["movies", selectedList.id])
      toast.success("Movies reordered successfully!")
    } catch (error) {
      toast.error("Failed to reorder movies")
    }
  }


  const moveMovie = (movieIndex, direction) => {
    const newIndex = direction === "left" ? movieIndex - 1 : movieIndex + 1
    if (newIndex >= 0 && newIndex < movies.length) {
      reorderMovies(movieIndex, newIndex)
    }
  }

  
  const generateListImage = async () => {
    if (!movies || movies.length === 0) {
      toast.error("No movies in list to share")
      return
    }
    if (!listContainerRef.current) {
      toast.error("Could not find list container to capture.")
      return
    }

    setIsGeneratingImage(true)
    toast.info("Generating image...")

    try {
      const dataUrl = await domtoimage.toPng(listContainerRef.current, { quality: 0.95 })

      const a = document.createElement("a")
      a.href = dataUrl
      a.download = `${selectedList.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_movie_list.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)

      toast.success("Image downloaded successfully!")
    } catch (error) {
      console.error("Error generating image:", error)
      toast.error("Failed to generate image")
    } finally {
      setIsGeneratingImage(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    return new Date(dateString).getFullYear()
  }

  const handleCloseAddMovieModal = () => {
    setShowAddMovieModal(false)
    setSearch("")
  }

  
  const handleDragStart = (e, movie, index) => {
    setDraggedItem({ movie, index })
    e.dataTransfer.effectAllowed = "move"

  
    const img = new Image()
    img.crossOrigin = "anonymous" 
    img.src = movie.poster_url || "/placeholder.svg?height=75&width=50" 
    img.onload = () => {
     
      e.dataTransfer.setDragImage(img, 25, 37.5) 
    }
    img.onerror = () => {
     
      const fallbackImg = new Image()
      fallbackImg.src = "/placeholder.svg?height=75&width=50"
      e.dataTransfer.setDragImage(fallbackImg, 25, 37.5)
    }
  }

  const handleDragOver = (e, index) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    setDragOverItem(index)
  }

  const handleDragLeave = () => {
    setDragOverItem(null)
  }

  const handleDrop = (e, dropIndex) => {
    e.preventDefault()
    if (draggedItem && draggedItem.index !== dropIndex) {
      reorderMovies(draggedItem.index, dropIndex)
    }
    setDraggedItem(null)
    setDragOverItem(null)
  }

  const handleDragEnd = () => {
    setDraggedItem(null)
    setDragOverItem(null)
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <List className="w-10 h-10 text-yellow-400" />
              My Movie Lists
            </h1>
            <p className="text-gray-400">Create and manage your custom movie collections</p>
          </div>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-yellow-600 hover:bg-yellow-700 text-black font-semibold px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="w-5 h-5" />
            New List
          </button>
        </div>

        {/* Create Form Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-yellow-400" />
                Create New List
              </h2>
              <div className="space-y-4">
                <input
                  placeholder="Enter list title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 text-white placeholder-gray-400 p-3 rounded-lg focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400"
                  autoFocus
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => createList.mutate()}
                    disabled={!title.trim() || createList.isPending}
                    className="flex-1 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-black font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
                  >
                    {createList.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    Create
                  </button>
                  <button
                    onClick={() => {
                      setShowCreateForm(false)
                      setTitle("")
                    }}
                    className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Movie Modal */}
        {showAddMovieModal && selectedList && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg w-full max-w-4xl mx-4 max-h-[90vh] flex flex-col">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-700">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Search className="w-5 h-5 text-yellow-400" />
                  Add Movies to "{selectedList.title}"
                </h2>
                <button
                  onClick={handleCloseAddMovieModal}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Search Input */}
              <div className="p-6 border-b border-gray-700">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    placeholder="Search movies on TMDb..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-gray-700 border border-gray-600 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 text-lg"
                    autoFocus
                  />
                </div>
              </div>

              {/* Search Results */}
              <div className="flex-1 overflow-y-auto p-6">
                {searchLoading && search && (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-yellow-400" />
                    <span className="ml-3 text-gray-400">Searching movies...</span>
                  </div>
                )}

                {searchResults && searchResults.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {searchResults.slice(0, 10).map((movie) => (
                      <div
                        key={movie.id}
                        className="flex items-center gap-4 bg-gray-700 p-4 rounded-lg hover:bg-gray-600 transition-colors"
                      >
                        {movie.poster_path ? (
                          <img
                            src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                            alt={movie.title || "Movie poster"}
                            className="w-16 h-24 object-cover rounded"
                          />
                        ) : (
                          <div className="w-16 h-24 bg-gray-600 rounded flex items-center justify-center">
                            <Film className="w-8 h-8 text-gray-400" />
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-white truncate text-lg">{movie.title}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-400 mt-1">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>{formatDate(movie.release_date)}</span>
                            </div>
                            {movie.vote_average > 0 && (
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                <span>{movie.vote_average.toFixed(1)}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => addMovie.mutate(movie)}
                          disabled={addMovie.isPending}
                          className="bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 text-black font-semibold px-6 py-3 rounded-lg flex items-center gap-2 transition-colors text-sm md:text-base"
                        >
                          {addMovie.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Plus className="w-4 h-4" />
                          )}
                          Add
                        </button>
                      </div>
                    ))}
                  </div>
                ) : search && !searchLoading && searchResults?.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <Search className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                    <h3 className="text-xl font-semibold mb-2">No Results Found</h3>
                    <p>No movies found for "{search}"</p>
                    <p className="text-sm mt-1">Try a different search term</p>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    <Search className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                    <h3 className="text-xl font-semibold mb-2">Search for Movies</h3>
                    <p>Start typing to search for movies to add to your list</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Lists Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Grid3X3 className="w-6 h-6 text-yellow-400" />
            Your Lists ({lists?.length || 0})
          </h2>

          {loadingLists ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="bg-gray-800 rounded-lg p-6 animate-pulse">
                  <div className="h-6 bg-gray-700 rounded mb-4"></div>
                  <div className="h-4 bg-gray-700 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : lists && lists.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {lists.map((list) => (
                <div
                  key={list.id}
                  className={`bg-gray-800 rounded-lg p-6 cursor-pointer transition-all duration-300 hover:transform hover:scale-105 border-2 ${
                    selectedList?.id === list.id
                      ? "border-yellow-400 bg-gray-750"
                      : "border-transparent hover:border-gray-600"
                  }`}
                  onClick={() => setSelectedList(selectedList?.id === list.id ? null : list)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-yellow-600 rounded-lg flex items-center justify-center">
                        <List className="w-6 h-6 text-black" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{list.title}</h3>
                        <p className="text-sm text-gray-400">
                          Created {new Date(list.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteList.mutate(list.id)
                      }}
                      className="p-2 hover:bg-red-600 hover:bg-opacity-20 rounded-lg transition-colors text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="text-sm text-gray-400">
                    {selectedList?.id === list.id ? "Click to collapse" : "Click to expand"}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-gray-800 rounded-lg">
              <List className="w-20 h-20 mx-auto mb-6 text-gray-600" />
              <h3 className="text-2xl font-bold mb-4">No Lists Yet</h3>
              <p className="text-gray-400 mb-6">Create your first movie list to get started</p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-yellow-600 hover:bg-yellow-700 text-black font-semibold px-6 py-3 rounded-lg flex items-center gap-2 mx-auto transition-colors"
              >
                <Plus className="w-5 h-5" />
                Create Your First List
              </button>
            </div>
          )}
        </div>

        {/* Selected List Content */}
        {selectedList && (
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <MovieIcon className="w-5 h-5 text-yellow-400" />
                Movies in "{selectedList.title}" ({movies?.length || 0})
              </h2>
              <div className="flex gap-3">
                <button
                  onClick={generateListImage}
                  disabled={isGeneratingImage || !movies || movies.length === 0}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm md:text-base"
                >
                  {isGeneratingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />}
                  {isGeneratingImage ? "Generating..." : "Share as Image"}
                </button>
                <button
                  onClick={() => setShowAddMovieModal(true)}
                  className="bg-yellow-600 hover:bg-yellow-700 text-black font-semibold px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm md:text-base"
                >
                  <Plus className="w-4 h-4" />
                  Add Movies
                </button>
              </div>
            </div>

            {loadingMovies ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {[...Array(12)].map((_, index) => (
                  <div key={index} className="animate-pulse">
                    <div className="bg-gray-700 rounded-lg aspect-[2/3] mb-2"></div>
                    <div className="h-4 bg-gray-700 rounded"></div>
                  </div>
                ))}
              </div>
            ) : movies && movies.length > 0 ? (
              <div
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
                ref={listContainerRef}
              >
                {movies.map((movie, index) => (
                  <div
                    key={movie.id}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, index)}
                    onDragEnd={handleDragEnd}
                    className={`bg-gray-700 rounded-lg overflow-hidden group hover:transform hover:scale-105 transition-all duration-300 relative ${
                      dragOverItem === index ? "ring-2 ring-yellow-400" : ""
                    } ${draggedItem?.index === index ? "opacity-50" : ""}`}
                  >
                    {/* Rank Badge */}
                    <div className="absolute top-2 left-2 bg-yellow-600 text-black text-xs font-bold px-2 py-1 rounded-full z-10">
                      #{movie.rank}
                    </div>

                    {/* Drag Handle */}
                    <div
                      draggable
                      onDragStart={(e) => handleDragStart(e, movie, index)}
                      className="absolute top-1/2 -translate-y-1/2 right-10 opacity-0 group-hover:opacity-100 bg-black bg-opacity-75 rounded p-1 z-10 transition-opacity cursor-grab"
                    >
                      <GripVertical className="w-4 h-4 text-white" />
                    </div>

                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteMovie.mutate(movie.id)
                      }}
                      className="absolute top-1/2 -translate-y-1/2 left-2 opacity-0 group-hover:opacity-100 bg-red-600 hover:bg-red-700 text-white p-1 rounded-full transition-all duration-300 z-10"
                      title="Remove from list"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="relative">
                      <img
                        src={movie.poster_url || "/placeholder.svg?height=225&width=150&query=movie poster"}
                        alt={movie.title || "Movie poster"}
                        className="w-full aspect-[2/3] object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-300 flex items-end justify-center p-3 gap-2">
                        {/* Move Left Button */}
                        {index > 0 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              moveMovie(index, "left")
                            }}
                            className="opacity-0 group-hover:opacity-100 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full transition-all duration-300 text-sm md:text-base"
                            title="Move left"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                        )}

                        {/* Move Right Button */}
                        {index < movies.length - 1 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              moveMovie(index, "right")
                            }}
                            className="opacity-0 group-hover:opacity-100 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full transition-all duration-300 text-sm md:text-base"
                            title="Move right"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="p-3">
                      <h3 className="font-semibold text-sm line-clamp-2">{movie.title}</h3>
                      <p className="text-xs text-gray-400 mt-1">Rank #{movie.rank}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 text-gray-400">
                <Film className="w-20 h-20 mx-auto mb-6 text-gray-600" />
                <h3 className="text-2xl font-bold mb-4">Empty List</h3>
                <p className="text-lg mb-4">No movies in "{selectedList.title}" yet</p>
                <button
                  onClick={() => setShowAddMovieModal(true)}
                  className="bg-yellow-600 hover:bg-yellow-700 text-black font-semibold px-6 py-3 rounded-lg flex items-center gap-2 mx-auto transition-colors text-sm md:text-base"
                >
                  <Plus className="w-5 h-5" />
                  Add Your First Movie
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

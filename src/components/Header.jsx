

import { NavLink } from "react-router"
import { useState, useRef, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { useNavigate } from "react-router"
import { Search, Menu, X, Film, Tv, User, Home, Brain,LogIn } from "lucide-react"
import axios from "axios"
import { useAuth } from "../authStore/authStore"


export const Header = () => {
  const { session } = useAuth()
  const [search, setSearch] = useState("")
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const navigate = useNavigate()
  const searchRef = useRef(null)

  const fetchSearchResults = async () => {
    if (!search.trim()) return []
    try {
      const TMDB = `https://api.themoviedb.org/3/search/multi?api_key=${import.meta.env.VITE_TMDB_API_KEY}&query=${search}`
      const res = await axios.get(TMDB)
      return res.data.results || []
    } catch (error) {
      console.log(error)
      return []
    }
  }

  const { data: searchResults, isPending } = useQuery({
    queryKey: ["searchQuery", search],
    queryFn: fetchSearchResults,
    enabled: search.trim().length > 0,
  })

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSearchItemClick = (item) => {
    navigate(`/${item.media_type}/${item.id}`)
    setSearch("")
    setIsSearchOpen(false)
  }

  const getMediaIcon = (mediaType) => {
    switch (mediaType) {
      case "movie":
        return <Film className="w-4 h-4" />
      case "tv":
        return <Tv className="w-4 h-4" />
      default:
        return <User className="w-4 h-4" />
    }
  }

  const navLinks = [
    { to: "/", label: "Home", icon: <Home className="w-4 h-4" /> },
    { to: "/top-rated-movies/1", label: "Top Movies", icon: <Film className="w-4 h-4" /> },
    { to: "/top-rated-tv-shows/1", label: "Top TV Shows", icon: <Tv className="w-4 h-4" /> },
     { to: "/ai", label: "AI Suggestions", icon: <Brain className="w-4 h-4" /> },

   
  ]

  return (
    <header className="bg-gray-900 text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <NavLink to="/" className="flex  gap-x-1 text-xl font-bold text-yellow-400 hover:text-yellow-300 transition-colors">
              <img src='/logo.svg' alt="Logo" className="w-[50px]"/> <span className="max-md:hidden">Flix Finder</span>
            </NavLink>

            <nav className="hidden lg:flex items-center space-x-6">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors px-3 py-2 rounded-md hover:bg-gray-800"
                >
                  {link.icon}
                  <span>{link.label}</span>
                </NavLink>
              ))}
              
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative hidden lg:block" ref={searchRef}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="search"
                  placeholder="Search movies, TV shows..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value)
                    setIsSearchOpen(true)
                  }}
                  onFocus={() => setIsSearchOpen(true)}
                  className="w-80 pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400"
                />
              </div>

              {isSearchOpen && search.trim() && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-xl max-h-96 overflow-y-auto z-50">
                  {isPending ? (
                    <div className="p-4 text-center text-gray-400">Searching...</div>
                  ) : searchResults && searchResults.length > 0 ? (
                    <div className="py-2">
                      {searchResults.slice(0, 8).map((item, index) => (
                        <button
                          key={index}
                          onClick={() => handleSearchItemClick(item)}
                          className="w-full px-4 py-3 text-left hover:bg-gray-700 transition-colors flex items-center space-x-3"
                        >
                          <img
                            src={
                              item.poster_path
                                ? `https://image.tmdb.org/t/p/w92${item.poster_path}`
                                : "/placeholder.svg?height=60&width=40"
                            }
                            alt={item.title || item.name}
                            className="w-10 h-15 object-cover rounded"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-white truncate">{item.title || item.name}</p>
                            <div className="flex items-center space-x-2 text-sm text-gray-400">
                              {getMediaIcon(item.media_type)}
                              <span className="capitalize">{item.media_type}</span>
                              {item.release_date && <span>• {new Date(item.release_date).getFullYear()}</span>}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-gray-400">No results found</div>
                  )}
                </div>
              )}
            </div>

            {session ? (
              <NavLink
                to="/account"
                aria-label="Link to Account Page"
                className="flex items-center space-x-2 bg-yellow-600 hover:bg-yellow-700 text-black font-semibold px-4 py-2 rounded-lg transition-colors"
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Account</span>
              </NavLink>
            ) : (
              <NavLink
                to="/sign-in"
                aria-label="Link to Sign In Page"
                className="bg-yellow-600 hover:bg-yellow-700 text-black font-semibold px-4 py-2 rounded-lg transition-colors"
              > 
                <div className="flex items-center gap-x-2">
                  <LogIn size={18}/>
                  <span className="max-md:hidden">Sign In</span>
                  
                </div>
               
              </NavLink>
            )}

            <button
              id="menuButton" 
              aria-label="Menu Button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-md hover:bg-gray-800 transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-800">
            <div className="py-4 space-y-2">
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="search"
                    placeholder="Search movies, TV shows..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400"
                  />
                </div>
                {search.trim() && searchResults && searchResults.length > 0 && (
                  <div className="mt-2 bg-gray-800 border border-gray-700 rounded-lg max-h-60 overflow-y-auto">
                    {searchResults.slice(0, 5).map((item, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          handleSearchItemClick(item)
                          setIsMobileMenuOpen(false)
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-gray-700 transition-colors flex items-center space-x-3"
                      >
                        <img
                          src={
                            item.poster_path
                              ? `https://image.tmdb.org/t/p/w92${item.poster_path}`
                              : "/placeholder.svg?height=60&width=40"
                          }
                          alt={item.title || item.name}
                          className="w-8 h-12 object-cover rounded"
                        />
                        <div>
                          <p className="font-semibold text-white text-sm">{item.title || item.name}</p>
                          <p className="text-xs text-gray-400 capitalize">{item.media_type}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center space-x-3 text-gray-300 hover:text-white hover:bg-gray-800 px-4 py-3 rounded-md transition-colors"
                >
                  {link.icon}
                  <span>{link.label}</span>
                </NavLink>
              ))}

              
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { Route, Routes } from "react-router";
import Home from "./pages/Home";
import TopRatedMovies from "./pages/TopRatedMovies";
import TopRatedTVShows from "./pages/TopRatedTVShows";
import { Toaster } from "sonner";
import ScrollToTop from "./components/ScrollToTop";
import { useEffect } from "react";
import { useAuth } from "./authStore/authStore";
import { supabase } from "./db/supabase";
import { lazy, Suspense } from "react";

const NotFound = lazy(() => import("./pages/NotFound"));
const Account = lazy(() => import("./pages/Account"));
const SignIn = lazy(() => import("./pages/SignIn"));
const MovieView = lazy(()=>import('./pages/MovieView'))
const Gemini = lazy(()=>import('./pages/Gemini'))
const MovieListManager = lazy(()=>import('./pages/MovieListManager'))

function App() {
  const { session, fetchSession, setSession } = useAuth();
  useEffect(() => {
    // Initial fetch of the session
    fetchSession();

    // Listen to auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session); // update Zustand store directly
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);
  return (
    <>
      <div>
        <Header />

        <ScrollToTop />

        <Routes>
          <Route path="/" element={<Home />}></Route>

          <Route
            path="/sign-in"
            element={
              <Suspense
                fallback={
                  <div className="min-h-screen flex items-center justify-center">
                    {" "}
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-yellow-400"></div>
                  </div>
                }
              >
                <SignIn />
              </Suspense>
            }
          ></Route>

          <Route
            path="/top-rated-movies/:pgno"
            element={<TopRatedMovies />}
          ></Route>

          <Route
            path="/top-rated-tv-shows/:pgno"
            element={<TopRatedTVShows />}
          ></Route>

          <Route
            path="/:type/:tmdbid"
            element={
              <Suspense
                fallback={
                  <div className="min-h-screen flex items-center justify-center">
                    {" "}
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-yellow-400"></div>
                  </div>
                }
              >
                <MovieView />
              </Suspense>
            }
          ></Route>

          <Route
            path="/account"
            element={
              <Suspense
                fallback={
                  <div className="min-h-screen flex items-center justify-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-yellow-400"></div>
                  </div>
                }
              >
                <Account />
              </Suspense>
            }
          />

          

          {session ? (
            <Route
              path="/lists"
              element={
                <Suspense
                  fallback={
                    <div className="min-h-screen flex items-center justify-center">
                      {" "}
                      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-yellow-400"></div>
                    </div>
                  }
                >
                  <MovieListManager />
                </Suspense>
              }
            ></Route>): null}

          <Route
            path="/ai"
            element={
              <Suspense
                fallback={
                  <div className="min-h-screen flex items-center justify-center">
                    {" "}
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-yellow-400"></div>
                  </div>
                }
              >
                <Gemini />
              </Suspense>
            }
          ></Route>

          <Route
            path="*"
            element={
              <Suspense
                fallback={
                  <div className="min-h-screen flex items-center justify-center">
                    {" "}
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-yellow-400"></div>
                  </div>
                }
              >
                <NotFound />
              </Suspense>
            }
          ></Route>
        </Routes>

        <Footer />
        <Toaster richColors position="top-center" />
      </div>
    </>
  );
}

export default App;

import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { Route, Routes } from "react-router";
import Home from "./pages/Home";
import TopRatedMovies from "./pages/TopRatedMovies";
import TopRatedTVShows from "./pages/TopRatedTVShows";
import { Toaster } from "sonner";
import SignIn from "./pages/SignIn";
import MovieView from "./pages/MovieView";
import NotFound from "./pages/NotFound";
import Account from "./pages/Account";
import MovieListManager from "./pages/MovieListManager";
import Gemini from "./pages/Gemini";
import ScrollToTop from "./components/ScrollToTop";
import { useEffect } from "react";
import { useAuth } from "./authStore/authStore";
import { supabase } from "./db/supabase";



function App() {

  const {session, fetchSession,setSession}= useAuth()
   useEffect(() => {
    // Initial fetch of the session
    fetchSession();

    // Listen to auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session); // update Zustand store directly
    });

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

          <Route path="/sign-in" element={<SignIn />}></Route>

          <Route
            path="/top-rated-movies/:pgno"
            element={<TopRatedMovies />}
          ></Route>

          <Route
            path="/top-rated-tv-shows/:pgno"
            element={<TopRatedTVShows />}
          ></Route>

          <Route path="/:type/:tmdbid" element={<MovieView />}></Route>

          <Route path="/account" element={<Account />}></Route>

          

          {session ?<Route path="/lists" element={<MovieListManager/>}></Route>: null}

          <Route path="/ai" element={<Gemini />}></Route>

          <Route path="*" element={<NotFound />}></Route>



        </Routes>

        <Footer />
        <Toaster richColors position="top-center" />
      </div>
    </>
  );
}

export default App;


import { createContext, useContext, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../db/supabase";

const AuthContext = createContext();

const fetchSession = async () => {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
};

export const AuthProvider = ({ children }) => {
  const queryClient = useQueryClient();

  const {
    data: session,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["authSession"],
    queryFn: fetchSession,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      queryClient.setQueryData(["authSession"], session); // update session in cache
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [queryClient]);

  return (
    <AuthContext.Provider value={{ session, isLoading, isError }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

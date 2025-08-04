import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase } from "../db/supabase";

export const useAuth = create(
  persist((set) => {
    set(() => ({
      session: null,
      isLoading: true,
      isError: null,

      fetchSession: async () => {
        set({ isLoading: true });
        try {
          const { data, error } = await supabase.auth.getSession();
          if (error) throw error;
          set({ session: data.session, isLoading: false });
        } catch (err) {
          set({ isError: err.message, isLoading: false });
        }
      },
      setSession: (session) => set({ session }),
      signOut: async () => {
        await supabase.auth.signOut();
        set({ session: null });
      },
    })),
      {
        name: "authSession",
        partialize: (state) => ({ session: state.session }), // only persist session
      };
  })
);

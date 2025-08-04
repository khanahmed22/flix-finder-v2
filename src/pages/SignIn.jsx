// App.jsx
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "../db/supabase";
import { useNavigate } from "react-router";
import { useAuth } from "../authStore/authStore";

export default function SignIn() {
  const { session, isLoading } = useAuth();
  const navigate = useNavigate();
  //const user = session?.user;
 // const email = user?.email;
 // const username =
   // user?.user_metadata?.full_name || user?.user_metadata?.name || email;

  

  if (isLoading) return <p>Loading session...</p>;

  if (!session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="w-[600px] max-md:w-fit">
        <Auth
          supabaseClient={supabase}
         
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: "#ca8a04 ",
                  brandAccent: "#bebb10",
                },
              },
            },
          }}
          providers={["google"]}
        />
        </div>
      </div>
    );
  }

  return navigate("/account");
}

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "../db/supabase"; // Adjust the path based on your project structure

export default function MovieListManager() {
  const [title, setTitle] = useState("");
  const [listName, setListName] = useState("");

  // Function to append a movie title to a text[] array in Supabase
  const addMovie = async ({ title, listName }) => {
    // Step 1: Fetch the current titles for the list
    const { data: current, error: fetchError } = await supabase
      .from("lists")
      .select("title")
      .eq("listName", listName)
      .single();

    if (fetchError) {
      console.error("Fetch error:", fetchError);
      throw fetchError;
    }

    // Step 2: Append the new title to the array
    const updatedTitles = [...(current?.title || []), title];

    // Step 3: Update the array in Supabase
    const { data, error } = await supabase
      .from("lists")
      .update({ title: updatedTitles })
      .eq("listName", listName);

    if (error) {
      console.error("Update error:", error);
      throw error;
    }

    return data;
  };

  // React Query mutation setup
  const { mutate: addMovieM, isPending } = useMutation({
    mutationKey: ["ADDMOVIE"],
    mutationFn: addMovie,
    onSuccess: () => {
      console.log("Movie added successfully");
      setTitle("");
    },
    onError: (err) => {
      console.error("Failed to add movie:", err);
    },
  });

  // Form handler
  const handleSubmit = (e) => {
    e.preventDefault();
    if (title && listName) {
      addMovieM({ title, listName });
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4">Add Movie to List</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Movie Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded"
          required
        />
        <input
          type="text"
          placeholder="List Name"
          value={listName}
          onChange={(e) => setListName(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded"
          required
        />
        <button
          type="submit"
          disabled={isPending}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {isPending ? "Adding..." : "Add Movie"}
        </button>
      </form>
    </div>
  );
}

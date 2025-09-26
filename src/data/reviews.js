import { supabase } from "../supabase";

export const addReviewAsync = async (reviewText) => {
  if (!reviewText) {
    throw new Error("Review text cannot be empty.");
  }

  const { data, error } = await supabase
    .from("review")
    .insert([{ review: reviewText }])
    .select(); // Use .select() to get the inserted row back

  if (error) {
    console.error("Error adding review:", error);
    throw new Error("Failed to submit review. Please try again later.");
  }

  return data[0];
};

export const getAllReviewsAsync = async () => {
  const { data, error } = await supabase
    .from("review")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching reviews:", error);
    throw new Error("Failed to fetch reviews.");
  }

  return data;
};
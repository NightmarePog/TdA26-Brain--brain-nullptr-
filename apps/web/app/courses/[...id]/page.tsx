"use client";
import { useParams } from "next/navigation";

const Course = () => {
  const params = useParams();
  const { id } = params;
  return <p>TODO {id}</p>;
};

export default Course;

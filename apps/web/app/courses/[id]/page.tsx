"use client";
import { useRouter } from "next/navigation";
import { use, useEffect } from "react";

export default function CourseRouter({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);
  useEffect(() => {
    router.push(`/courses/${id}/materials`);
  }, [id, router]);

  return null;
}

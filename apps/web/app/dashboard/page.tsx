"use client";
import AppCard from "@/components/cards/appCard";
import { Button } from "@/components/ui/button";
import NotFound from "@/components/ui/errorComponents";
import { Input } from "@/components/ui/input";
import { CoursesApi } from "@/lib/api";
import { CourseCreateRequest } from "@/types/api/courses";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Plus } from "phosphor-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import DashboardLayout from "@/features/dashboard/dashboardLayout";

const DashboardPage = () => {
  return <DashboardLayout />;
};

export default DashboardPage;

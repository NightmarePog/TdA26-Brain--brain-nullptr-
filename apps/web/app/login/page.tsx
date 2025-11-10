"use client";

import * as React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeClosed } from "lucide-react";

const formSchema = z.object({
  username: z.string().min(1, "Zadej uživatelské jméno"),
  password: z.string().min(6, "Heslo musí mít alespoň 6 znaků"),
});

const Login = () => {
  const [passwordVisible, setPasswordVisible] = React.useState<boolean>(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    toast.success(`Přihlášen jako ${data.username}`);
    console.log("Data z formuláře:", data);
  };

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-64px)] bg-muted/20 px-4">
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full max-w-md mx-auto"
      >
        <Card className="p-8 shadow-lg border-zinc-500 text-foreground">
          <CardHeader className="space-y-2 text-center">
            <CardTitle className="text-3xl font-bold">Přihlášení</CardTitle>
            <CardDescription className="text-lg text-muted-foreground">
              Zadej své přihlašovací údaje
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Username field */}
            <div className="flex flex-col space-y-2">
              <Label htmlFor="username" className="text-lg">
                Uživatelské jméno
              </Label>
              <Input
                id="username"
                placeholder="např. jan.novak"
                className="text-base p-3"
                {...form.register("username")}
              />
              {form.formState.errors.username && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.username.message}
                </p>
              )}
            </div>

            <div className="flex flex-col space-y-2">
              <Label htmlFor="password" className="text-lg">
                Heslo
              </Label>
              <div className="flex">
                <Input
                  id="password"
                  type={!passwordVisible ? "password" : "text"}
                  placeholder={!passwordVisible ? "••••••••" : "Heslo"}
                  className="text-base p-3"
                  {...form.register("password")}
                />
                <Button
                  type="button"
                  onClick={() => setPasswordVisible(!passwordVisible)}
                  variant={"ghost"}
                >
                  {passwordVisible ? <EyeClosed /> : <Eye />}
                </Button>
              </div>
              {form.formState.errors.password && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-3">
            <Button type="submit" className="w-full py-3 text-lg">
              Přihlásit se
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
};

export default Login;

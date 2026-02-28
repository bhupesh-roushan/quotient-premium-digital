import RegisterForm from "@/components/auth/register-form";
import { getMe } from "@/lib/auth/getMe";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function RegisterPage() {
  const me = await getMe();
  if (me?.ok) redirect("/dashboard");

  return (
    <>
      <header className="flex flex-col gap-4  p-8 sm:p-16 md:p-8 ">
        <div className="flex items-center justify-between gap-2">
          <h1 className="hidden sm:block text-3xl">
            <Link href={"/"} className="font-semibold tracking-tight">
            </Link>
          </h1>
        </div>
      </header>
      <div className="p-8 sm:p-16">
        <div className="max-w-md">
          <RegisterForm />
        </div>
      </div>
    </>
  );
}

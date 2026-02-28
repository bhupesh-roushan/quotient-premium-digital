import { WavyBackgroundDemo } from "@/components/accertainity/wavyauth";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="flex h-screen items-center overflow-hidden mt-[-10]">
        {/* left */}
        <div className="relative hidden w-[50vw]  border-zinc-200 lg:block">
          {/* <img
            src={"./layout.jpg"}
            alt=""
            className="absolute inset-0 h-screen w-full object-cover "
          /> */}
          <WavyBackgroundDemo />
        </div>
         {/* right */}
        <div className="flex-1 z-50">
        
          <div className="mx-auto flex h-full max-w-2xl flex-col">
            {children}
          </div>
          
        </div>

       
        
      </div>
    </>
  );
}

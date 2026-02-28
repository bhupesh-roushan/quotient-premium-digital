import { GlareCard } from "../ui/glare-card";

export function GlareCardDemo({text}:{text:string}) {
  return (
    <GlareCard className="flex flex-col items-center justify-center ">
      <img src="./logowhite.svg" alt="" />
      {/* <p className="text-white font-bold text-xl mt-4">{text}</p> */}
    </GlareCard>
    
  );
}

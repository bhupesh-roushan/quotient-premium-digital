import { HoverBorderGradientDemo } from "@/components/accertainity/sellingbutton";
import NewProductFormRedesigned from "@/components/creator/dashboard/products/new-product-form-redesigned";
import { BackgroundBeams } from "@/components/ui/background-beams";
import Link from "next/link";

function CreatorAddNewProductPage() {
  const formId = "new-product-form";

  return (
    <div className="relative min-h-screen bg-neutral-950 overflow-hidden">
      {/* Background covers entire page including header */}
      <BackgroundBeams className="fixed inset-0 z-0" />
      
      <div className="relative z-10 h-screen flex flex-col">
        <header className="flex flex-col gap-3 p-3 md:p-6 flex-shrink-0">
          <div className="flex items-center justify-between gap-2">
            <h1 className="line-clamp-2 hidden text-xl font-semibold sm:block text-white">
              Publish your template
            </h1>
            <div className="grid flex-1 grid-cols-2 gap-3 sm:flex sm:flex-none">
              <Link href={"/dashboard/products"}>
                <button className="inline-flex h-9 items-center justify-center gap-2 rounded-md px-4 text-xs font-medium text-white transition-all bg-neutral-800/50 border border-neutral-700 backdrop-blur-sm hover:bg-neutral-700/50 hover:border-neutral-600">
                  Cancel
                </button>
              </Link>

              <button
                type="submit"
                form="new-product-form"
                className="inline-flex h-9 items-center justify-center gap-2 rounded-md px-4 text-xs font-medium text-white transition-all bg-violet-500/10 border border-violet-500/30 backdrop-blur-sm hover:bg-violet-500/20"
              >
                Save Draft
              </button>
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-hidden">
          <NewProductFormRedesigned formId={formId} />
        </div>
      </div>
    </div>
  );
}

export default CreatorAddNewProductPage;

import { createSessionClient } from "@/lib/supabase-ssr/server";
import { moveTempToPermStorage } from "@/utils/actions/storage";
import { redirect } from "next/navigation";

export default async function FileUploadPage(){

  const supabase = await createSessionClient();
  const { data } = await supabase.auth.getUser();
  
  if (!data.user)
    return <div>Authentication Failed.</div>
  
  try {
    await moveTempToPermStorage(supabase);
  } catch(error: any) {
    console.error("File upload failed: ", error);
    
    return (
      <div className="h-[calc(100vh-150px)] flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold text-red-600">File processing error</h1>
        <p className="mt-2">An error occured while processing your files. Please try again.</p>
        <p className="text-sm mt-1">Error: {error?.message}</p>
      </div>
    )
  }
  redirect("/auth/login");
  
}
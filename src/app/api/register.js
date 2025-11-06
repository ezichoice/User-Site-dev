import { supabase } from "../../lib/supabase";


export async function  courseRegistration(course){
    try {
        const { error } = await supabase
          .from("courseEnroll")
          .insert([course]);

        if (error) {
          console.log(error);
          return false;
        } else {
          return true;
        }
      } catch (error) {
        console.log(error);
        return false;
      }

}
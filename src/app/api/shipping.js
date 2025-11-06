import { supabase } from "../../lib/supabase";

export async function  fetchVendorOption(vendorId){
    try {
        const { data, error } = await supabase
          .from("vendorOption")
          .select("delivery,storepickup,cash_on_delivery,cardpay")
          .eq("id", vendorId);
    
        if (error) {
          console.log(error);
          return false;
        } else {
            if(data.length === 0) {
                return false;
            }
          return data[0];
        }
      } catch (error) {
        console.log(error);
        return false;
      }

}
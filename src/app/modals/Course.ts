export interface Course {
  name: string;
  id: string;
  img_url: string;
  rating: number;
  offer_price: number;
  actual_price: number;
  vendor_name: string;
  vendor_img: string;
  dealType?: string;
  offer_variation_id: number;
  categories?: string;
  isExpired?: boolean;
  company_name?: string;
  start_date?: Date;
  end_date?: string;
  status?: string;
  referal_link?: string;
  is_in_stock?: boolean;
  vendor_id?: any;
  price?: string;
}

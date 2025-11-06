interface Profile {
  email: string;
  password?: string | null;
  avatar_url?: string | null;
  full_name: string | null;
  user_name: string;
  phone_number?: string | null;
  user_type?: string | null;
  date_of_birth?: string | null;
  national_id?: string | null;
  address_line1?: string | null;
  address_line2?: string | null;
  city?: string | null;
  zip_code?: string | null;
  country?: string | null;
  school_name?: string | null;
  school_id?: string | null;
  school_expiry?: string | null;
  student_proof_url?: string[] | null;
  national_id_proof_url?: string[] | null;
}


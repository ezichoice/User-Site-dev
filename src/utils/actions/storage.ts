'use server'

import { createAdminClient, createSessionClient, createUsernameClient } from '@/lib/supabase-ssr/server';
import { SupabaseClient } from '@supabase/supabase-js';
import * as Yup from 'yup';
import { getCountryData } from '../countryData';
import { editProfileFormValidationSchema } from '../schemas/editProfileForm';
import { createRegistrationValidationSchema, usernameSchema } from '../schemas/registrationForm';

const environment = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

export const checkExistingEmail = async (email: string) => {
  const supabaseAdmin = await createAdminClient();
  
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.listUsers();

  const registeredUser = authError 
    ? null 
    : authData.users.find(user => user.email === email) ?? null;

  return { 
    data: {
      email: registeredUser?.email ?? null,
      provider: registeredUser?.app_metadata.provider ?? null
    }, 
    error: authError 
  };
  
}

export const gSignInWithOAuth = async () => {
  try {
    const supabaseSession = await createSessionClient();
    const { data } = await supabaseSession.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/callback/google`,
      },
    });
    return data.url;
  } catch(error: any) {
    throw new Error("Google sign in failed ", error.message);
  }
}

// This action's sole purpose is to sign up the user and store the files in a temporary bucket. It also passes a reference to these files through the email redirect URL.

export async function signUpWithCredentials(formData: FormData, currentCountryCode: string) : Promise<boolean> {
    
  const fullName = formData.get("fullName") as string;
  const username = formData.get("username") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;
  const phone = formData.get("phone") as string;
        
  const dob = formData.get("dob") as string;
  const userType = formData.get("userType") as string;
  const nationalId = formData.get("nationalId") as string;
        
  const addressLine1 = formData.get("addressLine1") as string;
  const addressLine2 = formData.get("addressLine2") as string;
  const city = formData.get("city") as string;
  const country = formData.get("country") as string;
  const zipCode = formData.get("zipCode") as string;
        
  const schoolName = formData.get("schoolName") as string;
  const schoolId = formData.get("schoolId") as string;
  const schoolExpiry = formData.get("schoolExpiry") as string;

  // append files to FormData object
  const profilePic = formData.get("profilePic") as File;
  const studentProof = formData.getAll("studentProof") as File[];
  const nationalIdProof = formData.getAll("nationalIdProof") as File[];

  const countries = getCountryData();
  const codeIndex = countries.findIndex((country) => country.code === currentCountryCode);

  let cities : string[] = [];
  if(codeIndex !== -1){
    cities = countries[codeIndex].cities;
  }
  // Validate the schema
  const values = {
    profilePic,
    fullName,
    username,
    email,
    password,
    confirmPassword,
    address: {
      addressLine1,
      addressLine2,
      city,
      zipCode,
      // country
    },
    phone,
    userType,
    dob,
    nationalId,
    school: {
      name: schoolName,
      id: schoolId,
      proof: studentProof,
      expiry: schoolExpiry
    },
    nationalIdProof: nationalIdProof
  }

  try {
    // validate the form data
    const schema = createRegistrationValidationSchema(cities);
    await schema.validate(values, { abortEarly: false });

  } catch (error) {
    if (error instanceof Yup.ValidationError) {
      
      const fieldErrors: Record<string, string> = {};
      error.inner.forEach((e) => {
        if (e.path && !fieldErrors[e.path]) {
          fieldErrors[e.path] = e.message
        }
      });
      console.error("Field errors during validation in server: ", fieldErrors);
      
      const messages = JSON.stringify(fieldErrors);
      throw new Error(messages);
    }
    else {
      throw new Error("Unexpected error happened in server");
    }
  }

  // use the admin client to upload files to the temporary bucket.
  const supabaseAdmin = await createAdminClient();
  const supabaseSession = await createSessionClient();
  
  try {
    // check if the user already exists or not
    const { data: existingUser, error: authError } = await checkExistingEmail(email);

    if (authError)
      throw new Error("Error happened while checking for existing user!");

    if (existingUser.email) {
      if (existingUser.provider === "email")
        throw new Error("The email is already registered!");
      else
        throw new Error(`The email is already registered with ${existingUser.provider?.toUpperCase()} sign in!`);
    }
  } catch (error: any) {
    console.error(error.message);
    throw new Error(error.message || "Unexpected error while verifying email");
  }

  // unique id for the temporary folder
  const tempUserId = Math.random().toString(36).substring(2);

  // upload files to profiles bucket
  const uploadedFiles = [];
  try {
    // Add user profile picture
    if (profilePic instanceof File){
        const filePath = `temp-file-uploads/profile-pics/${tempUserId}/${profilePic.name}`;
        const {data: uploadData, error: uploadError} = await supabaseAdmin.storage
          .from("profiles")
          .upload(filePath, profilePic);
      
      if (uploadError)
        throw uploadError;
      uploadedFiles.push(uploadData.path);
    }

    // Add student proof upload if userType is 'student' and file exists
    if (userType === 'student' && Array.isArray(studentProof) && studentProof.length > 0){
      for (const file of studentProof) {
        const filePath = `temp-file-uploads/student-proofs/${tempUserId}/${file.name}`;
        const {data: uploadData, error: uploadError} = await supabaseAdmin.storage
          .from("profiles")
          .upload(filePath, file);
          
        if (uploadError)
          throw uploadError;
          
        uploadedFiles.push(uploadData.path);
      }
    };

    // Add National ID proof upload if userType is 'pension' and file exists
    if (userType === 'pension' && Array.isArray(nationalIdProof) && nationalIdProof.length > 0){
      for (const file of nationalIdProof) {
        const filePath = `temp-file-uploads/national-id-proofs/${tempUserId}/${file.name}`;
        const {data: uploadData, error: uploadError} = await supabaseAdmin.storage
          .from("profiles")
          .upload(filePath, file);
          
        if (uploadError)
          throw uploadError;
          
        uploadedFiles.push(uploadData.path);
      }
    };
        
  } catch (error: any) {
    throw new Error(`File upload failed: ${error.message}`);
  }

  // sign up
  const { error } = await supabaseSession.auth.signUp({
    email: email,
    password: password,
    options: {
      emailRedirectTo: `${environment}/api/register-form`,
      data: {
        // temporary bucket files
        temp_file_paths: uploadedFiles,

        email: email,
        full_name: fullName,
        user_name: username,
        phone_number: phone,
        user_type: userType,
        date_of_birth: dob,
        national_id: nationalId || null,
        address_line1: addressLine1,
        address_line2: addressLine2,
        city: city,
        zip_code: zipCode,
        country: currentCountryCode,
        school_name: userType === 'student' ? schoolName : null,
        school_id: userType === 'student' ? schoolId : null,
        school_expiry: userType === 'student' ? schoolExpiry : null,
      }
    }
  })  
  if (error) {
    throw error;
  }
  return true;
  
}

export async function moveTempToPermStorage(supabase: SupabaseClient) : Promise<boolean> {
  const supabaseAdmin = await createAdminClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("User not authenticated.");
  }

  try {
    // get the user's temporary file paths from their metadata
    const tempFilePaths = user.user_metadata.temp_file_paths || [];
    
    if (tempFilePaths.length === 0)
      return false;
  
    const moveAndSignPromises = tempFilePaths.map(async (tempPath: string) => {

      let destinationFolder: string;

      // determine the destination bucket based on the temporary path.
      if (tempPath.includes("/profile-pics/"))
        destinationFolder = "profile-pics";
      else if (tempPath.includes("/student-proofs/"))
        destinationFolder = "student-proofs";
      else if (tempPath.includes("/national-id-proofs/"))
        destinationFolder = "national-id-proofs";
      else {
        console.warn(`File with unknown path pattern found: ${tempPath}. Skipping.`);
        return null;
      }

      // construct the new path in the permanent bucket using the user's ID.
      const fileName = tempPath.split("/").pop();
      const newPath = `${destinationFolder}/${user.id}/${fileName}`;
      
      // move the file from the temporary bucket to the correct permanent bucket
      
      const { error: moveError } = await supabaseAdmin.storage
        .from(`profiles`)
        .move(tempPath, newPath);

      if (moveError)
        throw new Error(`Failed to move file ${tempPath}: ${moveError.message}`);

      const { data: publicUrlData } = await supabaseAdmin.storage
        .from(`profiles`)
        .getPublicUrl(newPath);

      return {
        path: tempPath,
        url: publicUrlData.publicUrl
      }
    });

    // concurrently execute all move and sign operations
    const results = (await Promise.all(moveAndSignPromises))
      .filter(Boolean); // filters null

    if (results.length === 0)
      throw new Error("No files were successfully moved.");

    const permanentFileUrls: {
      profilePicUrl?: string,
      studentProofUrls?: string[],
      nationalIdProofUrls?: string[],
    } = {
      profilePicUrl: "",
      studentProofUrls: [],
      nationalIdProofUrls: [],
    }

    for (const result of results) {
      if (result.path.includes("/profile-pics/"))
        permanentFileUrls.profilePicUrl = result.url;
      if (result.path.includes("/student-proofs/"))
        permanentFileUrls.studentProofUrls?.push(result.url);
      if (result.path.includes("/national-id-proofs/"))
        permanentFileUrls.nationalIdProofUrls?.push(result.url);
    }
    
    
    // Delete the temporary folder
    await supabaseAdmin.storage
      .from("profiles")
      .remove(tempFilePaths);

    // update the profiles table with the new URLs
    const {error: updateError} = await supabase
      .from("profiles")
      .update({
        avatar_url: permanentFileUrls.profilePicUrl || null,
        student_proof_url: permanentFileUrls.studentProofUrls,
        national_id_proof_url: permanentFileUrls.nationalIdProofUrls,
      })
      .eq("id", user.id);

    if (updateError)
      throw updateError;

    return true;
  } catch(err){
    console.error(err);
    throw err;
  }
}

export async function updateProfile(formData: FormData, currentCountryCode: string): Promise<boolean> {
  const fullName = formData.get("fullName") as string;
  const username = formData.get("username") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
        
  const dob = formData.get("dob") as string;
  const userType = formData.get("userType") as string;
  const nationalId = formData.get("nationalId") as string;
        
  const addressLine1 = formData.get("addressLine1") as string;
  const addressLine2 = formData.get("addressLine2") as string;
  const city = formData.get("city") as string;
  const country = formData.get("country") as string;
  const zipCode = formData.get("zipCode") as string;
        
  const schoolName = formData.get("schoolName") as string;
  const schoolId = formData.get("schoolId") as string;
  const schoolExpiry = formData.get("schoolExpiry") as string;

  // append files to FormData object
  const profilePic = formData.get("profilePic") as File|string;
  const studentProof = formData.getAll("studentProof") as (File|string)[];
  const nationalIdProof = formData.getAll("nationalIdProof") as (File|string)[];

  // const supabaseSession = supabase;
  const supabaseSession = await createSessionClient();

  const { data: { user }, error: authError } = await supabaseSession.auth.getUser();

  if (authError || !user)
    throw new Error("User not authenticated");

  const userId = user.id;

  const { data: profilesData, error } = await supabaseSession
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  
  if (!profilesData)
    throw new Error("Error fetching profiles record");

  const userData: Profile = profilesData;

  const countries = getCountryData();
  const codeIndex = countries.findIndex((country) => country.code === currentCountryCode);

  let cities : string[] = [];
  if(codeIndex !== -1){
    cities = countries[codeIndex].cities;
  }

  // Validate the schema
  const values = {
    profilePic,
    fullName,
    username,
    email,
    address: {
      addressLine1,
      addressLine2,
      city,
      zipCode,
      // country
    },
    phone,
    userType,
    dob,
    nationalId,
    school: {
      name: schoolName,
      id: schoolId,
      proof: studentProof,
      expiry: schoolExpiry
    },
    nationalIdProof: nationalIdProof
  }

  try {
    
    if (profilePic && typeof profilePic === "string") {
      // check if the file exists in the storage or not.
      if (userData.avatar_url !== profilePic)
        throw new Error("Invalid profile picture");
    }
    if (userType === 'student' && studentProof.length > 0){
      for (const proofUrl of studentProof) {
        if (typeof proofUrl === "string"){
          if (userData.student_proof_url && userData.student_proof_url.includes(proofUrl))
            continue;
          else
            throw new Error("Invalid student proof");
        }
      }
    }
    if (userType === 'pension' && nationalIdProof.length > 0){
      for (const proofUrl of nationalIdProof) {
        if (typeof proofUrl === "string"){
          if (userData.national_id_proof_url && userData.national_id_proof_url.includes(proofUrl))
            continue;
          else
            throw new Error("Invalid national ID proof");
        }
      }
    }

    // validate the form data
    const schema = editProfileFormValidationSchema(cities);
    await schema.validate(values, { abortEarly: false });

  } catch (error){
    if (error instanceof Yup.ValidationError) {
      
      const fieldErrors: Record<string, string> = {};
      error.inner.forEach((e) => {
        if (e.path && !fieldErrors[e.path]) {
          fieldErrors[e.path] = e.message
        }
      });
      console.error("Field errors during validation in server: ", fieldErrors);
      
      const messages = JSON.stringify(fieldErrors);
      throw new Error(messages);
    } if (error instanceof Error) {
      throw error;
    } else {
      throw new Error("Unexpected error happened in server");
    }
  }


  // upload files to temp-file-uploads bucket
  const finalUrls: string[] = [];
  
  try {
    // Add user profile picture
    if (profilePic instanceof File){
      if (userData.avatar_url) {
        // Delete the old profile pic from the storage.
        const url = userData.avatar_url;
        const urlParts = url.split("/");
        const fileName = urlParts.pop();
        const userId = urlParts.pop();

        const { error } = await supabaseSession.storage
          .from("profiles")
          .remove([`profile-pics/${userId}/${fileName}`]);

        if (error)
          throw new Error(`Error removing file: ${error.message}`);
      }

      const filePath = `profile-pics/${userId}/${profilePic.name}`;
        
      const { error: uploadError} = await supabaseSession.storage
        .from("profiles")
        .upload(filePath, profilePic, {
          upsert: true,
        });

      if (uploadError)
        throw uploadError;

      const { data: { publicUrl } } = supabaseSession.storage
      .from("profiles")
      .getPublicUrl(filePath)
          
      finalUrls.push(publicUrl);
        
    } else if (typeof profilePic === "string") {
      finalUrls.push(profilePic);
    } else {
      if (userData.avatar_url) {
        // Delete the old profile pic from the storage.
        const url = userData.avatar_url;
        const urlParts = url.split("/");
        const fileName = urlParts.pop();
        const userId = urlParts.pop();

        const { error } = await supabaseSession.storage
          .from("profiles")
          .remove([`profile-pics/${userId}/${fileName}`]);

        if (error)
          throw new Error(`Error removing file: ${error.message}`);
      }
    }
    

    // Add student proof upload if userType is 'student' and file exists
    if (userType === 'student' && studentProof.length > 0){
      if (userData.student_proof_url && userData.student_proof_url.length > 0) {
        for (const proofUrl of userData.student_proof_url) {
          if (studentProof.includes(proofUrl))
            continue;

          const proofUrlParts = proofUrl.split("/");
          const fileName = proofUrlParts.pop();
          const userId = proofUrlParts.pop();

          const { error } = await supabaseSession.storage
            .from("profiles")
            .remove([`student-proofs/${userId}/${fileName}`]);

          if (error)
            throw new Error(`Error removing file: ${error.message}`);
        }
        
      }

      for (const fileOrUrl of studentProof) {
        
        if (fileOrUrl instanceof File) {
          const filePath = `student-proofs/${userId}/${fileOrUrl.name}`;
          const { error: uploadError } = await supabaseSession.storage
            .from("profiles")
            .upload(filePath, fileOrUrl, {
              upsert: true
            });
            
          if (uploadError)
            throw uploadError;
            
          const { data: { publicUrl } } = supabaseSession.storage
          .from("profiles")
          .getPublicUrl(filePath)
        
          finalUrls.push(publicUrl);
        } else if (typeof fileOrUrl === "string") {
          finalUrls.push(fileOrUrl);
        }
      }
    };

    // Add National ID proof upload if userType is 'pension' and file exists
    if (userType === 'pension' && nationalIdProof.length > 0){
      
      if (userData.national_id_proof_url && userData.national_id_proof_url.length > 0) {
        for (const proofUrl of userData.national_id_proof_url) {
          if (nationalIdProof.includes(proofUrl))
            continue;

          const proofUrlParts = proofUrl.split("/");
          const fileName = proofUrlParts.pop();
          const userId = proofUrlParts.pop();

          const { error } = await supabaseSession.storage
            .from("profiles")
            .remove([`national-id-proofs/${userId}/${fileName}`]);

          if (error)
            throw new Error(`Error removing file: ${error.message}`);
        }
        
      }

      for (const fileOrUrl of nationalIdProof) {
        if (fileOrUrl instanceof File) {
          const filePath = `national-id-proofs/${userId}/${fileOrUrl.name}`;
          const { error: uploadError } = await supabaseSession.storage
            .from("profiles")
            .upload(filePath, fileOrUrl, {
              upsert: true,
            });
            
          if (uploadError)
            throw uploadError;
            
          const { data: { publicUrl } } = await supabaseSession.storage
          .from("profiles")
          .getPublicUrl(filePath)
        
          finalUrls.push(publicUrl);
        } else if (typeof fileOrUrl === "string") {
          finalUrls.push(fileOrUrl);
        }
      }
    };
    
    // Scenario: Once student, then post completion of the course, the user comes under general type.
    if (userType === "general" && userData.student_proof_url && userData.student_proof_url.length > 0) {
      // Delete the student proof
      for (const proofUrl of userData.student_proof_url) {
        const proofUrlParts = proofUrl.split("/");
        const fileName = proofUrlParts.pop();
        const userId = proofUrlParts.pop();

        const { error } = await supabaseSession.storage
          .from("profiles")
          .remove([`student-proofs/${userId}/${fileName}`]);

        if (error)
          throw new Error(`Error removing file: ${error.message}`);
      }
    }
    

    const permanentFileUrls: {
      profilePicUrl?: string,
      studentProofUrls?: string[],
      nationalIdProofUrls?: string[],
    } = {
      profilePicUrl: finalUrls.find(url => url.includes("/profile-pics/")),
      studentProofUrls: finalUrls.filter(url => url.includes("/student-proofs/")),
      nationalIdProofUrls: finalUrls.filter(url => url.includes("/national-id-proofs/")),
    }

   // update the profiles table with the new URLs
    const {data, error: updateError} = await supabaseSession
      .from("profiles")
      .update({
        full_name: fullName,
        user_name: username,
        email: email,
        phone_number: phone,
        user_type: userType,
        date_of_birth: dob,
        national_id: nationalId || null,
        address_line1: addressLine1,
        address_line2: addressLine2,
        city: city,
        zip_code: zipCode,
        country: currentCountryCode,
        school_name: userType === 'student' ? schoolName : null,
        school_id: userType === 'student' ? schoolId : null,
        school_expiry: userType === 'student' ? schoolExpiry : null,
        avatar_url: permanentFileUrls.profilePicUrl || (typeof profilePic === "string" && profilePic) || null,
        student_proof_url: userType === 'student' && permanentFileUrls.studentProofUrls && permanentFileUrls.studentProofUrls.length > 0 ? permanentFileUrls.studentProofUrls : null,
        national_id_proof_url: userType === 'pension' && permanentFileUrls.nationalIdProofUrls && permanentFileUrls.nationalIdProofUrls.length > 0 ? permanentFileUrls.nationalIdProofUrls : null,
      })
      .eq("id", userId);

    if (updateError)
      throw updateError;

    return true;
  } catch(error: any) {
    console.error("Profile update failed: ", error)
    throw new Error(`Profile update failed: ${error.message}`);
  }
  
}

export async function verifyUsername(username: string, form: "register" | "edit", currentUsername?: string): Promise<{
  exists: boolean;
  success: boolean;
  errors?: string[];
}> {

  if (form === "edit" && username === currentUsername) {
    return {
      exists: false,
      success: true
    }; // username unchanged
  }
  
  const supabase = await createUsernameClient();
  
  try {

    await usernameSchema.validate(username);
    
    // check if the user already exists or not
    const { data: existingUser, error: existingUserError } = await supabase
      .from("profiles")
      .select("user_name")
      .eq("user_name", username);

    if (existingUserError) {
      console.error("Error checking for existing user!", existingUserError);
      return {
        exists: false,
        success: false,
        errors: ["Unexpected server error occurred."]
      }
    }

    if (existingUser?.length > 0)
      return {
        exists: true, 
        success: true
      }; // username taken

    return {
      exists: false, 
      success: true
    }; // username available

  } catch (error: any) {

    if (error instanceof Yup.ValidationError) {
      console.error("Username validation error: ", error);
      return { 
        exists: false, 
        success: false, 
        errors: error.errors 
      };
    }

    console.error("Username verification error: ", error);
    return {
      exists: false,
      success: false,
      errors: ["Unexpected error occured during verification."]
    }
  }
}

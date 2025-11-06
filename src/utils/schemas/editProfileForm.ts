import * as Yup from "yup";
import { calculateAge } from "../ageCalculator";
import { FILE_SIZE_LIMIT, GENERAL_SUPPORTED_FORMATS, IMAGE_SUPPORTED_FORMATS } from "../constants";
import { addressSchema, usernameSchema } from "./registrationForm";

export interface editFormType {
  profilePic: string | File | null,
  fullName: string,
  username: string,
  email: string,
  address: {
    addressLine1: string,
    addressLine2?: string,
    city: string,
    zipCode: string,
    // country: string
  },
  phone: string,
  userType: string,
  dob: Date | null,
  nationalId: string,
  school: {
    name: string,
    id: string,
    proof: string[] | File[] | null,
    expiry: Date | null
  },
  nationalIdProof: string[] | File[] | null,
}

export const editFormInitialValues = {
  profilePic: null,
  fullName: "",
  username: "",
  email: "",
  address: {
    addressLine1: "",
    addressLine2: "",
    city: "",
    zipCode: "",
    // country: "",
  },
  phone: "",
  userType: "",
  dob: null,
  nationalId: "",
  school: {
    name: "",
    id: "",
    proof: null,
    expiry: null
  },
  nationalIdProof: null
}

export const setDefaultValuesInEditForm = (data: Profile, userEmail: string, setDefaultValues : (data: editFormType) => void) => {
  setDefaultValues({
    profilePic: data.avatar_url || null,
    fullName: data.full_name!,
    username: data.user_name!,
    email: data.email || userEmail,
    address: {
      addressLine1: data.address_line1 || "",
      addressLine2: data.address_line2 || "",
      city: data.city || "",
      zipCode: data.zip_code || "",
      // country: ""
    },
    phone: data.phone_number || "",
    userType: data.user_type || "general",
    dob: data.date_of_birth ? new Date(data.date_of_birth) : null,
    nationalId: data.national_id || "",
    school: {
      name: data.school_name || "",
      id: data.school_id || "",
      proof: data.student_proof_url || null,
      expiry: data.school_expiry ? new Date(data.school_expiry) : null
    },
    nationalIdProof: data.national_id_proof_url || null
  });
}

// Yup Schema for image file upload
const imageFileSchema = Yup.mixed()
  .nullable()
  .test(
    "fileSize",
    "File too large (max 2MB)",
    function (value) {
      if (value === null || value === undefined) return true; 
      if (value instanceof File) {
        return value.size <= FILE_SIZE_LIMIT;
      } else if (typeof value === "string")
        return true;
      return false
    }
  )
  .test(
    "fileFormat",
    "Unsupported file format (only JPG, JPEG, GIF, PNG)",
    function (value) {
      if (value === null || value === undefined) return true;
      if (value instanceof File) {
        return IMAGE_SUPPORTED_FORMATS.includes(value.type);
      } else if (typeof value === "string")
        return true;
      return false;
    }
  )
      
  

// Yup Schema for proof file upload
const proofFileSchema = Yup.array()
  .nullable() 
  .test(
    "fileSize",
    "File too large (max 2MB)",
    function (value) {
      if (!value) return true;
      return value.every(item => {
        if (item instanceof File) {
          return item.size <= FILE_SIZE_LIMIT;
        } else if (typeof item === "string")
          return true;
        return false
      })
    }
  )
  .test(
    "fileFormat",
    "Unsupported file format (only JPG, JPEG, GIF, PNG, PDF, DOC, DOCX, TXT)",
    function (value) {
      if (!value) return true;
      return value.every(item => {
        if (item instanceof File) {
          return GENERAL_SUPPORTED_FORMATS.includes(item.type);
        } else if (typeof item === "string")
          return true;
        return false;
      })
    }
  )

// Yup Schema for School Details (re-uses proofFileSchema)
const schoolSchema = Yup.object({
  name: Yup.string()
    .trim()
    .min(2, "School/ University name must be at least 2 characters")
    .required("School/ University Name is required"),
  id: Yup.string()
    .trim()
    .matches(
      /^[A-Za-z0-9-]+$/,
      "ID can only contain letters, numbers, and hyphens"
    )
    .required("School/ University ID is required"),
  proof: proofFileSchema
    .required("Proof is required"),
  expiry: Yup.date()
    .required("Expiry date is required")
    .typeError("Invalid date")
    .min(new Date(), "Expiry date cannot be in the past")
});

export const editProfileFormValidationSchema = (cities: string[]) => {
  return Yup.object().shape({
    profilePic: imageFileSchema,
    fullName: Yup.string()
      .trim()
      .matches(
        /^[a-zA-Z]+(?: [a-zA-Z]+)+$/,
        "Full name must include only letters and contain atleast first and last name"
      )
      .required("Full Name is required"),
    username: usernameSchema,
    address: addressSchema(cities),
    phone: Yup.string()
      .required("Phone number is required")
      .test(
        "phone-number-required",
        "Phone number is required",
        function(value) {
          if (!value || value === '+') 
            return false;
          return true;
        }
      )
      .matches(
        /^\+?\d+$/,
        "Phone number can contain only + and numbers"
      ),
    email: Yup.string()
      .email("Invalid email address")
      .required("Email address is required"),
    userType: Yup.string()
      .required("User type is required")
      .test(
        "invalid-user-type",
        "Invalid user type",
        function (value) {
          if (!value) return;
          if (value === "student" || value === "general" || value === "pension") return true;
          return false;
        }
      )
      .when("dob", {
        is: (dob: Date) => {
          if (!dob) return false;
          return calculateAge(dob) < 60;
        },
        then: (schema) => schema.notOneOf(["pension"], "Age is less than 60 for Pension User.")
      })
      .when("dob", {
        is: (dob: Date) => {
          if (!dob) return false;
          return calculateAge(dob) >= 60;
        },
        then: (schema) => schema.notOneOf(["student", "general"], `Type cannot be "Student" or "General" for an age of 60 or older.`)
      }),
    dob: Yup.date()
      .required("Date of birth is required")
      .typeError("Invalid date")
      .max(new Date(), "Date of birth cannot be in the future"),
    nationalId: Yup.string()
      .when("userType", {
        is: "pension",
        then: (schema) => schema.required("National ID is required for pension users"),
        otherwise: (schema) => schema.nullable().strip(),
      }),
    school: Yup.mixed()
      .nullable()
      .when("userType", (userType, schema) => {
        const isStudent = userType.toString() === "student";
    
        return isStudent
        ? schoolSchema.required("School details are required")
        : Yup.mixed().test({
          name: "school-conditional",
          test: function (value) {
            
            if (!value) return true;
    
            const schoolValue = value as {
              name?: string;
              id?: string;
              proof?: any[];
              expiry?: any;
            }
            const hasData = schoolValue.name || schoolValue.id || (schoolValue.proof && schoolValue.proof.length) || schoolValue.expiry;
            return !hasData
              ? true
              : this.createError({
                message: "School details are only allowed for student users",
              });
            
          }
        })
      }),
    nationalIdProof: proofFileSchema
      .nullable()
      .test(
        "valid-for-pensioners",
        "National ID Proof is only allowed for pensioners",
        function (value) {
          const { userType } = this.parent;

          if (!value || (Array.isArray(value) && value.length === 0)) return true;

          if (userType !== "pension") {
            return this.createError({
              message: "National ID Proof is only allowed for pensioners."
            })
          }
          return true;
        }
      )
      .when("userType", {
        is: "pension",
        then: (schema) => schema.required("National ID Proof is required"),
      })
  });
}; 
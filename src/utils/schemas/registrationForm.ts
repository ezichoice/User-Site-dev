import * as Yup from "yup";
import { calculateAge } from "../ageCalculator";
import { FILE_SIZE_LIMIT, GENERAL_SUPPORTED_FORMATS, IMAGE_SUPPORTED_FORMATS } from "../constants";

// address.country is commented- will be used in future.

export interface registrationFormType {
  profilePic: File | null,
  fullName: string,
  username: string,
  email: string,
  password: string,
  confirmPassword: string,
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
    proof: File[] | null,
    expiry: Date | null
  },
  nationalIdProof: File[] | null,
}

export const registrationFormInitialValues = {
  profilePic: null,
  fullName: "",
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
  address: {
    addressLine1: "",
    addressLine2: "",
    city: "",
    zipCode: "",
    // country: ""
  },
  phone: "",
  userType: "general",
  dob: null,
  nationalId: "",
  school: {
    name: "",
    id: "",
    proof: null,
    expiry: null
  },
  nationalIdProof: null
};

// Yup Schema for image file upload
const imageFileSchema = Yup.mixed()
  .nullable()
  .test(
    "fileType",
    "Not a file",
    function(value) {
      if (value === null || value === undefined) return true;
      if (value instanceof File) return true;
      return false;
    }
  )
  .test(
    "fileSize",
    "File too large (max 2MB)",
    function (value) {
      if (value === null || value === undefined) return true; 
      if (value instanceof File) {
        return value.size <= FILE_SIZE_LIMIT;
      }
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
      }
      return false;
    }
  )

// Yup Schema for proof file upload
const proofFileSchema = Yup.array()
  .nullable() 
  .test(
    "fileType",
    "Not a file",
    function(value) {
      if (!value) return true;
      return value.every(file => file instanceof File)
    }
  )
  .test(
    "fileSize",
    "File too large (max 2MB)",
    function (value) {
      if (!value) return true;
      return value.every(file => file.size <= FILE_SIZE_LIMIT)
    }
  )
  .test(
    "fileFormat",
    "Unsupported file format (only JPG, JPEG, GIF, PNG, PDF, DOC, DOCX, TXT)",
    function (value) {
      if (!value) return true;
      return value.every(file => GENERAL_SUPPORTED_FORMATS.includes(file.type)); 
    }
  )

// Yup Schema for Address
export const addressSchema = (cities: string[]) => Yup.object().shape({
  addressLine1: Yup.string()
    .trim()
    .required("Address Line 1 is required"),
  addressLine2: Yup.string()
    .trim()
    .optional(),
  city: Yup.string()
    .required("City is required")
    .oneOf(cities, "Invalid city selected"),
  zipCode: Yup.string()
    .trim()
    .min(3, "Too short")
    .max(10, "Too long")
    .required("Zip / Postal Code is required"),
  // country: Yup.string().required("Country is required")
});

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

// Yup Schema for Username
export const usernameSchema = Yup.string()
  .required("Username is required")
  .length(5, "Username must be exactly 5 characters")
  .test(
    "is-mixed",
    "Username must contain at least one letter and one digit and only lowercase letters and digits are allowed",
    function(value) {
      if (!value || typeof value !== 'string') return false;

      const hasValidChars = /^[a-z\d]{5}$/.test(value);
      if (!hasValidChars) return false;

      const hasLetter = /[a-z]/.test(value);
      const hasDigit = /\d/.test(value);
      
      return hasLetter && hasDigit;
    }
  );

export const createRegistrationValidationSchema = (cities: string[]) => {
  
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
    password: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .matches(/[a-z]+/, "Password must contain at least one lowercase letter")
      .matches(/[A-Z]+/, "Password must contain at least one uppercase letter")
      .matches(/\d+/, "Password must contain at least one digit")
      .required("Password is required"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password")], "Passwords must match")
      .required("Confirm Password is required"),
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
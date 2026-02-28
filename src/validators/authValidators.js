import {email, z} from "zod";

//Validation Schema for user registration 
// Validates name , email ,format and password strength

const registerSchema = z.object({
    name:z.string().trim().min(2,"Name must be atleat 2 characters"),
    email:z.string.trim().min(1,"Email is required").email("Provide a valid email").toLowerCase(),
    password:z.string().min(1,"password is required").min(6,"password must be atleast 6 characters")
});

//Validates Schema for login

const loginSchema = z.object({
   email:z.string.trim().min(1,"Email is required").email("Provide a valid email").toLowerCase(),
   password:z.string().min(1,"password is required")
});

export { registerSchema, loginSchema };
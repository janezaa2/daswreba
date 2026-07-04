import { z } from "zod";

export const adminLoginSchema = z.object({
  username: z.string().trim().min(1, "მომხმარებლის სახელი აუცილებელია"),
  password: z.string().min(1, "პაროლი აუცილებელია"),
});

export const cashierCreateSchema = z.object({
  firstName: z.string().trim().min(1, "სახელი აუცილებელია"),
  lastName: z.string().trim().min(1, "გვარი აუცილებელია"),
  personalId: z.string().trim().optional().nullable(),
  phone: z.string().trim().optional().nullable(),
});

export const cashierUpdateSchema = z.object({
  firstName: z.string().trim().min(1).optional(),
  lastName: z.string().trim().min(1).optional(),
  personalId: z.string().trim().optional().nullable(),
  phone: z.string().trim().optional().nullable(),
  status: z.enum(["active", "inactive"]).optional(),
});

export const registerCreateSchema = z.object({
  name: z.string().trim().min(1, "სალაროს სახელი აუცილებელია"),
  registerNumber: z.string().trim().min(1, "სალაროს ნომერი აუცილებელია"),
  zone: z.string().trim().optional().nullable(),
});

export const registerUpdateSchema = z.object({
  name: z.string().trim().min(1).optional(),
  registerNumber: z.string().trim().min(1).optional(),
  zone: z.string().trim().optional().nullable(),
  status: z.enum(["active", "inactive"]).optional(),
});

export const verifyCodeSchema = z.object({
  code: z.string().trim().min(1, "კოდი აუცილებელია"),
});

export const checkInSchema = z.object({
  uniqueCode: z.string().trim().min(1, "კოდი აუცილებელია"),
  cashRegisterId: z.string().trim().min(1, "სალაროს არჩევა აუცილებელია"),
  latitude: z.number(),
  longitude: z.number(),
  accuracy: z.number().optional().nullable(),
  userAgent: z.string().optional().default(""),
});

export const settingsUpdateSchema = z.object({
  companyName: z.string().trim().min(1).optional(),
  allowedLatitude: z.number().nullable().optional(),
  allowedLongitude: z.number().nullable().optional(),
  allowedRadiusMeters: z.number().positive().nullable().optional(),
  geofenceEnabled: z.boolean().optional(),
});

export const companyRegisterSchema = z.object({
  companyName: z.string().trim().min(1, "კომპანიის სახელი აუცილებელია"),
  username: z
    .string()
    .trim()
    .min(3, "მომხმარებლის სახელი უნდა შეიცავდეს მინიმუმ 3 სიმბოლოს"),
  password: z.string().min(6, "პაროლი უნდა შეიცავდეს მინიმუმ 6 სიმბოლოს"),
});

export const companyStatusUpdateSchema = z.object({
  status: z.enum(["pending", "active", "inactive"]),
});

export const adminUserUpdateSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "მომხმარებლის სახელი უნდა შეიცავდეს მინიმუმ 3 სიმბოლოს")
    .optional(),
  password: z.string().min(6, "პაროლი უნდა შეიცავდეს მინიმუმ 6 სიმბოლოს").optional(),
});

export const attendanceFilterSchema = z.object({
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  cashierId: z.string().optional(),
  cashRegisterId: z.string().optional(),
  status: z.string().optional(),
});

export const mobileVerifyCodeSchema = z.object({
  uniqueCode: z.string().trim().min(1, "კოდი აუცილებელია"),
});

export const mobileCheckInSchema = z.object({
  cashRegisterId: z.string().trim().min(1, "სალაროს არჩევა აუცილებელია"),
  latitude: z.number(),
  longitude: z.number(),
  accuracy: z.number().optional().nullable(),
  deviceInfo: z.string().optional().default(""),
  platform: z.string().optional().default("android"),
});

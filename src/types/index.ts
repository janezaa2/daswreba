export type CashierStatus = "active" | "inactive";
export type RegisterStatus = "active" | "inactive";

export type Cashier = {
  id: string;
  firstName: string;
  lastName: string;
  personalId: string | null;
  phone: string | null;
  uniqueCode: string;
  status: CashierStatus;
  createdAt: string;
  updatedAt: string;
};

export type CashRegister = {
  id: string;
  name: string;
  registerNumber: string;
  zone: string | null;
  status: RegisterStatus;
  createdAt: string;
  updatedAt: string;
};

export type AttendanceRecord = {
  id: string;
  cashierId: string;
  cashierName: string;
  cashierCode: string;
  cashRegisterId: string;
  cashRegisterName: string;
  date: string;
  checkInTime: string;
  latitude: number;
  longitude: number;
  accuracy: number | null;
  userAgent: string;
  status: string;
  createdAt: string;
};

export type CompanySettings = {
  companyName: string;
  allowedLatitude: number | null;
  allowedLongitude: number | null;
  allowedRadiusMeters: number | null;
  geofenceEnabled: boolean;
};

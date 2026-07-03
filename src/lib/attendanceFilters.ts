import type { Prisma } from "@prisma/client";
import { dateStringToUtcMidnight } from "@/lib/dates";

export type AttendanceFilterParams = {
  dateFrom?: string | null;
  dateTo?: string | null;
  cashierId?: string | null;
  cashRegisterId?: string | null;
  status?: string | null;
};

export function buildAttendanceWhere(
  filters: AttendanceFilterParams,
): Prisma.AttendanceRecordWhereInput {
  const where: Prisma.AttendanceRecordWhereInput = {};

  if (filters.dateFrom || filters.dateTo) {
    where.date = {};
    if (filters.dateFrom) {
      where.date.gte = dateStringToUtcMidnight(filters.dateFrom);
    }
    if (filters.dateTo) {
      where.date.lte = dateStringToUtcMidnight(filters.dateTo);
    }
  }

  if (filters.cashierId) {
    where.cashierId = filters.cashierId;
  }
  if (filters.cashRegisterId) {
    where.cashRegisterId = filters.cashRegisterId;
  }
  if (filters.status) {
    where.status = filters.status;
  }

  return where;
}

export function extractFiltersFromSearchParams(
  searchParams: URLSearchParams,
): AttendanceFilterParams {
  return {
    dateFrom: searchParams.get("dateFrom"),
    dateTo: searchParams.get("dateTo"),
    cashierId: searchParams.get("cashierId"),
    cashRegisterId: searchParams.get("cashRegisterId"),
    status: searchParams.get("status"),
  };
}

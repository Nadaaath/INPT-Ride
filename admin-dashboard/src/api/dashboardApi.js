import { getProfiles } from "./profilesApi";
import { getPricingEntries } from "./pricingApi";
import { getReservations } from "./reservationsApi";
import { getRides } from "./ridesApi";
import { getAuthorizedStudents } from "./studentsApi";
import { getVehicles } from "./vehiclesApi";

export async function getDashboardData() {
  const [
    vehicles,
    students,
    profiles,
    reservations,
    rides,
    pricingEntries,
  ] = await Promise.all([
    getVehicles(),
    getAuthorizedStudents(),
    getProfiles(),
    getReservations(),
    getRides(),
    getPricingEntries(),
  ]);

  return {
    vehicles,
    students,
    profiles,
    reservations,
    rides,
    pricingEntries,
  };
}
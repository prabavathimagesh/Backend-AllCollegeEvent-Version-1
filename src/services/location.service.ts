const prisma = require("../config/db.config");

export class LocationService {
  // ============ COUNTRY SERVICES ============
 static async createCountry(data: { name: string; code: string; phoneCode?: string }) {
    return await prisma.country.create({
      data,
    });
  }

  static async bulkCreateCountries(countries: Array<{ name: string; code: string; phoneCode?: string }>) {
    return await prisma.country.createMany({
      data: countries,
      skipDuplicates: true,
    });
  }

  static async getAllCountries() {
    return await prisma.country.findMany({
      orderBy: { name: "asc" },
    });
  }

  static async getCountryById(id: string) {
    return await prisma.country.findUnique({
      where: { identity:id },
      include: {
        states: {
          orderBy: { name: "asc" },
        },
      },
    });
  }

  static async updateCountry(id: string, data: { name?: string; code?: string; phoneCode?: string }) {
    return await prisma.country.update({
      where: { identity:id },
      data,
    });
  }

  static async deleteCountry(id: string) {
    return await prisma.country.delete({
      where: { identity:id },
    });
  }

  // ============ STATE SERVICES ============
  static async createState(countryId: string, data: { name: string; code?: string }) {
    return await prisma.state.create({
      data: {
        ...data,
        countryId,
      },
      include: {
        country: true,
      },
    });
  }

  static async bulkCreateStates(countryId: string, states: Array<{ name: string; code?: string }>) {
    const statesWithCountry = states.map(state => ({
      ...state,
      countryId,
    }));
    
    return await prisma.state.createMany({
      data: statesWithCountry,
      skipDuplicates: true,
    });
  }

  static async getAllStates() {
    return await prisma.state.findMany({
      include: {
        country: true,
      },
      orderBy: { name: "asc" },
    });
  }

  static async getStatesByCountryId(countryId: string) {
    return await prisma.state.findMany({
      where: { countryId },
      orderBy: { name: "asc" },
    });
  }

  static async getStateById(id: string) {
    return await prisma.state.findUnique({
      where: { identity:id },
      include: {
        country: true,
        cities: {
          orderBy: { name: "asc" },
        },
      },
    });
  }

  static async updateState(id: string, data: { name?: string; code?: string }) {
    return await prisma.state.update({
      where: { identity:id },
      data,
    });
  }

  static async deleteState(id: string) {
    return await prisma.state.delete({
      where: { identity:id },
    });
  }

  // ============ CITY SERVICES ============
  static async createCity(stateId: string, data: { name: string }) {
    return await prisma.city.create({
      data: {
        ...data,
        stateId,
      },
      include: {
        state: {
          include: {
            country: true,
          },
        },
      },
    });
  }

  static async bulkCreateCities(stateId: string, cities: Array<{ name: string }>) {
    const citiesWithState = cities.map(city => ({
      ...city,
      stateId,
    }));
    
    return await prisma.city.createMany({
      data: citiesWithState,
      skipDuplicates: true,
    });
  }

  static async getAllCities() {
    return await prisma.city.findMany({
      include: {
        state: {
          include: {
            country: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });
  }

  static async getCitiesByStateId(stateId: string) {
    return await prisma.city.findMany({
      where: { stateId },
      orderBy: { name: "asc" },
    });
  }

  static async getCityById(id: string) {
    return await prisma.city.findUnique({
      where: { id },
      include: {
        state: {
          include: {
            country: true,
          },
        },
      },
    });
  }

  static async updateCity(id: string, data: { name?: string }) {
    return await prisma.city.update({
      where: { identity:id },
      data,
    });
  }

  static async deleteCity(id: string) {
    return await prisma.city.delete({
      where: { identity:id },
    });
  }

  // ============ COMBINED SERVICES ============
  static async getCountriesWithStates() {
    return await prisma.country.findMany({
      include: {
        states: {
          orderBy: { name: "asc" },
        },
      },
      orderBy: { name: "asc" },
    });
  }

  static async getStatesWithCities(countryId: string) {
    return await prisma.state.findMany({
      where: { countryId },
      include: {
        cities: {
          orderBy: { name: "asc" },
        },
      },
      orderBy: { name: "asc" },
    });
  }

  static async getCompleteLocationTree() {
    return await prisma.country.findMany({
      include: {
        states: {
          include: {
            cities: {
              orderBy: { name: "asc" },
            },
          },
          orderBy: { name: "asc" },
        },
      },
      orderBy: { name: "asc" },
    });
  }
}

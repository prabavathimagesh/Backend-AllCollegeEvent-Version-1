import { Router } from "express";
import { LocationController } from "../controllers/location.controller";

const router = Router();

// ============ COUNTRY ROUTES ============
router.post("/countries", LocationController.createCountry);
router.post("/countries/bulk", LocationController.bulkCreateCountries);
router.get("/countries", LocationController.getAllCountries);
router.get("/countries/:id", LocationController.getCountryById);
router.put("/countries/:id", LocationController.updateCountry);
router.delete("/countries/:id", LocationController.deleteCountry);

// ============ STATE ROUTES ============
router.post("/countries/:countryId/states", LocationController.createState);
router.post("/countries/:countryId/states/bulk", LocationController.bulkCreateStates);
router.get("/states", LocationController.getAllStates);
router.get("/states/:id", LocationController.getStateById);
router.get("/countries/:countryId/states", LocationController.getStatesByCountry);
router.put("/states/:id", LocationController.updateState);
router.delete("/states/:id", LocationController.deleteState);

// ============ CITY ROUTES ============
router.post("/states/:stateId/cities", LocationController.createCity);
router.post("/states/:stateId/cities/bulk", LocationController.bulkCreateCities);
router.get("/cities", LocationController.getAllCities);
router.get("/cities/:id", LocationController.getCityById);
router.get("/states/:stateId/cities", LocationController.getCitiesByState);
router.put("/cities/:id", LocationController.updateCity);
router.delete("/cities/:id", LocationController.deleteCity);

// ============ COMBINED ROUTES ============
router.get("/location/countries-with-states", LocationController.getCountriesWithStates);
router.get("/location/states-with-cities/:countryId", LocationController.getStatesWithCities);
router.get("/location/complete-tree", LocationController.getCompleteLocationTree);

// Colleges API
router.post("/college/:cityIdentity", LocationController.toggleCollege);

export default router;
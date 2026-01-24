import { Request, Response } from "express";
import { LocationService } from "../services/location.service";

export class LocationController {
  // ============ COUNTRY CONTROLLERS ============
  static async createCountry(req: Request, res: Response) {
    try {
      const country = await LocationService.createCountry(req.body);
      return res.status(201).json({
        status: true,
        data: country,
        message: "Country created successfully",
      });
    } catch (err: any) {
      return res.status(500).json({
        status: false,
        message: "Failed to create country",
        error: err.message,
      });
    }
  }

  static async bulkCreateCountries(req: Request, res: Response) {
    try {
      const result = await LocationService.bulkCreateCountries(
        req.body.countries,
      );
      return res.status(201).json({
        status: true,
        data: result,
        message: "Countries created successfully",
      });
    } catch (err: any) {
      return res.status(500).json({
        status: false,
        message: "Failed to create countries",
        error: err.message,
      });
    }
  }

  static async getAllCountries(req: Request, res: Response) {
    try {
      const countries = await LocationService.getAllCountries();
      return res.status(200).json({
        status: true,
        data: countries,
        message: "Countries fetched successfully",
      });
    } catch (err: any) {
      return res.status(500).json({
        status: false,
        message: "Failed to fetch countries",
        error: err.message,
      });
    }
  }

  static async getCountryById(req: Request, res: Response) {
    try {
      const country = await LocationService.getCountryById(
        req.params.id as string,
      );
      if (!country) {
        return res.status(404).json({
          status: false,
          message: "Country not found",
        });
      }
      return res.status(200).json({
        status: true,
        data: country,
        message: "Country fetched successfully",
      });
    } catch (err: any) {
      return res.status(500).json({
        status: false,
        message: "Failed to fetch country",
        error: err.message,
      });
    }
  }

  static async updateCountry(req: Request, res: Response) {
    try {
      const country = await LocationService.updateCountry(
        req.params.id as string,
        req.body,
      );
      return res.status(200).json({
        status: true,
        data: country,
        message: "Country updated successfully",
      });
    } catch (err: any) {
      return res.status(500).json({
        status: false,
        message: "Failed to update country",
        error: err.message,
      });
    }
  }

  static async deleteCountry(req: Request, res: Response) {
    try {
      await LocationService.deleteCountry(req.params.id as string);
      return res.status(200).json({
        status: true,
        message: "Country deleted successfully",
      });
    } catch (err: any) {
      return res.status(500).json({
        status: false,
        message: "Failed to delete country",
        error: err.message,
      });
    }
  }

  // ============ STATE CONTROLLERS ============
  static async createState(req: Request, res: Response) {
    try {
      const { countryId } = req.params;
      const state = await LocationService.createState(
        countryId as string,
        req.body,
      );
      return res.status(201).json({
        status: true,
        data: state,
        message: "State created successfully",
      });
    } catch (err: any) {
      return res.status(500).json({
        status: false,
        message: "Failed to create state",
        error: err.message,
      });
    }
  }

  static async bulkCreateStates(req: Request, res: Response) {
    try {
      const { countryId } = req.params;
      const result = await LocationService.bulkCreateStates(
        countryId as string,
        req.body.states,
      );
      return res.status(201).json({
        status: true,
        data: result,
        message: "States created successfully",
      });
    } catch (err: any) {
      return res.status(500).json({
        status: false,
        message: "Failed to create states",
        error: err.message,
      });
    }
  }

  static async getAllStates(req: Request, res: Response) {
    try {
      const states = await LocationService.getAllStates();
      return res.status(200).json({
        status: true,
        data: states,
        message: "States fetched successfully",
      });
    } catch (err: any) {
      return res.status(500).json({
        status: false,
        message: "Failed to fetch states",
        error: err.message,
      });
    }
  }

  static async getStatesByCountry(req: Request, res: Response) {
    try {
      const states = await LocationService.getStatesByCountryId(
        req.params.countryId as string,
      );
      return res.status(200).json({
        status: true,
        data: states,
        message: "States fetched successfully",
      });
    } catch (err: any) {
      return res.status(500).json({
        status: false,
        message: "Failed to fetch states",
        error: err.message,
      });
    }
  }

  static async getStateById(req: Request, res: Response) {
    try {
      const state = await LocationService.getStateById(req.params.id as string);
      if (!state) {
        return res.status(404).json({
          status: false,
          message: "State not found",
        });
      }
      return res.status(200).json({
        status: true,
        data: state,
        message: "State fetched successfully",
      });
    } catch (err: any) {
      return res.status(500).json({
        status: false,
        message: "Failed to fetch state",
        error: err.message,
      });
    }
  }

  static async updateState(req: Request, res: Response) {
    try {
      const state = await LocationService.updateState(
        req.params.id as string,
        req.body,
      );
      return res.status(200).json({
        status: true,
        data: state,
        message: "State updated successfully",
      });
    } catch (err: any) {
      return res.status(500).json({
        status: false,
        message: "Failed to update state",
        error: err.message,
      });
    }
  }

  static async deleteState(req: Request, res: Response) {
    try {
      await LocationService.deleteState(req.params.id as string);
      return res.status(200).json({
        status: true,
        message: "State deleted successfully",
      });
    } catch (err: any) {
      return res.status(500).json({
        status: false,
        message: "Failed to delete state",
        error: err.message,
      });
    }
  }

  // ============ CITY CONTROLLERS ============
  static async createCity(req: Request, res: Response) {
    try {
      const { stateId } = req.params;
      const city = await LocationService.createCity(
        stateId as string,
        req.body,
      );
      return res.status(201).json({
        status: true,
        data: city,
        message: "City created successfully",
      });
    } catch (err: any) {
      return res.status(500).json({
        status: false,
        message: "Failed to create city",
        error: err.message,
      });
    }
  }

  static async bulkCreateCities(req: Request, res: Response) {
    try {
      const { stateId } = req.params;
      const result = await LocationService.bulkCreateCities(
        stateId as string,
        req.body.cities,
      );
      return res.status(201).json({
        status: true,
        data: result,
        message: "Cities created successfully",
      });
    } catch (err: any) {
      return res.status(500).json({
        status: false,
        message: "Failed to create cities",
        error: err.message,
      });
    }
  }

  static async getAllCities(req: Request, res: Response) {
    try {
      const cities = await LocationService.getAllCities();
      return res.status(200).json({
        status: true,
        data: cities,
        message: "Cities fetched successfully",
      });
    } catch (err: any) {
      return res.status(500).json({
        status: false,
        message: "Failed to fetch cities",
        error: err.message,
      });
    }
  }

  static async getCitiesByState(req: Request, res: Response) {
    try {
      const cities = await LocationService.getCitiesByStateId(
        req.params.stateId as string,
      );
      return res.status(200).json({
        status: true,
        data: cities,
        message: "Cities fetched successfully",
      });
    } catch (err: any) {
      return res.status(500).json({
        status: false,
        message: "Failed to fetch cities",
        error: err.message,
      });
    }
  }

  static async getCityById(req: Request, res: Response) {
    try {
      const city = await LocationService.getCityById(req.params.id as string);
      if (!city) {
        return res.status(404).json({
          status: false,
          message: "City not found",
        });
      }
      return res.status(200).json({
        status: true,
        data: city,
        message: "City fetched successfully",
      });
    } catch (err: any) {
      return res.status(500).json({
        status: false,
        message: "Failed to fetch city",
        error: err.message,
      });
    }
  }

  static async updateCity(req: Request, res: Response) {
    try {
      const city = await LocationService.updateCity(
        req.params.id as string,
        req.body,
      );
      return res.status(200).json({
        status: true,
        data: city,
        message: "City updated successfully",
      });
    } catch (err: any) {
      return res.status(500).json({
        status: false,
        message: "Failed to update city",
        error: err.message,
      });
    }
  }

  static async deleteCity(req: Request, res: Response) {
    try {
      await LocationService.deleteCity(req.params.id as string);
      return res.status(200).json({
        status: true,
        message: "City deleted successfully",
      });
    } catch (err: any) {
      return res.status(500).json({
        status: false,
        message: "Failed to delete city",
        error: err.message,
      });
    }
  }

  // ============ COMBINED CONTROLLERS ============
  static async getCountriesWithStates(req: Request, res: Response) {
    try {
      const data = await LocationService.getCountriesWithStates();
      return res.status(200).json({
        status: true,
        data,
        message: "Countries with states fetched successfully",
      });
    } catch (err: any) {
      return res.status(500).json({
        status: false,
        message: "Failed to fetch data",
        error: err.message,
      });
    }
  }

  static async getStatesWithCities(req: Request, res: Response) {
    try {
      const data = await LocationService.getStatesWithCities(
        req.params.countryId as string,
      );
      return res.status(200).json({
        status: true,
        data,
        message: "States with cities fetched successfully",
      });
    } catch (err: any) {
      return res.status(500).json({
        status: false,
        message: "Failed to fetch data",
        error: err.message,
      });
    }
  }

  static async getCompleteLocationTree(req: Request, res: Response) {
    try {
      const data = await LocationService.getCompleteLocationTree();
      return res.status(200).json({
        status: true,
        data,
        message: "Complete location tree fetched successfully",
      });
    } catch (err: any) {
      return res.status(500).json({
        status: false,
        message: "Failed to fetch data",
        error: err.message,
      });
    }
  }

  static async toggleCollege(req: Request, res: Response) {
    try {
      const { cityIdentity } = req.params;
      const { collegename } = req.body;

      if (!cityIdentity || !collegename) {
        return res.status(400).json({
          message: "cityIdentity and collegename are required",
        });
      }

      const result = await LocationService.toggleCollege(cityIdentity as string, collegename);

      return res.status(200).json({
        message: result.created ? "College added" : "College removed",
        ...result,
      });
    } catch (error) {
      console.error("Toggle college error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };
}

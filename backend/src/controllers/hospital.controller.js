import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {Hospital} from "../models/hospital.model.js"
import { isValidObjectId } from "mongoose";
import { getCoordinatesFromAddress } from "../utils/getCoordinates.js";


const createHospital = asyncHandler(async (req, res) => {
    let {
        name, street, city, state, country, postcode,
        contactNumber, HRN, lat, lon
    } = req.body;

    // Validate required fields except lat/lon (we'll compute if missing)
    if ([name, street, city, state, country, postcode, contactNumber, HRN]
        .some(field => field?.toString().trim() === "")) {
        throw new ApiError(400, "All fields except coordinates are required");
    }

    const existedHospital = await Hospital.findOne({ HRN });
    if (existedHospital) {
        throw new ApiError(400, "Hospital registration number already exists");
    }

    //compute coordinates if not provided
    if (!lat || !lon) {
        const coordinates = await getCoordinatesFromAddress({
            name, street, city, state, country, postcode
        });

        if (!coordinates) {
            throw new ApiError(500, "Could not determine coordinates from address");
        }

        lon = coordinates.lon;
        lat = coordinates.lat;
    }

    const userId = req.user._id;
    const address = { street, city, state, country, postcode };

    const hospital = await Hospital.create({
        user: userId,
        name,
        address,
        location: {
            type: "Point",
            coordinates: [parseFloat(lon), parseFloat(lat)]
        },
        contactNumber,
        HRN
    });

    if (!hospital) {
        throw new ApiError(500, "Something went wrong while creating hospital profile");
    }

    return res.status(201).json(
        new ApiResponse(201, hospital, "Hospital profile created successfully")
    );
});


const getHospitalById = asyncHandler(async (req, res) => {
    const { hospitalId } = req.params;

    if (!isValidObjectId(hospitalId)) {
        throw new ApiError(400, "Invalid hospital ID!");
    }

    const hospital = await Hospital.findById(hospitalId).populate("user", "fullName avatar email");

    if (!hospital) {
        throw new ApiError(404, "Hospital not found");
    }

    res.status(200).json(
        new ApiResponse(200, hospital, "Hospital fetched successfully")
    );
});

const updateHospital = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const hospital = await Hospital.findOne({ user: userId }).populate("user", "-password -refreshToken");
  if (!hospital) {
    throw new ApiError(404, "Hospital profile not found");
  }

  const {
    name,
    street,
    city,
    state,
    country,
    postcode,
    contactNumber,
    HRN
  } = req.body;

  // Update name if provided
  if (name) hospital.name = name;

  // Check address completeness
  const addressFields = [street, city, state, country, postcode];
  const someAddressProvided = addressFields.some(field => field !== undefined);
  const allAddressProvided = addressFields.every(field => field !== undefined && field.trim() !== "");

  if (someAddressProvided && !allAddressProvided) {
    throw new ApiError(400, "If updating address, all address fields (street, city, state, country, postcode) must be provided.");
  }

  // Update contact number and HRN
  if (contactNumber) hospital.contactNumber = contactNumber;
  if (HRN) hospital.HRN = HRN;

  if (allAddressProvided) {
    hospital.address = { street, city, state, country, postcode };

    const coordinates = await getCoordinatesFromAddress({
      name: hospital.name,
      street,
      city,
      state,
      country,
      postcode
    });

    if (!coordinates) {
      throw new ApiError(500, "Could not determine coordinates from address");
    }

    const { lat, lon } = coordinates;

    hospital.location = {
      type: "Point",
      coordinates: [lon, lat], // GeoJSON format
    };
  }

  const updatedHospital = await hospital.save({ validateBeforeSave: false });

  res.status(200).json(
    new ApiResponse(200, updatedHospital, "Hospital updated successfully")
  );
});


const deleteHospital = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const hospital = await Hospital.findOne({ user: userId }).populate("user", "-password -refreshToken");
  if (!hospital) {
    throw new ApiError(404, "Hospital profile not found");
  }

  const deleteHospital=await Hospital.deleteOne(hospital._id);
   if(deleteHospital.deletedCount===0){
        throw new ApiError(500, "unable to delete hospital")
    }

    res.status(200).json(new ApiResponse(200, deleteHospital, "hospital deleted successfully"))
});

//?get all hospitals based on query, sort, pagination
//TODO: Break the query into words if there are multiple words
const getAllHospitals = asyncHandler(async (req, res) => {
    const {
        page = 1,
        limit = 4,
        query = "",
        sortBy = "name",
        sortType = 1
    } = req.query;

    const searchQuery = {
        $or: [
            { name: { $regex: query, $options: "i" } },
            { "address.city": { $regex: query, $options: "i" } },
            { "address.state": { $regex: query, $options: "i" } },
        ]
    };
   
    const sortQuery = {[sortBy]: Number(sortType)};
   
    const aggregateQuery = Hospital.aggregate([
        { $match: searchQuery },
        { $sort: sortQuery }
    ]);

    const options = {
        page: parseInt(page),
        limit: parseInt(limit)
    };

    const result = await Hospital.aggregatePaginate(aggregateQuery, options);

    res.status(200).json(
        new ApiResponse(200, result, "Hospitals fetched successfully")
    );
});

const getHospitalDetails = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const hospital = await Hospital.findOne({ user: userId }).populate("user", "-password -refreshToken");

    if (!hospital) {
        throw new ApiError(404, "Doctor profile not found");
    }

    res.status(200).json(new ApiResponse(200, hospital, "Hospital profile fetched successfully"));
});


export{
    createHospital,
    getHospitalById,
    updateHospital,
    deleteHospital,
    getAllHospitals,
    getHospitalDetails
}
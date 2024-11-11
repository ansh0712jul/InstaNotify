import { asynchandler } from "../utils/asyncHandler.js";
import { website } from "../models/website.models.js"; 
import { ApiError } from "../utils/ApiError.js"; 
import axios from "axios";
import { ApiResponse } from "../utils/ApiResponse.js";

// URL validation function
function validateUrl(value) {
    return /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(
      value
    );
}

// Create Website Function
const createWebsite = asynchandler(async (req, res) => {
    const { url } = req.body;

    // Check if URL is provided
    if (!url) {
        throw new ApiError(400, "URL is required");
    }

    // Validate URL format
    const validUrl = validateUrl(url);
    if (!validUrl) {
        throw new ApiError(422, "URL is not valid");
    }

    const user = req.user;

    // Check if the website is accessible
    let response;
    try {
        response = await axios.get(url);
    } catch (err) {
        // Log the error if needed
        console.error(`Error fetching URL: ${url}`, err);
        throw new ApiError(422, `Website with URL ${url} is not active`);
    }

    // Check response status
    if (!response || response.status !== 200) {
        throw new ApiError(422, `Website with URL ${url} is not active`);
    }

    // Save website to the database
    const newWebsite = await website.create({
        url,
        userId: user._id, 
        isActive: true,
    });

    // Send response
    return res.status(201).json(
        new ApiResponse(201, newWebsite, "Website added successfully")
    );

});


const deleteWebsite = asynchandler(async (req, res) => {
    const id = req.params.webId;

    if (!id) {
        throw new ApiError(400, "Id is required");
    }

     // Check if the website exists before attempting to delete
     const deletedWebsite = await website.findByIdAndDelete(id);

     // If the website was not found, throw a 404 error
     if (!deletedWebsite) {
         throw new ApiError(404, "Website not found");
     }

    // Send response
    return res.status(200).json(
        new ApiResponse(200, {}, "Website delete successfully")
    );

})

const getAllwebsites=asynchandler(async(req,res)=>{
    const result = await website.find({ userId: req.user._id })
      return res.status(200).json(
        new ApiResponse(200, result, "get all Website successfully")
    );

})

export {
    createWebsite,
    deleteWebsite,
    getAllwebsites
}

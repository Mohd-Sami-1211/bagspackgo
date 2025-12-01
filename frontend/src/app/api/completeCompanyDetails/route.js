import { NextResponse } from "next/server";
import connectDB from "src/DB/DBConnection";
import { providerCompanyModel } from "src/models/providerCompanyModel";
import {v2 as cloudinary} from "cloudinary";
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure : true
});
export async function POST(req){
    try {
        await connectDB();
        const formData = await req.formData();
        const providerId = formData.get("providerId");
        const companyEmail = formData.get("companyEmail");
        const companyMobileNumber = formData.get("companyMobileNumber");
        const companyName  = formData.get("companyName");
        const OperatingLocation = formData.get("OperatingLocation");
        const facebookLink = formData.get("facebookLink");
        const instagramLink = formData.get("instagramLink");
        const BusinessLicense = formData.get("BusinessLicense");
        const idProof = formData.get("idProof");
        const availabilityData = formData.get("availability");
        const uploadResultOfLicense = await UploadFile(BusinessLicense);
        const uploadResultOfId = await UploadFile(idProof);
        const jsonObjectOfAvailability = JSON.parse(availabilityData);
        const companyinfo = new providerCompanyModel({
            providerId,
            companyEmail,
            companyMobileNumber,
            companyName,
            OperatingLocation,
            facebookLink,
            instagramLink,
            BusinessLicense : uploadResultOfLicense.secure_url,
            idProof : uploadResultOfId.secure_url,
            availability: {
                trips: jsonObjectOfAvailability.trips,
                treks: jsonObjectOfAvailability.treks,
                mergers: jsonObjectOfAvailability.mergers
            }
    
        })
        const info = await companyinfo.save();
        return NextResponse.json({
            message : "Details Saved",
            data : info
        })
    } catch (error) {
        console.error('Error Creating Profile :', error);
        return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
        });
    }
    
}



export async function UploadFile(fileName){
    const type  = fileName.type;
    let isImage  = false;
    if(type =="image/jpg" || type == "image/jpeg" || type == "image/png"){
        isImage = true;
    }
    const arrayBuffer = await fileName.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const uploadResult = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
            isImage
            ? {
                use_filename: true,
                unique_filename: true,
                folder: "bagspackgo",
                transformation: [
                    { width: 800, height: 800, crop: "limit" },
                    { quality: "auto" },
                    { fetch_format: "jpg" },
                ],
                }
            : {
                use_filename: true,
                unique_filename: true,
                folder: "bagspackgo",
                resource_type: "raw", // for PDFs and other non-image files
                },
            (error, result) => {
            if (error) reject(error);
            else resolve(result);
            }
        ).end(buffer);
    });
    return uploadResult;

}
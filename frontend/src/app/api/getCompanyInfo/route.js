import { NextResponse } from "next/server";
import connectDB from "src/DB/DBConnection";
import { providerCompanyModel } from "src/models/providerCompanyModel";
export async function GET(req){
    await connectDB();
    const providerId = req.nextUrl.searchParams.get('providerId');
    console.log(providerId);
    const companyInfo = await providerCompanyModel.findOne({providerId});
    console.log(companyInfo);
    if(!companyInfo){
        return NextResponse.json({
            message : "Company Not Found"
        })
    }
    return NextResponse.json({
        message : "Company Found",
        data : companyInfo
    })

}
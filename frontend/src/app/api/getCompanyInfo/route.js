import { NextResponse } from "next/server";
import connectDB from "src/DB/DBConnection";
import { providerCompanyModel } from "src/models/providerCompanyModel";
export async function GET(req){
    try {
        await connectDB();
        const providerId = req.nextUrl.searchParams.get('providerId');
        console.log(providerId);
        const companyInfo = await providerCompanyModel.findOne({providerId});
        if(!companyInfo){
            return NextResponse.json({
                message : "Company Not Found"
            })
        }
        return NextResponse.json({
            message : "Company Found",
            data : companyInfo
        })
    } catch (error) {
        console.error('Error Getting Company :', error);
        return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
        });
    }

}
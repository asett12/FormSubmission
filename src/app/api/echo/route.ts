export async function POST(request: Request){
    const data = await request.json();
    if (typeof data?.name !== "string" || typeof data?.age !== "number"){
        return Response.json({error:"Invalid Payload"},{status:400})
    }
    return Response.json({message : `Hello ${data.name}, you are ${data.age} years old`});
}

export async function GET(request: Request){
    return Response.json({hint: "POST JSON to this endpoint"});
}


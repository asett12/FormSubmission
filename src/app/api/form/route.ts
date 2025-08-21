type ApiError = {field?:string; message:string};

function validateEmail(email:string){
    return /\S+@\S+\.\S+/.test(email);
}

export async function POST(request:Request){
    const fd = await request.formData();
    const name = fd.get('name');
    const email = fd.get('email');
    const file = fd.get('avatar')
    const errors : ApiError[] = [];

    if (typeof name!=="string" || name.trim()===""){
        errors.push({field:"name", message:"Name is required"})
    } else if (name.length<2){
        errors.push({field:"name", message:"Name must have at least 2 characters"})
    }

    if (typeof email!=="string" || email.trim()===""){
        errors.push({field:"email", message:"Email is required"})
    } else if (!validateEmail(email)){
        errors.push({field:"email", message:"Email format looks invalid"})
    }

    if (file !== null){
        if (!(file instanceof File)){
            errors.push({ field: "avatar", message: "Invalid file payload" });
        } else {
            const maxSize = 2 * 1024 * 1024;
            if (!file.type.startsWith("image/")){
                errors.push({ field: "avatar", message: "Only image files are allowed" });
            }
            if (file.size > maxSize){
                errors.push({ field: "avatar", message: "Max file size is 2MB" })
            }
        }
    }

    if (errors.length){
        return Response.json({ ok: false, errors }, { status: 400 });
    }

    const fileMeta = file && file instanceof File
        ?  { name: file.name, size: file.size, type: file.type }
        :   null;

    return Response.json({
        ok: true,
        data: { name, email, file: fileMeta },
        message: `Thanks, ${name}! We'll contact you at ${email}.`,
    });
}

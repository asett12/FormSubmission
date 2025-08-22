import { getSupabaseAdmin } from "../../../../lib/supabaseServer";

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

    const supabase = getSupabaseAdmin();
    let avatarPath: string | null = null;
    let avatarUrl: string | null = null;

    if (file && file instanceof File){
        const ext = (file.name.split(".").pop() || "bin").toLowerCase();
        const fileName = `${crypto.randomUUID()}.${ext}`
        const path = `avatars/${fileName}`

        const {error: uploadErr, data: uploaded} = await supabase
            .storage
            .from('avatars')
            .upload(path, file, {
                contentType: file.type || 'application/octet-stream',
                upsert: false
            });

        if (uploadErr){
            return Response.json(
                { ok: false, errors: [{ field: 'avatar', message: uploadErr.message }] },
                { status: 400 }
            );
        }
        

        avatarPath = uploaded?.path ?? path;

        const { data: pub } = supabase.storage
            .from('avatars')
            .getPublicUrl(avatarPath);
        avatarUrl = pub.publicUrl || null;
    }
    

    if (errors.length){
        return Response.json({ ok: false, errors }, { status: 400 });
    }
    
    const {data: row, error: dbErr} = await supabase
        .from('submissions')
        .insert({
            name,
            email,
            avatar_path: avatarPath,
            avatar_url: avatarUrl,
        })
        .select()
        .single()

        if (dbErr) {
            return Response.json(
                { ok: false, errors: [{ message: dbErr.message }] },
                { status: 500 }
            );
        };

        return Response.json({
            ok: true,
            data: row,
            message: `Thanks, ${name}! We'll contact you at ${email}.`,
        });
}

export async function DELETE(request:Request){
    
}
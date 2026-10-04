export function buildFormData(fields:Record<string,unknown>): FormData 
{
    const formData = new FormData();

    for(const [key,value] of Object.entries(fields))
    {
        if(value === undefined || value === null) continue;

        if(value instanceof File || value instanceof Blob)
        {
            formData.append(key,value);
            continue;
        }
        if(value instanceof Date)
        {
            formData.append(key,value.toISOString());
            continue;
        }
        if(typeof value === "boolean")
        {
            formData.append(key,String(value));
            continue;
        }
        if(Array.isArray(value))
        {
            for(let item of value)
            {
                formData.append(key,String(item));
            }
            continue;
        }
        if(typeof value === 'object')
        {
            formData.append(key,JSON.stringify(value));
            continue;
        }

        formData.append(key,String(value));
    }

    return formData;
}



// when given as formData.append(key,value)
//Why TypeScript is Stopping You
// Your value variable likely has a broad type like any, unknown, 
// or an object type {}, and TypeScript is matching it against the 
// 3 native browser definitions ("overloads") for .append():
// 1. append(name, string | Blob)
// 2. append(name, string)
// 3. append(name, Blob, filename)
// Because a plain object ({}) is neither a plain text string nor 
// a binary Blob object, TypeScript blocks the build to prevent a silent 
// upload failure or [object Object] from being sent to your API server.
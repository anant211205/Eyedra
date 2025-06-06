import axios from "axios";

export const uploadToCloudinary = async (
        buffer: Buffer, 
        filename: string, 
        mimeType: string
    ) => {
        
        const formData = new FormData();
        const uint8Array = new Uint8Array(buffer);
        const blob = new Blob(
            [uint8Array], 
            { type: mimeType }
        );
        
        formData.append("file", blob, filename);
        formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);
        const response = await axios.post(
            `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
            formData
        );
        
        return response.data;
};

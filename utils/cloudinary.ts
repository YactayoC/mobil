// utils/cloudinary.ts
import axios from "axios";

const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dnt7ig9r4/image/upload";
const UPLOAD_PRESET = "Alex639";

/**
 * Sube una imagen a Cloudinary y retorna la URL.
 * Si el archivo ya es una URL (empieza con http), retorna la misma URL.
 */
export async function uploadToCloudinary(
  archivo: File | string
): Promise<string> {
  if (typeof archivo === "string" && archivo.startsWith("http")) {
    return archivo;
  }

  const formData = new FormData();
  formData.append("file", archivo);
  formData.append("upload_preset", UPLOAD_PRESET);

  try {
    const response = await axios.post(CLOUDINARY_URL, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    if (!response.data.secure_url) {
      throw new Error("Cloudinary no devolvió una URL válida.");
    }
    return response.data.secure_url;
  } catch (error) {
    console.error("Error en uploadToCloudinary:", error);
    return "";
  }
}

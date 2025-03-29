export async function uploadMedia(file: any) {
    const formData = new FormData();

    formData.append("image", file);

    const response = await fetch(`http://${process.env.DB_HOST}/api/upload.php`, {
        method: "POST",
        body: formData,
    });
    const data = await response.json();

    return data;
}
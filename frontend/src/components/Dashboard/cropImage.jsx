import { createCanvas, loadImage } from 'canvas';

const getCroppedImg = async (imageSrc, croppedAreaPixels) => {
  try {
    const image = await loadImage(imageSrc);
    const canvas = createCanvas(croppedAreaPixels.width, croppedAreaPixels.height);
    const ctx = canvas.getContext('2d');

    // Draw the cropped area onto the canvas
    ctx.drawImage(
      image,
      croppedAreaPixels.x,
      croppedAreaPixels.y,
      croppedAreaPixels.width,
      croppedAreaPixels.height,
      0,
      0,
      croppedAreaPixels.width,
      croppedAreaPixels.height
    );

    // Return the cropped image as a data URL
    return canvas.toDataURL('image/jpeg', 0.8); // Adjust quality here (0.8 = 80%)
  } catch (error) {
    console.error('Error in getCroppedImg:', error);
    throw error;
  }
};

export default getCroppedImg;
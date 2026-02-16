import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { Area } from 'react-easy-crop';

interface ImageCropModalProps {
  image: string;
  onComplete: (croppedImage: string) => void;
  onCancel: () => void;
}

const ImageCropModal: React.FC<ImageCropModalProps> = ({ image, onComplete, onCancel }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createCroppedImage = async () => {
    if (!croppedAreaPixels) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imageElement = new Image();
    imageElement.src = image;

    await new Promise((resolve) => {
      imageElement.onload = resolve;
    });

    // Resize to max 256x256 for profile pictures
    const MAX_SIZE = 256;
    const scale = Math.min(MAX_SIZE / croppedAreaPixels.width, MAX_SIZE / croppedAreaPixels.height, 1);
    canvas.width = Math.round(croppedAreaPixels.width * scale);
    canvas.height = Math.round(croppedAreaPixels.height * scale);

    // Draw the cropped and resized image
    ctx.drawImage(
      imageElement,
      croppedAreaPixels.x,
      croppedAreaPixels.y,
      croppedAreaPixels.width,
      croppedAreaPixels.height,
      0,
      0,
      canvas.width,
      canvas.height
    );

    // Convert to data URL with higher compression
    const croppedImageUrl = canvas.toDataURL('image/jpeg', 0.8);
    onComplete(croppedImageUrl);
  };

  return (
    <div className="fixed inset-0 z-1003 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xl animate-fadeIn">
      <div className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-[3rem] chic-shadow border border-slate-100 dark:border-slate-700 relative animate-slideUp overflow-hidden">
        {/* Header */}
        <div className="py-6 px-8 border-b border-slate-100 dark:border-slate-700">
          <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Adjust Your Photo</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Move and zoom to crop your image</p>
        </div>

        {/* Crop Area */}
        <div className="relative w-full h-96 bg-slate-900">
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>

        {/* Controls */}
        <div className="py-6 px-8 flex flex-col gap-5">
          {/* Zoom Slider */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[3px]">Zoom</label>
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-blue-500 [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 h-12 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white font-black rounded-2xl tracking-[3px] uppercase text-xs hover:bg-slate-200 dark:hover:bg-slate-600 transition-all active:scale-95"
            >
              Cancel
            </button>
            <button
              onClick={createCroppedImage}
              className="flex-1 h-12 bg-blue-500 text-white font-black rounded-2xl tracking-[3px] uppercase text-xs hover:bg-blue-600 transition-all active:scale-95"
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageCropModal;

import { memo, useRef, useState, useEffect } from 'react';
import { validateImageFile, createPreviewUrl } from '../utils/imageUtils';

function ImageUpload({ currentImageUrls = [], onImagesChange, error }) {
  const [images, setImages] = useState({
    front: null,
    back: null,
    defect: null,
  });

  const [previews, setPreviews] = useState({
    front: null,
    back: null,
    defect: null,
  });

  const [errors, setErrors] = useState({
    front: null,
    back: null,
    defect: null,
  });

  const frontInputRef = useRef(null);
  const backInputRef = useRef(null);
  const defectInputRef = useRef(null);

  // Initialize previews if editing an existing listing
  useEffect(() => {
    if (currentImageUrls && currentImageUrls.length > 0) {
      setPreviews({
        front: currentImageUrls[0] || null,
        back: currentImageUrls[1] || null,
        defect: currentImageUrls[2] || null,
      });
      setImages({
        front: currentImageUrls[0] || null,
        back: currentImageUrls[1] || null,
        defect: currentImageUrls[2] || null,
      });
    }
  }, [currentImageUrls]);

  const handleFileChange = (slot, file) => {
    if (!file) return;

    const validationError = validateImageFile(file);
    if (validationError) {
      setErrors((prev) => ({ ...prev, [slot]: validationError }));
      return;
    }

    // Revoke old blob URL if any
    if (previews[slot] && previews[slot].startsWith('blob:')) {
      URL.revokeObjectURL(previews[slot]);
    }

    const previewUrl = createPreviewUrl(file);
    const nextPreviews = { ...previews, [slot]: previewUrl };
    const nextImages = { ...images, [slot]: file };

    setPreviews(nextPreviews);
    setImages(nextImages);
    setErrors((prev) => ({ ...prev, [slot]: null }));

    onImagesChange(nextImages);
  };

  const handleRemove = (slot) => {
    if (!window.confirm('Are you sure you want to remove this image?')) return;

    if (previews[slot] && previews[slot].startsWith('blob:')) {
      URL.revokeObjectURL(previews[slot]);
    }

    const nextPreviews = { ...previews, [slot]: null };
    const nextImages = { ...images, [slot]: null };

    setPreviews(nextPreviews);
    setImages(nextImages);
    setErrors((prev) => ({ ...prev, [slot]: null }));

    onImagesChange(nextImages);

    // Reset input value
    if (slot === 'front' && frontInputRef.current) frontInputRef.current.value = '';
    if (slot === 'back' && backInputRef.current) backInputRef.current.value = '';
    if (slot === 'defect' && defectInputRef.current) defectInputRef.current.value = '';
  };

  const slots = [
    { key: 'front', label: 'Front View *', ref: frontInputRef },
    { key: 'back', label: 'Back View *', ref: backInputRef },
    { key: 'defect', label: 'Condition/Defect Image *', ref: defectInputRef },
  ];

  return (
    <div className="space-y-4">
      <span className="block text-sm font-semibold text-gray-300">
        Product Images (All 3 required)
      </span>

      <div className="grid gap-6 sm:grid-cols-3">
        {slots.map(({ key, label, ref }) => {
          const preview = previews[key];
          const hasImage = !!preview;
          const slotError = errors[key];

          return (
            <div key={key} className="flex flex-col">
              <span className="mb-2 text-xs font-medium text-gray-400">{label}</span>
              
              {hasImage ? (
                <div className="relative group aspect-square rounded-xl border border-white/10 bg-white/5 overflow-hidden backdrop-blur-md">
                  <img
                    src={preview}
                    alt={label}
                    className="h-full w-full object-contain p-2 transition duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => ref.current?.click()}
                      className="rounded-lg bg-white/20 backdrop-blur px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/30 transition"
                    >
                      Change
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemove(key)}
                      className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 transition"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => ref.current?.click()}
                  className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/20 bg-white/5 backdrop-blur-md transition hover:border-violet-500/50 hover:bg-white/10"
                >
                  <svg className="mb-2 h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="text-xs font-medium text-gray-300">Upload {key} view</span>
                  <span className="mt-1 text-[10px] text-gray-500">Max 5MB</span>
                </div>
              )}

              <input
                ref={ref}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={(e) => handleFileChange(key, e.target.files?.[0])}
                className="hidden"
              />

              {slotError && (
                <p className="mt-1 text-xs text-red-400 font-medium">{slotError}</p>
              )}
            </div>
          );
        })}
      </div>

      {error && <p className="text-sm text-red-400 font-medium mt-2">{error}</p>}
    </div>
  );
}

export default memo(ImageUpload);

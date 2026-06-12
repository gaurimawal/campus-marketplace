import { memo, useState } from 'react';
import { useForm } from 'react-hook-form';
import ImageUpload from './ImageUpload';
import { CATEGORIES, CONDITIONS, STATUSES } from '../utils/constants';

function ListingForm({ defaultValues, onSubmit, isSubmitting, submitLabel = 'Create Listing' }) {
  const [images, setImages] = useState({
    front: defaultValues?.imageUrls?.[0] || defaultValues?.imageUrl || null,
    back: defaultValues?.imageUrls?.[1] || null,
    defect: defaultValues?.imageUrls?.[2] || null,
  });
  const [imageError, setImageError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: defaultValues || {
      productName: '',
      category: 'Textbooks',
      condition: 'Good',
      price: '',
      description: '',
      contact: '',
      pickupSpot: '',
      purchaseYear: '',
      usageDuration: '',
      status: 'Available',
    },
  });

  const handleImagesChange = (nextImages) => {
    setImages(nextImages);
    setImageError(null);
  };

  const handleFormSubmit = (data) => {
    const isEditing = !!defaultValues;
    const hasFront = !!images.front;
    const hasBack = !!images.back;
    const hasDefect = !!images.defect;

    if (!hasFront || !hasBack || !hasDefect) {
      setImageError('Minimum 3 images are required: Front View, Back View, and Condition/Defect image.');
      return;
    }

    onSubmit({ ...data, images });
  };

  const currentUrls = defaultValues?.imageUrls || 
    (defaultValues?.imageUrl ? [defaultValues.imageUrl, '', ''] : []);

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <ImageUpload
        currentImageUrls={currentUrls}
        onImagesChange={handleImagesChange}
        error={imageError}
      />

      <div>
        <label htmlFor="productName" className="mb-1 block text-sm font-medium text-gray-300">
          Product Title *
        </label>
        <input
          id="productName"
          {...register('productName', { required: 'Product title is required' })}
          className="input-field bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-violet-500/50"
          placeholder="e.g. Casio fx-991EX Calculator, HC Verma Physics Vol 1"
        />
        {errors.productName && (
          <p className="mt-1 text-sm text-red-400 font-medium">{errors.productName.message}</p>
        )}
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        <div>
          <label htmlFor="category" className="mb-1 block text-sm font-medium text-gray-300">
            Category *
          </label>
          <select
            id="category"
            {...register('category', { required: 'Category is required' })}
            className="input-field bg-white/5 border-white/10 text-white focus:border-violet-500/50"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat} className="bg-slate-900 text-white">
                {cat}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="mt-1 text-sm text-red-400 font-medium">{errors.category.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="condition" className="mb-1 block text-sm font-medium text-gray-300">
            Condition *
          </label>
          <select
            id="condition"
            {...register('condition', { required: 'Condition is required' })}
            className="input-field bg-white/5 border-white/10 text-white focus:border-violet-500/50"
          >
            {CONDITIONS.map((condition) => (
              <option key={condition} value={condition} className="bg-slate-900 text-white">
                {condition}
              </option>
            ))}
          </select>
          {errors.condition && (
            <p className="mt-1 text-sm text-red-400 font-medium">{errors.condition.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="price" className="mb-1 block text-sm font-medium text-gray-300">
            Price (INR) *
          </label>
          <input
            id="price"
            type="number"
            step="0.01"
            min="0"
            {...register('price', {
              required: 'Price is required',
              min: { value: 0, message: 'Price must be non-negative' },
            })}
            className="input-field bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-violet-500/50"
            placeholder="e.g. 450"
          />
          {errors.price && (
            <p className="mt-1 text-sm text-red-400 font-medium">{errors.price.message}</p>
          )}
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        <div>
          <label htmlFor="purchaseYear" className="mb-1 block text-sm font-medium text-gray-300">
            Purchase Year
          </label>
          <input
            id="purchaseYear"
            type="number"
            min="1990"
            max={new Date().getFullYear()}
            {...register('purchaseYear', {
              max: { value: new Date().getFullYear(), message: 'Cannot be in the future' },
            })}
            className="input-field bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-violet-500/50"
            placeholder="e.g. 2023"
          />
          {errors.purchaseYear && (
            <p className="mt-1 text-sm text-red-400 font-medium">{errors.purchaseYear.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="usageDuration" className="mb-1 block text-sm font-medium text-gray-300">
            Usage Duration
          </label>
          <input
            id="usageDuration"
            {...register('usageDuration')}
            className="input-field bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-violet-500/50"
            placeholder="e.g. 1 semester, 6 months"
          />
        </div>

        <div>
          <label htmlFor="status" className="mb-1 block text-sm font-medium text-gray-300">
            Product Status
          </label>
          <select
            id="status"
            {...register('status')}
            className="input-field bg-white/5 border-white/10 text-white focus:border-violet-500/50"
          >
            {STATUSES.map((status) => (
              <option key={status} value={status} className="bg-slate-900 text-white">
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="description" className="mb-1 block text-sm font-medium text-gray-300">
          Description *
        </label>
        <textarea
          id="description"
          rows={4}
          {...register('description', { required: 'Description is required' })}
          className="input-field bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-violet-500/50 resize-none"
          placeholder="Describe your resource. Note down textbook edition, wear & tear, any highlighted pages, etc."
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-400 font-medium">{errors.description.message}</p>
        )}
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="contact" className="mb-1 block text-sm font-medium text-gray-300">
            Seller Contact Number *
          </label>
          <input
            id="contact"
            type="tel"
            {...register('contact', {
              required: 'Contact number is required',
              pattern: {
                value: /^[\d\s\-+()]{7,20}$/,
                message: 'Enter a valid phone number',
              },
            })}
            className="input-field bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-violet-500/50"
            placeholder="e.g. +91 98765 43210"
          />
          {errors.contact && (
            <p className="mt-1 text-sm text-red-400 font-medium">{errors.contact.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="pickupSpot" className="mb-1 block text-sm font-medium text-gray-300">
            Campus Pickup Spot
          </label>
          <input
            id="pickupSpot"
            {...register('pickupSpot')}
            className="input-field bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-violet-500/50"
            placeholder="e.g. Library front steps, hostel 3 lobby"
          />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={isSubmitting} className="btn-primary w-full sm:w-auto">
          {isSubmitting ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  );
}

export default memo(ListingForm);

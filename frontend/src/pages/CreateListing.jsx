import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import ListingForm from '../components/ListingForm';
import { listingsApi, uploadApi } from '../services/api';

function CreateListing() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      toast.info('Uploading 3 product images...');
      
      const uploadPromises = ['front', 'back', 'defect'].map(async (key) => {
        const fileOrUrl = formData.images[key];
        if (fileOrUrl instanceof File) {
          return await uploadApi.uploadImage(fileOrUrl);
        }
        return fileOrUrl || '';
      });

      const imageUrls = await Promise.all(uploadPromises);

      const listing = await listingsApi.create({
        productName: formData.productName,
        category: formData.category,
        condition: formData.condition,
        price: Number(formData.price),
        description: formData.description,
        contact: formData.contact,
        pickupSpot: formData.pickupSpot,
        purchaseYear: formData.purchaseYear ? Number(formData.purchaseYear) : null,
        usageDuration: formData.usageDuration || '',
        status: formData.status || 'Available',
        imageUrl: imageUrls[0] || '',
        imageUrls,
      });

      toast.success('Listing created successfully!');
      navigate(`/listings/${listing.listingId}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <Link to="/" className="mb-6 inline-flex items-center text-sm text-primary-600 hover:text-primary-700">
        <svg className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to listings
      </Link>

      <div className="card p-6 md:p-8">
        <h1 className="mb-2 text-2xl font-bold text-gray-900">Create New Listing</h1>
        <p className="mb-8 text-gray-400">List textbooks, calculators, lab gear, instruments, or study materials for nearby students.</p>
        <ListingForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
      </div>
    </div>
  );
}

export default CreateListing;

import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useListing } from '../hooks/useListing';
import ListingForm from '../components/ListingForm';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { listingsApi, uploadApi } from '../services/api';

function EditListing() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { listing, loading, error, refetch } = useListing(id);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      toast.info('Uploading product images...');

      const uploadPromises = ['front', 'back', 'defect'].map(async (key, index) => {
        const fileOrUrl = formData.images[key];
        if (fileOrUrl instanceof File) {
          return await uploadApi.uploadImage(fileOrUrl);
        }
        return fileOrUrl || listing.imageUrls?.[index] || '';
      });

      const imageUrls = await Promise.all(uploadPromises);

      await listingsApi.update(id, {
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

      toast.success('Listing updated successfully!');
      navigate(`/listings/${id}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner fullPage message="Loading listing..." />;
  if (error) return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <ErrorMessage message={error} onRetry={refetch} />
    </div>
  );
  if (!listing) return null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <Link to={`/listings/${id}`} className="mb-6 inline-flex items-center text-sm text-primary-600 hover:text-primary-700">
        <svg className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to listing
      </Link>

      <div className="card p-6 md:p-8">
        <h1 className="mb-2 text-2xl font-bold text-gray-900">Edit Listing</h1>
        <p className="mb-8 text-gray-600">Update your listing details.</p>
        <ListingForm
          defaultValues={{
            productName: listing.productName,
            category: listing.category,
            condition: listing.condition || 'Good',
            price: listing.price,
            description: listing.description,
            contact: listing.contact,
            pickupSpot: listing.pickupSpot || '',
            imageUrl: listing.imageUrl,
            imageUrls: listing.imageUrls || [listing.imageUrl || '', '', ''],
            purchaseYear: listing.purchaseYear || '',
            usageDuration: listing.usageDuration || '',
            status: listing.status || 'Available',
          }}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          submitLabel="Update Listing"
        />
      </div>
    </div>
  );
}

export default EditListing;

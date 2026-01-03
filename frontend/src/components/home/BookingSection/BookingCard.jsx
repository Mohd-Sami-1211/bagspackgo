import { motion } from 'framer-motion';

const BookingCard = ({ booking, onClick }) => {
  const categoryColors = {
    Trek: 'bg-emerald-500',
    Trip: 'bg-blue-500',
    Event: 'bg-purple-500'
  };

  // Determine category from eventType
  const getCategory = (eventType) => {
    if (eventType?.toLowerCase().includes('trek')) return 'Trek';
    if (eventType?.toLowerCase().includes('trip')) return 'Trip';
    return 'Event';
  };
  console.log(booking)
  // Map API fields to display values
  const category = getCategory(booking.eventType);
  const name = booking.title;
  const guide = booking.guide || 'Guide TBA';
  const destination = booking.destination;
  const image = booking.posterFile || "";
  const duration = booking.duration ? `${booking.duration} days` : 'N/A';
  const people = booking.bookings || 1;
  const amount = booking.amountPaid;

  const rupee = (value) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.01 }}
      whileTap={{ scale: 0.995 }}
      onClick={onClick}
      className="relative bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100 cursor-pointer transition-all group"
    >
      {/* header image + overlay */}
      <div className="relative h-44 sm:h-40 lg:h-44">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${image})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 to-transparent" />
        <div className="absolute left-4 right-4 bottom-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className={`w-3 h-3 rounded-full ${categoryColors[category] || 'bg-gray-400'}`} />
              <h3 className="text-white text-lg font-semibold leading-tight">{name}</h3>
            </div>
            <p className="text-xs text-white/80 mt-1">{destination}</p>
          </div>

          <div className="text-right">
            <span className="inline-block bg-white/10 text-white text-xs px-3 py-1 rounded-full">
              {category}
            </span>
          </div>
        </div>
      </div>

      {/* body */}
      <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
        <div>
          <p className="text-gray-400 text-xs">Guide</p>
          <p className="text-gray-800 font-medium">{guide}</p>
        </div>

        <div>
          <p className="text-gray-400 text-xs">Date</p>
          <p className="text-gray-800 font-medium">
            {booking.date ? new Date(booking.date).toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric'
            }) : 'TBA'}
          </p>
        </div>

        <div>
          <p className="text-gray-400 text-xs">People</p>
          <p className="text-gray-800 font-medium">{people}</p>
        </div>

        <div>
          <p className="text-gray-400 text-xs">Duration</p>
          <p className="text-gray-800 font-medium">{duration}</p>
        </div>

        <div>
          <p className="text-gray-400 text-xs">Destination</p>
          <p className="text-gray-800 font-medium">{destination}</p>
        </div>

        <div className="flex flex-col items-start">
          <p className="text-gray-400 text-xs">Amount Paid</p>
          <div className="mt-1">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-500 text-white font-bold">
              {amount ? rupee(amount) : 'Free'}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default BookingCard;
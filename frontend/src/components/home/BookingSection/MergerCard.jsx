import { motion } from 'framer-motion';

const MergerCard = ({ merger, onClick }) => {
  const rupee = (value) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.01 }}
      whileTap={{ scale: 0.995 }}
      onClick={onClick}
      className="relative bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100 cursor-pointer transition-all group"
    >
      {/* header image */}
      <div className="relative h-40">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${merger.image})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute left-4 right-4 bottom-4 flex items-center justify-between">
          <div>
            <h3 className="text-white text-lg font-semibold">{merger.name}</h3>
            <p className="text-xs text-white/80 mt-1">{merger.location}</p>
          </div>

          <div className="text-right">
            <span
              className={`inline-block text-xs px-3 py-1 rounded-full ${
                merger.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
              }`}
            >
              {merger.status}
            </span>
          </div>
        </div>
      </div>

      {/* details */}
      <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
        <div>
          <p className="text-gray-400 text-xs">Guide</p>
          <p className="text-gray-800 font-medium">{merger.guide}</p>
        </div>

        <div>
          <p className="text-gray-400 text-xs">Destination</p>
          <p className="text-gray-800 font-medium">{merger.destination}</p>
        </div>

        <div>
          <p className="text-gray-400 text-xs">Date</p>
          <p className="text-gray-800 font-medium">
            {new Date(merger.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
          </p>
        </div>

        <div>
          <p className="text-gray-400 text-xs">Members</p>
          <p className="text-gray-800 font-medium">{merger.members}</p>
        </div>

        <div>
          <p className="text-gray-400 text-xs">Seats Left</p>
          <p className="text-gray-800 font-medium">{`${Math.max(0, parseInt(merger.capacity) - parseInt(merger.members.split('/')[0]))} seats`}</p>
        </div>

        <div className="flex flex-col items-start">
          <p className="text-gray-400 text-xs">Paid Amount</p>
          <div className="mt-1">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-500 text-white font-bold">
              {rupee(merger.price)}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MergerCard;

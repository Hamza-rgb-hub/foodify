import { motion } from 'framer-motion';

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-white dark:bg-gray-950 flex flex-col items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex flex-col items-center gap-6"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 rounded-full border-4 border-orange-100 border-t-orange-500"
        />
        <div className="text-center">
          <p className="text-2xl font-bold text-gradient" style={{ fontFamily: "'Playfair Display', serif" }}>
            FoodieRush
          </p>
          <p className="text-sm text-gray-400 mt-1">Loading your experience…</p>
        </div>
      </motion.div>
    </div>
  );
}

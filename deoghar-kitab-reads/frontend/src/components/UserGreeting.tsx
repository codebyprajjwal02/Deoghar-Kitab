import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";

interface UserGreetingProps {
  name: string;
}

const UserGreeting = ({ name }: UserGreetingProps) => {
  // Extract first name if full name is provided
  const firstName = name.split(' ')[0] || name;

  return (
    <div className="container mx-auto px-4 py-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 shadow-lg"
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Animated book icon */}
            <motion.div
              animate={{ 
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse"
              }}
              className="bg-blue-500 p-3 rounded-full"
            >
              <BookOpen className="w-8 h-8 text-white" />
            </motion.div>
            
            {/* Greeting text */}
            <div>
              <motion.h2 
                className="text-2xl font-bold text-gray-800"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                Hello, <span className="text-blue-600">{firstName}</span>! 👋
              </motion.h2>
              <motion.p 
                className="text-gray-600"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                Welcome back to Deoghar Kitab
              </motion.p>
            </div>
          </div>
          
          {/* Animated decorative elements */}
          <div className="flex gap-2">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="w-3 h-3 bg-blue-400 rounded-full"
                animate={{
                  y: [0, -10, 0],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2
                }}
              />
            ))}
          </div>
        </div>
        
        {/* Animated underline */}
        <motion.div
          className="h-1 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full mt-4"
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ duration: 1, delay: 0.5 }}
        />
      </motion.div>
    </div>
  );
};

export default UserGreeting;
import { motion } from 'framer-motion';

const ScrollReveal = ({ children, delay = 0, yOffset = 20 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: yOffset }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.6, delay: delay, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
};

export default ScrollReveal;

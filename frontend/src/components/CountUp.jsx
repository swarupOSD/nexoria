import { useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

const CountUp = ({ value, duration = 2, prefix = '', suffix = '' }) => {
  const [inView, setInView] = useState(false);
  const springValue = useSpring(0, { duration: duration * 1000, bounce: 0 });
  const displayValue = useTransform(springValue, (current) => {
    return prefix + Math.floor(current).toLocaleString() + suffix;
  });

  useEffect(() => {
    if (inView && typeof value === 'number') {
      springValue.set(value);
    }
  }, [inView, value, springValue]);

  if (typeof value !== 'number') return <span>{value}</span>;

  return (
    <motion.span 
      whileInView={() => { setInView(true); return {}; }} 
      viewport={{ once: true }}
    >
      {displayValue}
    </motion.span>
  );
};

export default CountUp;

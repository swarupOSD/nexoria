import { useSelector } from 'react-redux';
import PremiumAdWrapper from './PremiumAdWrapper';

const AdPlacement = ({ location, className = '' }) => {
  const { user } = useSelector(state => state.auth);
  
  const isAdmin = user && (user.role === 'admin' || user.role === 'superadmin');
  const isPremiumUser = user && user.isPremium;
  
  if (isAdmin || isPremiumUser) return null;

  return (
    <PremiumAdWrapper className={className} dataAdSlot="TEST_SLOT" />
  );
};

export default AdPlacement;

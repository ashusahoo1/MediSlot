import { MapPin } from 'lucide-react';

const MarkerIcon = ({ size = '2x', color = 'red', selected = false }) => {
  const pixelSize = size === '2x' ? 24 : size === '4x' ? 36 : size;
  return (
    <MapPin
      className={selected ? 'marker-bounce' : ''}
      size={pixelSize}
      color={color}
      fill={selected ? color : 'none'}
      strokeWidth={2}
    />
  );
};

export default MarkerIcon;

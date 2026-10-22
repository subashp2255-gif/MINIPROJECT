import React from 'react';
import { Wheat, Package, Layers, Sparkles } from 'lucide-react';

export interface CropThumbnailProps {
  category?: string;
  name?: string;
  imageUrl?: string;
  size?: number;
  className?: string;
}

export const CropThumbnail: React.FC<CropThumbnailProps> = ({
  category = 'rice',
  name = '',
  imageUrl,
  size = 56,
  className = '',
}) => {
  const [imgFailed, setImgFailed] = React.useState(false);

  // Category based icons and subtle tints
  const getCategoryDetails = () => {
    const cat = (category || '').toLowerCase();
    if (cat.includes('rice') || cat.includes('paddy')) {
      return {
        bg: 'bg-[#E7F5EE]',
        text: 'text-[#14532D]',
        label: 'Paddy',
        icon: <Wheat size={Math.round(size * 0.44)} strokeWidth={2} />,
      };
    }
    if (cat.includes('pulse') || cat.includes('dal') || cat.includes('gram')) {
      return {
        bg: 'bg-[#FEF3C7]',
        text: 'text-[#8C5D17]',
        label: 'Pulses',
        icon: <Package size={Math.round(size * 0.44)} strokeWidth={2} />,
      };
    }
    if (cat.includes('wheat')) {
      return {
        bg: 'bg-[#FFF7ED]',
        text: 'text-[#C2410C]',
        label: 'Wheat',
        icon: <Wheat size={Math.round(size * 0.44)} strokeWidth={2} />,
      };
    }
    if (cat.includes('millet') || cat.includes('grain')) {
      return {
        bg: 'bg-[#F4FBF3]',
        text: 'text-[#14532D]',
        label: 'Millets',
        icon: <Layers size={Math.round(size * 0.44)} strokeWidth={2} />,
      };
    }
    return {
      bg: 'bg-[#F7F4EC]',
      text: 'text-[#8C5D17]',
      label: 'Crops',
      icon: <Sparkles size={Math.round(size * 0.44)} strokeWidth={2} />,
    };
  };

  const details = getCategoryDetails();

  if (imageUrl && !imgFailed && !imageUrl.includes('placeholder')) {
    return (
      <div
        style={{ width: size, height: size }}
        className={`rounded-xl overflow-hidden border border-[#DFE4DC] shrink-0 bg-white ${className}`}
      >
        <img
          src={imageUrl}
          alt={name}
          onError={() => setImgFailed(true)}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      style={{ width: size, height: size }}
      className={`rounded-xl border border-[#DFE4DC] shrink-0 flex flex-col items-center justify-center select-none ${details.bg} ${details.text} ${className}`}
      title={name || details.label}
    >
      {details.icon}
      <span className="text-[10px] font-bold mt-0.5 leading-none opacity-80">
        {details.label}
      </span>
    </div>
  );
};

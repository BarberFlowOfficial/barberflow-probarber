import React, { useState } from 'react';

interface ShopAvatarProps {
    name?: string;
    imageUrl?: string | null;
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'custom';
    customSize?: string;
    className?: string;
}

export const ShopAvatar: React.FC<ShopAvatarProps> = ({
    name = 'Barbearia',
    imageUrl,
    size = 'md',
    customSize,
    className = ""
}) => {
    const [imageError, setImageError] = useState(false);

    // Determine size classes
    const sizeClasses = {
        sm: 'w-8 h-8 text-[10px]',
        md: 'w-10 h-10 text-sm',
        lg: 'w-16 h-16 text-xl',
        xl: 'w-24 h-24 text-3xl',
        custom: ''
    };

    const sizeStyle = size === 'custom' && customSize ? { width: customSize, height: customSize } : {};

    // Fallback initials - safer logic
    const safeName = typeof name === 'string' ? name : 'BarberFlow';
    const initials = safeName.trim().charAt(0).toUpperCase() || 'B';

    // Decide if we show the image
    const showImage = imageUrl && !imageError;

    return (
        <div
            style={sizeStyle}
            className={`
                shrink-0 rounded-full flex items-center justify-center overflow-hidden
                bg-[#00FF9D]/10 border border-[#00FF9D]/20 text-[#00FF9D] font-bold
                shadow-[0_0_15px_rgba(0,255,157,0.1)] transition-all duration-300
                ${size !== 'custom' ? sizeClasses[size] : ''}
                ${className}
            `}
        >
            {showImage ? (
                <img
                    src={imageUrl!}
                    alt={safeName}
                    className="w-full h-full object-cover"
                    onError={() => setImageError(true)}
                />
            ) : (
                <span className="initials">{initials}</span>
            )}
        </div>
    );
};

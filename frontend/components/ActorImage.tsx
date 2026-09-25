'use client';

import React, { useState } from 'react';
import { normalizePhotoUrl, getInitialsAvatarSvg } from '../utils/imageHelper';

interface ActorImageProps {
  photo: string;
  name: string;
  className?: string;
  style?: React.CSSProperties;
}

export const ActorImage: React.FC<ActorImageProps> = ({
  photo,
  name,
  className = '',
  style = {},
}) => {
  const [hasError, setHasError] = useState(false);

  const initialSrc = normalizePhotoUrl(photo, name);

  if (hasError) {
    return (
      <img
        src={getInitialsAvatarSvg(name)}
        alt={name}
        className={className}
        style={style}
      />
    );
  }

  return (
    <img
      src={initialSrc}
      alt={name}
      className={className}
      style={style}
      onError={() => {
        setHasError(true);
      }}
    />
  );
};

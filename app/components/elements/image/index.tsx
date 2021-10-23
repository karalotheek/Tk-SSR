import React, { FC } from 'react'
import Image from 'next/image'

type Props = {
    src: string;
    className?: string;
    loading?: any; //lazy" | "eager" | undefined
    alt?: string;
    color?: string;
    width?: any;
    height?: any;
};

const Img: FC<Props> = ({ src, width, height, alt = 'Theek Karalo', className, loading }: Props) => {
    return <Image
        className={className}
        src={src} alt={alt}
        width={width}
        height={height}
        loading={loading}
        layout="fill"
        objectFit="cover"
    />
}

export default Img

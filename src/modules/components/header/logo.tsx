import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

export const Logo = () => {
    return (
        <Link href={'/'}>
            <Image src={'/logo.webp'} alt='Karnal Web Tech' width={100} height={100} />
        </Link>
    )
}

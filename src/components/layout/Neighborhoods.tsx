"use client"

import Link from 'next/link'
import Image from 'next/image';

// Define the neighborhood data type
interface Neighborhood {
    id: string;
    name: string;
    image: string;
    alt: string;
    href: string;
}

// Neighborhood data - Add new neighborhoods here!
const neighborhoods: Neighborhood[] = [
    {
        id: 'la-jolla',
        name: 'La Jolla',
        image: '/condo1.jpg',
        alt: 'La Jolla neighborhood',
        href: '/neighborhoods/la-jolla'
    },
    {
        id: 'club-marena',
        name: 'Club Marena',
        image: '/condo2.jpg',
        alt: 'Club Marena neighborhood',
        href: '/neighborhoods/club-marena'
    },
    {
        id: 'seahouse',
        name: 'Seahouse',
        image: '/condo3.jpg',
        alt: 'Seahouse neighborhood',
        href: '/neighborhoods/seahouse'
    },
    {
        id: 'las-olas',
        name: 'Las Olas',
        image: '/condo4.jpg',
        alt: 'Las Olas neighborhood',
        href: '/neighborhoods/las-olas'
    },
    {
        id: 'calafia',
        name: 'Calafia',
        image: '/condo5.jpg',
        alt: 'Calafia neighborhood',
        href: '/neighborhoods/calafia'
    },
    {
        id: 'las-palmas',
        name: 'Las Palmas',
        image: '/condo6.jpg',
        alt: 'Las Palmas neighborhood',
        href: '/neighborhoods/las-palmas'
    },
    {
        id: 'palacio-del-mar',
        name: 'Palacio del Mar',
        image: '/condo7.jpg',
        alt: 'Palacio del Mar neighborhood',
        href: '/neighborhoods/palacio-del-mar'
    },

    {
        id: 'oceana',
        name: 'Oceana',
        image: '/condo8.jpg',
        alt: 'Oceana neighborhood',
        href: '/neighborhoods/oceana'
    }
];

// Reusable neighborhood card component
function NeighborhoodCard({ neighborhood }: { neighborhood: Neighborhood }) {
    return (
        <div className="w-full h-64 relative overflow-hidden rounded shadow-lg hover:shadow-2xl hover:scale-105 hover:-translate-y-2 transition-all duration-300 ease-in-out">
            <Image
                src={neighborhood.image}
                alt={neighborhood.alt}
                fill
                className="w-full h-full object-cover brightness-60"
            />

            <Link
                href={neighborhood.href}
                className="absolute inset-0 transition-all duration-300 flex items-center justify-center"
            >
                <h1 className="text-white font-medium text-3xl underline">
                    {neighborhood.name}
                </h1>
            </Link>
        </div>
    );
}

export default function Neighborhoods() {
    return (
        <div className="w-full py-8 px-4">
            <div className='max-w-6xl mx-auto pt-4'>
                <section>
                    <h1 className='font-medium text-3xl'>Find the Neighborhood For You</h1>
                    <p>The neighborhoods best suited for beachfront living</p>
                    <div className="w-full grid grid-cols-3 md:grid-cols-2 sm:grid-cols-1 gap-4 pt-4 mb-4">
                        {neighborhoods.map((neighborhood) => (
                            <NeighborhoodCard
                                key={neighborhood.id}
                                neighborhood={neighborhood}
                            />
                        ))}
                    </div>

                </section>
                <div className="mt-6 flex justify-start ">
                    <Link href={"/#"} className="rounded bg-blue-600 hover:bg-blue-800 px-4 py-2">
                        <h1 className="text-xl p-2 text-white relative after:content-['→'] after:ml-3 after:text-2xl after:inline-block hover:after:translate-x-1 after:transition-transform pr-4 w-auto">
                            View Beachfront House Developements
                        </h1>
                    </Link>
                </div>
            </div>
        </div>
        
    );
}
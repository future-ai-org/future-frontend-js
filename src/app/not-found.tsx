import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">404 - Page Not Found</h2>
        <p className="text-gray-600 mb-4">The page you are looking for does not exist.</p>
        <Link href="/" className="text-blue-500 hover:text-blue-700">
          Return to Home
        </Link>
      </div>
    </main>
  )
}

export const dynamic = 'force-dynamic' 

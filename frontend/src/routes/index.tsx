import React, { useState } from 'react'
import type { FC, FormEvent } from 'react'
import { createFileRoute } from '@tanstack/react-router'

// Home component with header and form that POSTs to /test
const Home: FC = () => {
  const [username, setUsername] = useState<string>('')
  const [comment, setComment] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const payload = { username, comment }

    try {
      const res = await fetch('http://localhost:3001/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`)
      }

      const data = await res.json()
      console.log('Server response:', data)
      // Optionally reset form
      setUsername('')
      setComment('')
    } catch (err) {
      console.error(err)
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col justify-center items-center h-screen bg-gray-100 p-5">
      {/* Header */}
      <div className="text-center mb-5">
        <h1 className="font-bold text-4xl mb-2">⊹ TEAM 10 ⊹</h1>
        <div className="w-1/2 mx-auto border-b-2 border-black" />
      </div>

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white p-6 rounded-2xl shadow-md space-y-4"
      >
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700">
            Username
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="mt-1 w-full p-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div>
          <label htmlFor="comment" className="block text-sm font-medium text-gray-700">
            Comment
          </label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            required
            rows={4}
            className="mt-1 w-full p-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {error && <p className="text-red-500 text-sm">Error: {error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full p-2 text-sm font-medium rounded-lg border-2 border-green-500 bg-green-500 text-white hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Submitting...' : 'Submit'}
        </button>
      </form>
    </div>
  )
}

// File-based route export
export const Route = createFileRoute('/')({
  component: Home,
})

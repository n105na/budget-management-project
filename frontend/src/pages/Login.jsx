import "../index.css";

export default function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div
        className="p-8 rounded-lg shadow-md w-full max-w-sm"
        style={{ backgroundColor: "var(--secondary)", color: "var(--text)" }}
      >
        <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>
        <form>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2"
              placeholder="you@example.com"
              style={{
                borderColor: "var(--primary)",
                backgroundColor: "white",
                color: "var(--text)",
              }}
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2"
              placeholder="••••••••"
              style={{
                borderColor: "var(--primary)",
                backgroundColor: "white",
                color: "var(--text)",
              }}
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 rounded-md font-semibold transition"
            style={{
              backgroundColor: "var(--primary)",
              color: "var(--background)",
            }}
          >
            Log In
          </button>
        </form>
      </div>
    </div>
  );
}

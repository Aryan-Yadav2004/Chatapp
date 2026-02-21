import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 dark:bg-zinc-950">
      <main className="flex flex-col items-center gap-8 rounded-2xl bg-white p-12 text-center shadow-xl dark:bg-zinc-900 sm:p-16">
        <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-5xl">
          Welcome to Livechat
        </h1>
        <p className="max-w-md text-lg text-zinc-600 dark:text-zinc-400">
          Connect with others in real-time. Sign in to start chatting!
        </p>

        <div className="mt-4 flex items-center justify-center gap-4">
          <SignedIn>
            <div className="flex items-center gap-4 rounded-full bg-zinc-100 px-6 py-3 font-medium text-zinc-900 dark:bg-zinc-800 dark:text-white">
              <span>You are signed in!</span>
              <UserButton />
            </div>
            {/* We will redirect them to their messages page in future steps if they are signed in. For now, this is just a placeholder. */}
          </SignedIn>
          <SignedOut>
            <SignInButton mode="modal">
              <button className="flex h-12 items-center justify-center rounded-full bg-blue-600 px-8 font-medium text-white transition-colors hover:bg-blue-700">
                Sign In to Chat
              </button>
            </SignInButton>
          </SignedOut>
        </div>
      </main>
    </div>
  );
}
